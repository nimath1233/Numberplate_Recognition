"""
=========================================================
Sri Lankan ANPR - Temporal Confidence Plate Voter
=========================================================

Author : Antigravity ANPR Engine

Maintains a sliding temporal window of detected plate candidates
across consecutive video frames to produce stable, noise-free
consensus plate readings and eliminate single-frame OCR misreads
(e.g., 'B' vs '8', 'O' vs '0', 'D' vs '0') and temporal lighting/shadow drops.

Temporal Logic Architecture:
FULL reading
     ↓
Store as candidate
     ↓
Subsequent OCR
     ↓
┌───────────────────────────┐
│ Same complete plate?      │ → reinforce
│ Compatible partial plate? │ → reinforce parent (track-aware)
│ Different plate?          │ → compete
│ Invalid/noisy?            │ → ignore
└───────────────────────────┘
     ↓
Track-aware consensus
     ↓
Confirmed plate
=========================================================
"""

import time
import re
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field


@dataclass
class PlateObservation:
    plate_text: str
    raw_text: str
    confidence: float
    quality_score: float
    bbox: Optional[Tuple[int, int, int, int]]
    timestamp: float
    top_text: str = ""
    bot_text: str = ""
    yolo_confidence: float = 0.80
    category: str = "Standard"
    valid: bool = True
    status: str = "VALID"
    track_id: Optional[int] = None
    is_full: bool = True
    obs_classification: str = "FULL"  # "FULL", "PARTIAL", "COMPETING", "IGNORED"
    resolved_candidate: str = ""


class TemporalPlateVoter:
    """
    Multi-frame confidence-weighted temporal voting accumulator with
    track-aware and confidence-aware subset consensus logic.
    """

    def __init__(
        self,
        window_size: int = 5,
        min_confirmed_frames: int = 2,
        min_confirmed_confidence: float = 0.80,
        track_ttl_seconds: float = 3.0,
    ):
        self.window_size = window_size
        self.min_confirmed_frames = min_confirmed_frames
        self.min_confirmed_confidence = min_confirmed_confidence
        self.track_ttl_seconds = track_ttl_seconds
        
        # History of recent observations: [PlateObservation, ...]
        self.observations: List[PlateObservation] = []

    def _is_full_format(self, clean_text: str) -> bool:
        """
        Check if a normalized plate string is a full 3-letter or complete standard plate.
        E.g., CAD8260, WPCAA1234, 3001234.
        """
        if not clean_text:
            return False
        # Modern 3-letter English series: e.g. CAD8260, CAB1234
        if re.match(r"^[A-Z]{3}\d{4}$", clean_text):
            return True
        # Province prefix + 2/3 letters + 4 digits: e.g. WPCAD8260, WPCA1234
        if re.match(r"^(WP|CP|SP|NP|EP|NW|NC|UP|SG)[A-Z]{2,3}\d{4}$", clean_text):
            return True
        # Vintage / special 2-3 digits + 4 digits: e.g. 19-1234, 300-1234
        if re.match(r"^\d{2,3}\d{4}$", clean_text):
            return True
        return False

    def _is_compatible_subset(self, full_clean: str, partial_clean: str) -> bool:
        """
        Check if partial_clean is a valid compatible subset/suffix of full_clean.
        e.g., AD8260 is a compatible suffix subset of CAD8260.
        """
        if not full_clean or not partial_clean or full_clean == partial_clean:
            return False

        # Modern 3-letter series subset: 'CAD8260' vs 'AD8260' (first letter obscured by shadow/glare)
        m_full = re.match(r"^([A-Z]{3})(\d{4})$", full_clean)
        m_part = re.match(r"^([A-Z]{2})(\d{4})$", partial_clean)
        if m_full and m_part:
            series_full, digits_full = m_full.groups()
            series_part, digits_part = m_part.groups()
            if digits_full == digits_part and series_full.endswith(series_part):
                return True

        # Province prefix subset: 'WPCAD8260' vs 'CAD8260' or 'AD8260'
        if full_clean.endswith(partial_clean) and len(full_clean) > len(partial_clean) and len(partial_clean) >= 5:
            return True

        # Sri-Series / Numeric plate subset (e.g. '133436' [13-3436] vs '13436' [13-436] on same vehicle track)
        m_sri_full = re.match(r"^(\d{1,3})(\d{4})$", full_clean)
        m_sri_part = re.match(r"^(\d{1,3})(\d{3})$", partial_clean)
        if m_sri_full and m_sri_part:
            lead_full, trail_full = m_sri_full.groups()
            lead_part, trail_part = m_sri_part.groups()
            if lead_full == lead_part and trail_full.endswith(trail_part):
                return True

        return False

    def add_observation(
        self,
        plate_text: str,
        raw_text: str,
        confidence: float,
        quality_score: float = 80.0,
        bbox: Optional[Tuple[int, int, int, int]] = None,
        top_text: str = "",
        bot_text: str = "",
        yolo_confidence: float = 0.80,
        category: str = "Standard",
        valid: bool = True,
        status: str = "VALID",
        track_id: Optional[int] = None,
        timestamp: Optional[float] = None
    ) -> None:
        """Add a new plate detection frame observation to the temporal pool."""
        clean_text = re.sub(r'[\s\-_]', '', plate_text or raw_text).upper()
        if not clean_text and not top_text and not bot_text:
            return

        ts = timestamp if timestamp is not None else time.time()
        is_full = self._is_full_format(clean_text)

        obs = PlateObservation(
            plate_text=plate_text.strip().upper(),
            raw_text=raw_text.strip().upper(),
            confidence=float(confidence),
            quality_score=float(quality_score),
            bbox=bbox,
            timestamp=ts,
            top_text=top_text.strip().upper(),
            bot_text=bot_text.strip().upper(),
            yolo_confidence=float(yolo_confidence),
            category=category,
            valid=valid,
            status=status,
            track_id=track_id,
            is_full=is_full
        )
        self.observations.append(obs)
        self._prune(ts)

    def _prune(self, current_time: float) -> None:
        """Remove observations older than track_ttl_seconds or exceeding window_size."""
        cutoff = current_time - self.track_ttl_seconds
        self.observations = [
            obs for obs in self.observations 
            if obs.timestamp >= cutoff
        ]
        if len(self.observations) > self.window_size:
            self.observations = self.observations[-self.window_size:]

    def get_consensus(self, track_id: Optional[int] = None, current_time: Optional[float] = None) -> Dict[str, Any]:
        """
        Evaluate observations in the temporal window and calculate track-aware consensus
        with explicit evidence breakdown (full vs compatible partial observations).
        """
        now = current_time if current_time is not None else time.time()
        self._prune(now)

        # Filter by track_id if specified and available
        active_obs = [
            obs for obs in self.observations
            if track_id is None or obs.track_id is None or obs.track_id == track_id
        ]

        if not active_obs:
            return {
                "status": "none",
                "plate_number": "",
                "confidence": 0.0,
                "composite_confidence": 0.0,
                "total_frames": 0,
                "agreeing_frames": 0,
                "evidence": {
                    "full_observations": 0,
                    "compatible_partial_observations": 0,
                    "competing_observations": 0,
                    "ignored_observations": 0,
                    "timeline": []
                },
                "category": "Unknown",
                "is_confident": False,
                "track_id": track_id
            }

        total_obs = len(active_obs)

        # 1. Group observations by normalized clean string
        plate_groups: Dict[str, List[PlateObservation]] = {}
        for obs in active_obs:
            clean_str = re.sub(r'[\s\-_]', '', obs.plate_text or obs.raw_text)
            if not clean_str:
                continue
            if clean_str not in plate_groups:
                plate_groups[clean_str] = []
            plate_groups[clean_str].append(obs)

        # 2. Line-by-Line Synthesis (for 2-line plates)
        top_candidates: Dict[str, float] = {}
        bot_candidates: Dict[str, float] = {}
        for obs in active_obs:
            clean_top = re.sub(r'[\s\-_]', '', obs.top_text)
            clean_bot = re.sub(r'[\s\-_]', '', obs.bot_text)
            if clean_top:
                top_candidates[clean_top] = top_candidates.get(clean_top, 0.0) + obs.confidence
            if clean_bot:
                bot_candidates[clean_bot] = bot_candidates.get(clean_bot, 0.0) + obs.confidence

        if top_candidates and bot_candidates:
            best_top = max(top_candidates.items(), key=lambda x: x[1])[0]
            best_bot = max(bot_candidates.items(), key=lambda x: x[1])[0]

            from .validator import parse_two_line_plate, normalize_plate
            synth_val = parse_two_line_plate(best_top, best_bot)
            if not synth_val or not synth_val.get("valid"):
                synth_val = normalize_plate(f"{best_top} {best_bot}")

            if synth_val and synth_val.get("valid"):
                synth_clean = re.sub(r'[\s\-_]', '', synth_val["normalized_plate"])
                if synth_clean not in plate_groups:
                    synth_obs = [
                        PlateObservation(
                            plate_text=synth_val["normalized_plate"],
                            raw_text=f"{best_top} {best_bot}",
                            confidence=max(o.confidence for o in active_obs),
                            quality_score=max(o.quality_score for o in active_obs),
                            bbox=active_obs[-1].bbox,
                            timestamp=now,
                            category=synth_val.get("plate_category", synth_val.get("type", "Standard")),
                            valid=True,
                            status="VALID",
                            track_id=track_id,
                            is_full=self._is_full_format(synth_clean)
                        )
                        for _ in range(min(len(top_candidates), len(bot_candidates)))
                    ]
                    plate_groups[synth_clean] = synth_obs

        # 3. Track-Aware & Confidence-Aware Subset Consensus:
        # Find established FULL candidates with high confidence
        full_candidates = [
            k for k, group in plate_groups.items()
            if self._is_full_format(k) and any(o.valid and o.confidence >= 0.50 for o in group)
        ]

        # Map partial groups into parent candidate groups
        absorbed_subsets: Dict[str, str] = {} # partial_clean -> full_parent_clean
        for full_k in full_candidates:
            for part_k in list(plate_groups.keys()):
                if part_k == full_k or part_k in full_candidates:
                    continue
                if self._is_compatible_subset(full_k, part_k):
                    # Check track compatibility (ensure all observations share same track or no track conflict)
                    full_tracks = {o.track_id for o in plate_groups[full_k] if o.track_id is not None}
                    part_tracks = {o.track_id for o in plate_groups[part_k] if o.track_id is not None}
                    if not full_tracks or not part_tracks or not full_tracks.isdisjoint(part_tracks):
                        absorbed_subsets[part_k] = full_k

        # 4. Score plate candidates
        # A full candidate gets reinforcement from both full observations and absorbed partial observations
        candidate_scores: Dict[str, float] = {}
        candidate_obs_map: Dict[str, List[PlateObservation]] = {}

        for k, group in plate_groups.items():
            if k in absorbed_subsets:
                continue
            combined_group = list(group)
            # Add absorbed partials
            for part_k, parent_k in absorbed_subsets.items():
                if parent_k == k:
                    combined_group.extend(plate_groups[part_k])
            
            total_weighted_conf = 0.0
            for obs in combined_group:
                q_mult = max(0.5, min(1.2, 0.5 + 0.5 * (obs.quality_score / 100.0)))
                val_mult = 1.4 if obs.valid else (0.6 if obs.status in ["PENDING_OCR", "INCOMPLETE"] else 0.2)
                score = obs.confidence * q_mult * val_mult
                total_weighted_conf += score

            candidate_scores[k] = total_weighted_conf
            candidate_obs_map[k] = combined_group

        # Also score any non-absorbed partial candidates that had no parent
        for part_k, group in plate_groups.items():
            if part_k not in absorbed_subsets and part_k not in candidate_scores:
                total_weighted_conf = 0.0
                for obs in group:
                    q_mult = max(0.5, min(1.2, 0.5 + 0.5 * (obs.quality_score / 100.0)))
                    val_mult = 1.0 if obs.valid else 0.4
                    total_weighted_conf += obs.confidence * q_mult * val_mult
                candidate_scores[part_k] = total_weighted_conf
                candidate_obs_map[part_k] = group

        if not candidate_scores:
            return {
                "status": "none",
                "plate_number": "",
                "confidence": 0.0,
                "composite_confidence": 0.0,
                "total_frames": total_obs,
                "agreeing_frames": 0,
                "evidence": {
                    "full_observations": 0,
                    "compatible_partial_observations": 0,
                    "competing_observations": 0,
                    "ignored_observations": 0,
                    "timeline": []
                },
                "category": "Unknown",
                "is_confident": False,
                "track_id": track_id
            }

        best_candidate_key = max(candidate_scores.items(), key=lambda x: x[1])[0]
        best_candidate_obs_list = candidate_obs_map[best_candidate_key]

        # 5. Canonical plate formatting
        valid_obs = [o for o in best_candidate_obs_list if o.valid]
        if valid_obs:
            chosen_obs = max(valid_obs, key=lambda o: (len(re.sub(r'[\d\-_]', '', o.plate_text or '')), o.confidence))
        else:
            chosen_obs = best_candidate_obs_list[-1]
        canonical_plate = chosen_obs.plate_text or chosen_obs.raw_text
        category = chosen_obs.category

        # 6. Detailed Evidence Classification & Timeline
        full_count = 0
        partial_count = 0
        competing_count = 0
        ignored_count = 0
        timeline: List[Dict[str, Any]] = []

        for idx, obs in enumerate(active_obs, start=1):
            clean_o = re.sub(r'[\s\-_]', '', obs.plate_text or obs.raw_text)
            display_txt = obs.plate_text or obs.raw_text

            if clean_o == best_candidate_key:
                obs_type = "FULL OBSERVATION" if obs.is_full else "REINFORCING OBSERVATION"
                full_count += 1
                resolved_to = canonical_plate
            elif absorbed_subsets.get(clean_o) == best_candidate_key:
                obs_type = "PARTIAL OBSERVATION"
                partial_count += 1
                resolved_to = canonical_plate
            elif obs.confidence < 0.35 or not clean_o:
                obs_type = "IGNORED / NOISY"
                ignored_count += 1
                resolved_to = "IGNORED"
            else:
                obs_type = "COMPETING OBSERVATION"
                competing_count += 1
                resolved_to = display_txt

            timeline.append({
                "frame": idx,
                "raw": display_txt,
                "type": obs_type,
                "resolved_to": resolved_to,
                "confidence": round(obs.confidence, 3)
            })

        agreeing_count = full_count + partial_count
        avg_ocr_conf = sum(o.confidence for o in best_candidate_obs_list) / max(1, len(best_candidate_obs_list))
        avg_yolo_conf = sum(o.yolo_confidence for o in best_candidate_obs_list) / max(1, len(best_candidate_obs_list))
        avg_quality = sum(o.quality_score for o in best_candidate_obs_list) / max(1, len(best_candidate_obs_list))

        # 7. Composite Confidence Score
        has_valid_plate = len(valid_obs) > 0
        agreement_ratio = agreeing_count / max(1, total_obs)
        format_weight = 1.0 if has_valid_plate else 0.0
        quality_weight = max(0.0, min(1.0, avg_quality / 100.0))

        composite_score = (
            0.25 * avg_ocr_conf +
            0.25 * agreement_ratio +
            0.20 * format_weight +
            0.20 * avg_yolo_conf +
            0.10 * quality_weight
        )

        # 8. Decision Gate
        is_single_frame_solid = (
            full_count == 1 
            and total_obs == 1
            and avg_ocr_conf >= 0.94 
            and has_valid_plate
            and avg_quality >= 80
        )
        
        is_multi_frame_consensus = (
            has_valid_plate and (
                (agreeing_count >= self.min_confirmed_frames and avg_ocr_conf >= 0.68)
                or (total_obs >= 3 and agreement_ratio >= 0.50 and avg_ocr_conf >= 0.65)
            )
        )

        is_confirmed = (is_single_frame_solid or is_multi_frame_consensus) and composite_score >= 0.65

        if is_confirmed:
            consensus_status = "CONFIRMED"
        elif has_valid_plate:
            consensus_status = "VOTING"
        else:
            consensus_status = "PENDING_OCR"

        return {
            "status": consensus_status,
            "plate_number": canonical_plate if has_valid_plate else "",
            "candidate_raw": canonical_plate,
            "confidence": round(avg_ocr_conf, 4),
            "composite_confidence": round(composite_score, 4),
            "total_frames": total_obs,
            "agreeing_frames": agreeing_count,
            "evidence": {
                "full_observations": full_count,
                "compatible_partial_observations": partial_count,
                "competing_observations": competing_count,
                "ignored_observations": ignored_count,
                "timeline": timeline
            },
            "category": category if has_valid_plate else "Pending",
            "is_confident": is_confirmed,
            "track_id": track_id
        }

    def format_debug_reasoning(self, consensus: Dict[str, Any]) -> str:
        """
        Format the consensus evidence into a clean, human-readable debug timeline.
        """
        timeline = consensus.get("evidence", {}).get("timeline", [])
        if not timeline:
            return "No observations recorded in temporal window."

        lines = []
        for item in timeline:
            f_num = item["frame"]
            raw = item["raw"]
            obs_type = item["type"]
            res = item["resolved_to"]
            if obs_type == "PARTIAL OBSERVATION":
                lines.append(f"Frame {f_num}: {raw:<10} → PARTIAL OBSERVATION → {res}")
            elif obs_type == "FULL OBSERVATION":
                lines.append(f"Frame {f_num}: {raw:<10} → FULL OBSERVATION")
            elif obs_type == "COMPETING OBSERVATION":
                lines.append(f"Frame {f_num}: {raw:<10} → COMPETING OBSERVATION")
            else:
                lines.append(f"Frame {f_num}: {raw:<10} → {obs_type}")

        lines.append("")
        lines.append(f"Final confirmed plate: {consensus.get('plate_number', 'N/A')}")
        lines.append("Evidence:")
        ev = consensus.get("evidence", {})
        lines.append(f"  {ev.get('full_observations', 0)} full observation(s)")
        lines.append(f"  {ev.get('compatible_partial_observations', 0)} compatible partial observation(s)")
        if ev.get("competing_observations", 0) > 0:
            lines.append(f"  {ev.get('competing_observations', 0)} competing observation(s)")
        if ev.get("ignored_observations", 0) > 0:
            lines.append(f"  {ev.get('ignored_observations', 0)} ignored observation(s)")

        return "\n".join(lines)

    def reset(self) -> None:
        """Clear all active observations."""
        self.observations.clear()

