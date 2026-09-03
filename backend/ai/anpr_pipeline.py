"""
=========================================================
Sri Lankan ANPR Pipeline - V4
=========================================================

Author : Senitha Kahatapitiya

Main pipeline:

Vehicle Image
      ↓
YOLO Exp004 Plate Detection
      ↓
Perspective Rectification
      ↓
Adaptive Plate Upscaling
      ↓
Image Quality Analysis
      ↓
Adaptive Preprocessing
      ↓
OCR V4
      ↓
Validation
      ↓
Retry Engine if invalid
      ↓
Final Result
=========================================================
"""

import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

# Pre-load PyTorch on Windows to avoid DLL runtime conflict with Paddle
try:
    import torch
except Exception:
    pass

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import cv2

try:
    from modules.yolo_detector import YOLODetector
    from modules.perspective import PerspectiveTransformer
    from modules.preprocess import PlatePreprocessor
    from modules.ocr_reader import OCRReader
    from modules.validator import PlateValidator
    from modules.image_quality import ImageQualityAnalyzer
    from modules.retry_engine import RetryEngine
    from modules.temporal_voter import TemporalPlateVoter
    from modules.byte_tracker import ByteTracker
    from modules.vehicle_detector import VehicleDetector
except ImportError:
    from ai.modules.yolo_detector import YOLODetector
    from ai.modules.perspective import PerspectiveTransformer
    from ai.modules.preprocess import PlatePreprocessor
    from ai.modules.ocr_reader import OCRReader
    from ai.modules.validator import PlateValidator
    from ai.modules.image_quality import ImageQualityAnalyzer
    from ai.modules.retry_engine import RetryEngine
    from ai.modules.temporal_voter import TemporalPlateVoter
    from ai.modules.byte_tracker import ByteTracker
    from ai.modules.vehicle_detector import VehicleDetector


_pipeline_instance = None


def get_pipeline() -> "ANPRPipeline":
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = ANPRPipeline()
    return _pipeline_instance


class ANPRPipeline:

    def __init__(self):

        print("=" * 60)
        print("Initializing Sri Lankan ANPR Pipeline V4 (Hierarchical Vehicle Tracking Active)...")
        print("=" * 60)

        # =================================================
        # STAGE 1: VEHICLE BODY DETECTOR
        # =================================================

        self.vehicle_detector = VehicleDetector()

        # =================================================
        # BYTETRACK MULTI-OBJECT VEHICLE TRACKER
        # =================================================

        self.byte_tracker = ByteTracker(
            track_thresh=0.35,
            high_thresh=0.45,
            match_thresh=0.80,
            max_time_lost=30
        )

        # =================================================
        # STAGE 2: LICENSE PLATE YOLO DETECTOR
        # =================================================

        self.detector = YOLODetector()

        self.detector.warmup()

        # =================================================
        # PERSPECTIVE
        # =================================================

        self.transformer = PerspectiveTransformer()

        # =================================================
        # IMAGE QUALITY
        # =================================================

        self.quality_analyzer = ImageQualityAnalyzer()

        # =================================================
        # PREPROCESSING
        # =================================================

        self.preprocessor = PlatePreprocessor()

        # =================================================
        # OCR V4
        # =================================================

        self.ocr = OCRReader()

        # =================================================
        # VALIDATION
        # =================================================

        self.validator = PlateValidator()

        # =================================================
        # RETRY ENGINE
        # =================================================

        self.retry_engine = RetryEngine(
            quality_analyzer=self.quality_analyzer,
            preprocessor=self.preprocessor,
            ocr=self.ocr,
            validator=self.validator,
            max_retries=1
        )

        # =================================================
        # TEMPORAL VOTER
        # =================================================

        self.temporal_voter = TemporalPlateVoter(
            window_size=5,
            min_confirmed_frames=2,
            min_confirmed_confidence=0.80,
            track_ttl_seconds=3.0
        )

        print("\nPipeline Ready (2-Stage Vehicle ByteTrack + Pre-OCR Quality Gate Active)!")


    # =====================================================
    # VIRTUAL TRIPWIRE LINE TOUCH CHECKER (SPATIAL GATING)
    # =====================================================

    @staticmethod
    def is_touching_virtual_tripwire(plate: Dict[str, Any], gate_config: Dict[str, Any], img_w: int, img_h: int) -> bool:
        """
        Returns True if the vehicle body (ByteTracker) or plate bbox intersects
        the Red Line (exit) or Green Line (entrance).
        """
        if not gate_config:
            return True

        bbox = plate.get("bbox")
        vbox = plate.get("vehicle_bbox")
        primary_box = vbox if (vbox and len(vbox) == 4) else bbox
        if not primary_box or len(primary_box) < 4:
            return False

        scale_x = 640.0 / max(1, img_w)
        scale_y = 380.0 / max(1, img_h)

        bx1, by1, bx2, by2 = primary_box
        norm_x1 = bx1 * scale_x
        norm_x2 = bx2 * scale_x
        norm_y1 = by1 * scale_y
        norm_y2 = by2 * scale_y
        norm_cx = (norm_x1 + norm_x2) / 2.0

        pin_a = gate_config.get("pin_a", {"x": 80.0, "y": 140.0})
        pin_b = gate_config.get("pin_b", {"x": 560.0, "y": 140.0})
        pin_c = gate_config.get("pin_c", {"x": 80.0, "y": 340.0})
        pin_d = gate_config.get("pin_d", {"x": 560.0, "y": 340.0})

        pin_a_x, pin_a_y = float(pin_a.get("x", 80.0)), float(pin_a.get("y", 140.0))
        pin_b_x, pin_b_y = float(pin_b.get("x", 560.0)), float(pin_b.get("y", 140.0))
        if pin_b_x != pin_a_x:
            red_y = pin_a_y + ((pin_b_y - pin_a_y) / (pin_b_x - pin_a_x)) * (norm_cx - pin_a_x)
        else:
            red_y = (pin_a_y + pin_b_y) / 2.0

        pin_c_x, pin_c_y = float(pin_c.get("x", 80.0)), float(pin_c.get("y", 340.0))
        pin_d_x, pin_d_y = float(pin_d.get("x", 560.0)), float(pin_d.get("y", 340.0))
        if pin_d_x != pin_c_x:
            green_y = pin_c_y + ((pin_d_y - pin_c_y) / (pin_d_x - pin_c_x)) * (norm_cx - pin_c_x)
        else:
            green_y = (pin_c_y + pin_d_y) / 2.0

        # 1. Red Line touch check (Outer gate boundary)
        if norm_y1 <= red_y + 25.0:
            return True

        # 2. Green Line touch check (Inner entrance line)
        min_green_x = min(pin_c_x, pin_d_x) - 20.0
        max_green_x = max(pin_c_x, pin_d_x) + 20.0
        has_x_overlap = (norm_x2 >= min_green_x) and (norm_x1 <= max_green_x)
        if has_x_overlap and ((norm_y1 - 20.0) <= green_y <= (norm_y2 + 20.0)):
            return True

        # Also check plate bbox touch if vehicle_bbox was primary
        if bbox and len(bbox) == 4 and vbox:
            px1, py1, px2, py2 = bbox
            p_ny1, p_ny2 = py1 * scale_y, py2 * scale_y
            p_nx1, p_nx2 = px1 * scale_x, px2 * scale_x
            p_has_x = (p_nx2 >= min_green_x) and (p_nx1 <= max_green_x)
            if p_has_x and ((p_ny1 - 25.0) <= green_y <= (p_ny2 + 25.0)):
                return True

        return False

    # =====================================================
    # PROCESS ONE IMAGE
    # =====================================================

    def process(self, image, gate_config: Optional[Dict[str, Any]] = None, force_ocr: bool = False):

        start = time.perf_counter()

        # =================================================
        # STAGE 1: VEHICLE DETECTION & BYTETRACK TRACKING
        # =================================================

        vehicle_dets = self.vehicle_detector.detect(image)
        active_vehicle_tracks = self.byte_tracker.update(vehicle_dets)

        # =================================================
        # STAGE 2: LICENSE PLATE DETECTION
        # =================================================

        plate_detections = self.detector.detect(image)

        # Map each plate detection to its enclosing/nearest tracked vehicle
        for plate in plate_detections:
            p_bbox = plate.get("bbox")
            if not p_bbox or len(p_bbox) < 4:
                continue
            pcx = (p_bbox[0] + p_bbox[2]) / 2.0
            pcy = (p_bbox[1] + p_bbox[3]) / 2.0

            matched_vtrack = None
            min_dist = float("inf")

            for vt in active_vehicle_tracks:
                vbox = vt.tlbr
                # Check if plate center is inside vehicle bbox (with 15% tolerance margin)
                margin_x = (vbox[2] - vbox[0]) * 0.15
                margin_y = (vbox[3] - vbox[1]) * 0.15
                is_inside = (
                    (vbox[0] - margin_x) <= pcx <= (vbox[2] + margin_x) and
                    (vbox[1] - margin_y) <= pcy <= (vbox[3] + margin_y)
                )

                vcx, vcy = vt.centroid
                dist = (pcx - vcx) ** 2 + (pcy - vcy) ** 2

                if is_inside or dist < min_dist:
                    min_dist = dist
                    matched_vtrack = vt

            if matched_vtrack is not None:
                plate["track_id"] = matched_vtrack.track_id
                plate["vehicle_track_id"] = matched_vtrack.track_id
                plate["vehicle_bbox"] = [int(x) for x in matched_vtrack.tlbr]
                plate["vehicle_category"] = matched_vtrack.det_meta.get("category", "Car")
                plate["track_history"] = list(matched_vtrack.history)
                plate["track_score"] = matched_vtrack.score
            else:
                plate["track_id"] = 1
                plate["vehicle_track_id"] = 1
                plate["vehicle_bbox"] = None
                plate["vehicle_category"] = "Car"
                plate["track_history"] = [(pcx, pcy)]
                plate["track_score"] = float(plate.get("confidence", 0.8))

        detections = plate_detections
        results = []

        # =================================================
        # PROCESS EACH PLATE (SPATIAL-GATED OCR)
        # =================================================

        img_h, img_w = image.shape[:2]

        for plate in detections:

            try:
                # Spatial tripwire check: If vehicle has not touched Green or Red line, sleep OCR!
                is_touched = True
                if not force_ocr and gate_config:
                    is_touched = self.is_touching_virtual_tripwire(plate, gate_config, img_w, img_h)

                if not is_touched:
                    # OCR IS ASLEEP / DORMANT 💤 (Saves 80% CPU)
                    plate["is_ocr_asleep"] = True
                    plate["text"] = ""
                    plate["raw_plate"] = ""
                    plate["normalized_plate"] = ""
                    plate["validated_text"] = ""
                    plate["ocr_confidence"] = 0.0
                    plate["ocr_time_ms"] = 0.0
                    plate["valid"] = False
                    plate["plate_category"] = "Standby"
                    plate["plate_type"] = "Standby"
                    results.append(plate)
                    continue

                plate["is_ocr_asleep"] = False

                # =========================================
                # 1. PERSPECTIVE RECTIFICATION
                # =========================================

                rectified = plate.get("crop")
                if (rectified is None or rectified.size == 0) and plate.get("polygon") is not None:
                    try:
                        rectified = self.transformer.rectify(
                            image,
                            plate.get("polygon"),
                            plate.get("bbox")
                        )
                    except Exception as e:
                        print(f"Perspective rectify warning: {e}")

                if rectified is None or rectified.size == 0:
                    print("\nPlate crop unavailable.")
                    continue

                plate["rectified"] = rectified

                print(
                    f"\nPerspective plate size: "
                    f"{rectified.shape[1]} x "
                    f"{rectified.shape[0]}"
                )

                # =========================================
                # 2. FAST PRE-OCR QUALITY GATE (<1ms)
                # =========================================
                is_q_ok, q_reason, q_metrics = self.quality_analyzer.is_quality_acceptable(
                    rectified,
                    min_blur=25.0,
                    min_width=35,
                    min_height=10
                )

                if not is_q_ok:
                    print(f"\n[Quality Gate Filtered] {q_reason}")
                    plate["quality"] = {
                        "score": 25,
                        "quality": "Poor",
                        "blur": q_metrics.get("blur", 0.0),
                        "brightness": q_metrics.get("brightness", 0.0),
                        "reason": q_reason
                    }
                    plate["text"] = ""
                    plate["ocr_confidence"] = 0.0
                    plate["ocr_time_ms"] = 0.0
                    plate["valid"] = False
                    plate["plate_type"] = "Rejected"
                    plate["validated_text"] = ""
                    plate["raw_plate"] = ""
                    plate["normalized_plate"] = ""
                    plate["plate_category"] = "Rejected"
                    plate["retry_time_ms"] = 0.0
                    plate["retry_attempt"] = 0
                    plate["upscale_factor"] = 1.0
                    plate["retry_attempts"] = 0
                    results.append(plate)
                    continue

                # =========================================
                # 3. RETRY ENGINE (OCR & VALIDATION)
                # =========================================

                retry_start = time.perf_counter()

                ocr_result = self.retry_engine.recognize(
                    rectified
                )

                retry_time = (
                    time.perf_counter()
                    - retry_start
                ) * 1000

                # =========================================
                # 3. SAVE QUALITY INFORMATION
                # =========================================

                plate["quality"] = (
                    ocr_result.get("quality")
                )

                # =========================================
                # 4. SAVE OCR RESULT
                # =========================================

                plate["text"] = (
                    ocr_result["text"]
                )

                plate["ocr_confidence"] = (
                    ocr_result["confidence"]
                )

                plate["ocr_time_ms"] = (
                    ocr_result["ocr_time_ms"]
                )

                # =========================================
                # 5. SAVE VALIDATION & NORMALIZATION RESULT
                # =========================================

                plate["valid"] = (
                    ocr_result["valid"]
                )

                plate["status"] = (
                    ocr_result.get("status", "VALID" if ocr_result.get("valid") else "INVALID")
                )

                plate["plate_type"] = (
                    ocr_result["plate_type"]
                )

                plate["validated_text"] = (
                    ocr_result["validated_text"]
                )

                plate["raw_plate"] = (
                    ocr_result.get("raw_plate", ocr_result.get("text", ""))
                )

                plate["normalized_plate"] = (
                    ocr_result.get("normalized_plate", ocr_result.get("validated_text", ""))
                )

                plate["plate_category"] = (
                    ocr_result.get("plate_category", ocr_result.get("plate_type", "Unknown"))
                )

                # =========================================
                # 6. SAVE RETRY INFORMATION
                # =========================================

                plate["retry_time_ms"] = (
                    retry_time
                )

                plate["retry_attempt"] = (
                    ocr_result["attempt"]
                )

                plate["upscale_factor"] = (
                    ocr_result["upscale"]
                )

                plate["retry_attempts"] = (
                    ocr_result["attempts"]
                )

                # =========================================
                # 7. SAVE FINAL PROCESSED IMAGE
                # =========================================

                if ocr_result.get("processed") is not None:

                    plate["processed"] = (
                        ocr_result["processed"]
                    )

                # =========================================
                # 8. TEMPORAL OBSERVATION & CONSENSUS
                # =========================================

                norm_text = plate.get("normalized_plate") or plate.get("validated_text") or ""
                raw_text = plate.get("raw_plate") or plate.get("text", "")
                conf_val = float(plate.get("ocr_confidence", 0.0))
                q_score = float(plate.get("quality", {}).get("score", 80)) if isinstance(plate.get("quality"), dict) else 80.0
                bbox_val = plate.get("bbox")
                yolo_conf = float(plate.get("yolo_confidence", 0.80))
                top_cand = ocr_result.get("top_candidate", "")
                bot_cand = ocr_result.get("bot_candidate", "")

                plate["top_candidate"] = top_cand
                plate["bot_candidate"] = bot_cand

                if (norm_text or raw_text or top_cand or bot_cand) and conf_val > 0.3:
                    self.temporal_voter.add_observation(
                        plate_text=norm_text,
                        raw_text=raw_text,
                        confidence=conf_val,
                        quality_score=q_score,
                        bbox=bbox_val,
                        top_text=top_cand,
                        bot_text=bot_cand,
                        yolo_confidence=yolo_conf,
                        category=plate.get("plate_category", "Standard"),
                        valid=bool(plate.get("valid", False)),
                        status=plate.get("status", "VALID")
                    )

                consensus = self.temporal_voter.get_consensus()
                plate["consensus"] = consensus

                # =========================================
                # 9. ADD RESULT & EARLY EXIT ON VALID
                # =========================================

                results.append(plate)
                if plate.get("valid"):
                    break

            except Exception as e:

                print(
                    f"\nPlate processing error: {e}"
                )

                continue

        # =================================================
        # TOTAL TIME
        # =================================================

        total_time = (
            time.perf_counter()
            - start
        ) * 1000

        return results, total_time

    def get_voter(self) -> TemporalPlateVoter:
        """Return the pipeline's temporal plate voter instance."""
        return self.temporal_voter

    def get_hardware_status(self) -> Dict[str, Any]:
        """Return system-wide hardware acceleration status."""
        from typing import Dict, Any
        yolo_status = self.detector.get_device_status() if hasattr(self, "detector") else {}
        ocr_status = self.ocr.get_device_status() if hasattr(self, "ocr") else {}
        return {
            "yolo": yolo_status,
            "ocr": ocr_status,
            "system": {
                "cuda_available": yolo_status.get("cuda_available", False),
                "gpu_name": yolo_status.get("gpu_hardware_name", "None"),
                "vram_mb": yolo_status.get("vram_allocated_mb", 0.0)
            }
        }

    def configure_devices(
        self,
        yolo_device: Optional[str] = None,
        ocr_device: Optional[str] = None,
        yolo_engine: Optional[str] = None
    ) -> Dict[str, Any]:
        """Hot-switch hardware devices for YOLO and/or OCR."""
        from typing import Dict, Any, Optional
        results = {}
        if yolo_device is not None and hasattr(self, "detector"):
            results["yolo"] = self.detector.switch_device(yolo_device, yolo_engine)
        if ocr_device is not None and hasattr(self, "ocr"):
            results["ocr"] = self.ocr.switch_device(ocr_device)

        results["status"] = self.get_hardware_status()
        return results



# ==========================================================
# TEST MULTIPLE IMAGES
# ==========================================================

if __name__ == "__main__":

    pipeline = ANPRPipeline()

    IMAGE_FOLDER = Path(
        r"C:\Users\w2119688\Desktop\openCv\test_images"
    )

    image_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".webp"
    }

    # ======================================================
    # CHECK TEST FOLDER
    # ======================================================

    if not IMAGE_FOLDER.exists():

        raise FileNotFoundError(
            f"\nTest image folder not found:\n"
            f"{IMAGE_FOLDER}"
        )

    # ======================================================
    # PROCESS IMAGES
    # ======================================================

    for image_path in sorted(
        IMAGE_FOLDER.iterdir()
    ):

        if (
            image_path.suffix.lower()
            not in image_extensions
        ):
            continue

        print(
            "\n" + "=" * 70
        )

        print(
            f"Processing: "
            f"{image_path.name}"
        )

        print(
            "=" * 70
        )

        # ==================================================
        # READ IMAGE
        # ==================================================

        image = cv2.imread(
            str(image_path)
        )

        if image is None:

            print(
                "Cannot read image."
            )

            continue

        # ==================================================
        # RUN PIPELINE
        # ==================================================

        results, total = (
            pipeline.process(image)
        )

        # ==================================================
        # NO DETECTION
        # ==================================================

        if not results:

            print(
                "No number plate detected."
            )

            continue

        # ==================================================
        # PRINT RESULTS
        # ==================================================

        for i, plate in enumerate(
            results,
            start=1
        ):

            print(
                f"\nPlate #{i}"
            )

            print(
                f"Text            : "
                f"{plate['text']}"
            )

            print(
                f"Validated Text  : "
                f"{plate['validated_text']}"
            )

            print(
                f"Type            : "
                f"{plate['plate_type']}"
            )

            print(
                f"Valid           : "
                f"{plate['valid']}"
            )

            print(
                f"YOLO Confidence : "
                f"{plate['yolo_confidence']:.3f}"
            )

            print(
                f"OCR Confidence  : "
                f"{plate['ocr_confidence']:.3f}"
            )

            # =================================================
            # QUALITY
            # =================================================

            quality = plate.get(
                "quality"
            )

            if quality is not None:

                print(
                    f"Brightness      : "
                    f"{quality['brightness']:.2f}"
                )

                print(
                    f"Contrast        : "
                    f"{quality['contrast']:.2f}"
                )

                print(
                    f"Blur            : "
                    f"{quality['blur']:.2f}"
                )

                print(
                    f"Quality         : "
                    f"{quality['quality']}"
                )

                print(
                    f"Preprocessing   : "
                    f"{quality['recommended_pipeline']}"
                )

            # =================================================
            # UPSCALE
            # =================================================

            print(
                f"Upscale Factor  : "
                f"{plate['upscale_factor']:.1f}x"
            )

            # =================================================
            # RETRY
            # =================================================

            print(
                f"OCR Attempt     : "
                f"{plate['retry_attempt']}"
            )

            print(
                f"Retry Time      : "
                f"{plate['retry_time_ms']:.2f} ms"
            )

            # =================================================
            # OCR TIME
            # =================================================

            print(
                f"OCR Time        : "
                f"{plate['ocr_time_ms']:.2f} ms"
            )

            # =================================================
            # ATTEMPT SUMMARY
            # =================================================

            attempts = plate.get(
                "retry_attempts",
                []
            )

            print(
                "\nAttempt Summary:"
            )

            for attempt in attempts:

                print(
                    f"  {attempt['attempt']}: "
                    f"{attempt['text']} | "
                    f"Confidence="
                    f"{attempt['confidence']:.4f} | "
                    f"Valid="
                    f"{attempt['valid']}"
                )

        # ==================================================
        # TOTAL TIME
        # ==================================================

        print(
            f"\nTotal Time : "
            f"{total:.2f} ms"
        )