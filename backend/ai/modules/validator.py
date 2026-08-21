"""
=========================================================
Sri Lankan Number Plate Validator & Normalizer
=========================================================

Author : Senitha Kahatapitiya / Updated for ANPR v4

Master normalization & validation pipeline for Sri Lankan
vehicle license plates.

Supports:
1. Civilian modern plates:
   - Modern-2: 2 letters + 4 digits (e.g. CA-1234)
   - Modern-3: 3 letters + 4 digits (e.g. CDD-3435)
   - Confident civilian province prefix removal (WP, CP, SP, NP, EP, NC, NW, SG, UP)
2. Sri Series plates (ශ්රී / ශ්‍රී / SRI):
   - 1 to 3 digits + SRI marker + 1 to 4 digits -> [LEADING]-[TRAILING] (e.g. 1-1234, 15-3201, 301-5678)
3. Military vehicles:
   - Air Force: ගුවන් / AIR -> AIR-XXXX (e.g. AIR-1234)
   - Navy: නාහ / NAVY -> NAVY-XXXX (e.g. NAVY-5678)
   - Army: යුහ / ARMY -> ARMY-XXXX (e.g. ARMY-4321)
4. Special / Unknown plates:
   - Unrecognized prefixes preserved (e.g. GGCA1234 -> GGCA-1234)
"""

import re
from typing import Dict, Optional, Tuple, Any

# Sri Lankan Provinces
PROVINCES = {"WP", "CP", "SP", "NP", "EP", "NC", "NW", "SG", "UP"}

# Sri Series Regex (Sinhala variations with/without ZWJ and English)
SRI_SINHALA_REGEX = re.compile(
    r"^(\d{1,3})\s*[-]?\s*(?:ශ[\u200D\s]*්[\u200D\s]*ර[\u200D\s]*[ීි]|ශ්රී|ශ්‍රී)\s*[-]?\s*(\d{1,4})$"
)
SRI_ENGLISH_REGEX = re.compile(r"^(\d{1,3})\s*[-]?\s*SRI\s*[-]?\s*(\d{1,4})$", re.IGNORECASE)

# Military Vehicle Regex (Sinhala and English identifiers)
AIR_FORCE_SINHALA = re.compile(r"^(?:ගුවන්|ග\s*ු\s*ව\s*න\s*්)\s*[-]?\s*(\d{4,5})$")
AIR_FORCE_ENGLISH = re.compile(r"^AIR\s*[-]?\s*(\d{4,5})$", re.IGNORECASE)

NAVY_SINHALA = re.compile(r"^(?:නාහ|න\s*ා\s*හ)\s*[-]?\s*(\d{4,5})$")
NAVY_ENGLISH = re.compile(r"^NAVY\s*[-]?\s*(\d{4,5})$", re.IGNORECASE)

ARMY_SINHALA = re.compile(r"^(?:යුහ|ය\s*ු\s*හ)\s*[-]?\s*(\d{4,5})$")
ARMY_ENGLISH = re.compile(r"^ARMY\s*[-]?\s*(\d{4,5})$", re.IGNORECASE)


def basic_clean(text: str) -> str:
    """
    Perform basic whitespace and symbol normalization while preserving Sinhala characters.
    """
    if text is None:
        return ""
    t = str(text).strip()
    t = re.sub(r"[ \t]+", " ", t)
    return t


def remove_prefixes(text: str) -> str:
    """
    Remove known civilian province prefixes ONLY if the remaining string matches
    a valid civilian plate format (1-3 letters + 3/4 digits) or numeric series (2-3 digits + 4 digits).
    
    Also handles two-line plates with embedded province (e.g. "253 WP 5842" -> "253 5842").
    """
    if not text:
        return text

    t = text.strip()

    # 1. Embedded province on two-line plates (e.g. "253 WP 5842" -> "253 5842")
    for prov in PROVINCES:
        t = re.sub(rf"(\d{{1,3}})[\s\-_|·•~]*{prov}[\s\-_|·•~]*(\d{{4}})", r"\1 \2", t, flags=re.IGNORECASE).strip()

    # 2. Leading province (e.g. "WP CBE 3319" -> "CBE 3319")
    for prov in PROVINCES:
        pattern = re.compile(rf"^{prov}[\s\-_|·•~]*(.*)$", re.IGNORECASE)
        m = pattern.match(t)
        if m:
            remainder = m.group(1).strip()
            rem_compact = re.sub(r"\s+", "", remainder)
            if re.fullmatch(r"[A-Za-z]{1,3}[\-_\|·•~]?\d?[\-_\|·•~]?[0-9]{3,4}", rem_compact) or re.fullmatch(r"\d{1,3}[\-_\|·•~]?[0-9]{4}", rem_compact):
                return remainder

    return t


def normalize_modern(text: str) -> Optional[Tuple[str, str]]:
    """
    Check and normalize civilian Modern (1-3 letters + 4 digits).
    Modern-3 strictly requires 4 digits (no guessing with zfill).
    Modern-2 and Classic-1 support 3-4 digits.
    Returns (normalized_plate, category) or None.
    """
    if not text:
        return None

    t = remove_prefixes(text)
    t = re.sub(r"\s*-\s*", "-", t)
    t = re.sub(r"\s+", " ", t).strip()

    # Try fullmatch with standard spacing or hyphens
    # Modern-3: e.g. "CBE 3319", "CBL 0676" -> strictly 4 digits
    m = re.fullmatch(r"([A-Za-z]{3})[ -]?(\d{4})", t)
    if m:
        return f"{m.group(1).upper()}-{m.group(2)}", "Modern-3"

    # Modern-2: e.g. "CA 1234", "CA 676" -> "CA-0676" (Provincial badges like WP, CP are NOT series)
    m = re.fullmatch(r"([A-Za-z]{2})[ -]?(\d{3,4})", t)
    if m:
        letters = m.group(1).upper()
        if letters not in PROVINCES:
            num = m.group(2).zfill(4)
            return f"{letters}-{num}", "Modern-2"

    # Classic-1: e.g. "L 1456", "L-1456"
    m = re.fullmatch(r"([A-Za-z]{1})[ -]?(\d{3,4})", t)
    if m:
        num = m.group(2).zfill(4)
        return f"{m.group(1).upper()}-{num}", "Classic-1"

    # Compact format
    compact = re.sub(r"\s+", "", t)

    # Modern-3 compact: strictly 4 digits
    m = re.fullmatch(r"([A-Za-z]{3})(\d{4})", compact)
    if m:
        return f"{m.group(1).upper()}-{m.group(2)}", "Modern-3"

    m = re.fullmatch(r"([A-Za-z]{2})(\d{3,4})", compact)
    if m:
        letters = m.group(1).upper()
        if letters not in PROVINCES:
            num = m.group(2).zfill(4)
            return f"{letters}-{num}", "Modern-2"

    m = re.fullmatch(r"([A-Za-z]{1})(\d{3,4})", compact)
    if m:
        num = m.group(2).zfill(4)
        return f"{m.group(1).upper()}-{num}", "Classic-1"

    # Emblem artifact handling (e.g., "GL-4-1456", "GL4-1456", "GL41456" where emblem is read as digit/symbol)
    m = re.fullmatch(r"([A-Za-z]{1,3})[\-_\|·•~]?\d?[\-_\|·•~]?(\d{4})", compact)
    if m:
        letters = m.group(1).upper()
        if len(letters) == 3:
            return f"{letters}-{m.group(2)}", "Modern-3"
        elif len(letters) == 2 and letters not in PROVINCES:
            return f"{letters}-{m.group(2)}", "Modern-2"
        elif len(letters) == 1:
            return f"{letters}-{m.group(2)}", "Classic-1"

    # Multi-line / noisy OCR sub-pattern extraction (e.g., "WP CB--11 WP CBC-6928" -> "CBC-6928")
    m3 = re.findall(r"(?:^|[^A-Za-z0-9])([A-Za-z]{3})[\s\-_|·•~]*(\d{4})(?:$|[^A-Za-z0-9])", text)
    if m3:
        for let, num in reversed(m3):
            letters = let.upper()
            if letters not in PROVINCES:
                return f"{letters}-{num}", "Modern-3"

    m2 = re.findall(r"(?:^|[^A-Za-z0-9])([A-Za-z]{2})[\s\-_|·•~]*(\d{3,4})(?:$|[^A-Za-z0-9])", text)
    if m2:
        for let, num in reversed(m2):
            letters = let.upper()
            if letters not in PROVINCES:
                return f"{letters}-{num.zfill(4)}", "Modern-2"

    return None


def normalize_plate(text: str) -> Dict[str, Any]:
    """
    Master normalization function for Sri Lankan vehicle plates.
    
    Processing order:
    1. Basic OCR cleaning
    2. Sri Series detection
    3. Military detection
    4. Civilian province detection & Modern normalization
    5. Special / Unknown handling
    """
    raw_plate = text if text is not None else ""
    cleaned = basic_clean(raw_plate)

    if not cleaned:
        return {
            "raw_plate": raw_plate,
            "normalized_plate": "",
            "plate_category": "Unknown",
            "valid": False,
            "text": "",
            "type": "Unknown"
        }

    # ---------------------------------------------------------
    # 1. Sri Series Detection (Sinhala and English variations)
    # ---------------------------------------------------------
    m_sri_sin = SRI_SINHALA_REGEX.match(cleaned)
    if m_sri_sin:
        leading, trailing = m_sri_sin.group(1), m_sri_sin.group(2)
        norm = f"{leading}-{trailing}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Sri-Series",
            "valid": True,
            "text": norm,
            "type": "Sri-Series"
        }

    m_sri_eng = SRI_ENGLISH_REGEX.match(cleaned)
    if m_sri_eng:
        leading, trailing = m_sri_eng.group(1), m_sri_eng.group(2)
        norm = f"{leading}-{trailing}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Sri-Series",
            "valid": True,
            "text": norm,
            "type": "Sri-Series"
        }

    # ---------------------------------------------------------
    # 2. Military Detection (Sinhala and English variations)
    # ---------------------------------------------------------
    # Air Force
    m_air_sin = AIR_FORCE_SINHALA.match(cleaned)
    if m_air_sin:
        norm = f"AIR-{m_air_sin.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Air Force",
            "valid": True,
            "text": norm,
            "type": "Air Force"
        }
    m_air_eng = AIR_FORCE_ENGLISH.match(cleaned)
    if m_air_eng:
        norm = f"AIR-{m_air_eng.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Air Force",
            "valid": True,
            "text": norm,
            "type": "Air Force"
        }

    # Navy
    m_navy_sin = NAVY_SINHALA.match(cleaned)
    if m_navy_sin:
        norm = f"NAVY-{m_navy_sin.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Navy",
            "valid": True,
            "text": norm,
            "type": "Navy"
        }
    m_navy_eng = NAVY_ENGLISH.match(cleaned)
    if m_navy_eng:
        norm = f"NAVY-{m_navy_eng.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Navy",
            "valid": True,
            "text": norm,
            "type": "Navy"
        }

    # Army
    m_army_sin = ARMY_SINHALA.match(cleaned)
    if m_army_sin:
        norm = f"ARMY-{m_army_sin.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Army",
            "valid": True,
            "text": norm,
            "type": "Army"
        }
    m_army_eng = ARMY_ENGLISH.match(cleaned)
    if m_army_eng:
        norm = f"ARMY-{m_army_eng.group(1)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm,
            "plate_category": "Army",
            "valid": True,
            "text": norm,
            "type": "Army"
        }

    # ---------------------------------------------------------
    # 3. Civilian Modern Plates (Modern-2 and Modern-3)
    # ---------------------------------------------------------
    modern_res = normalize_modern(cleaned)
    if modern_res:
        norm_plate, category = modern_res
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm_plate,
            "plate_category": category,
            "valid": True,
            "text": norm_plate,
            "type": category
        }

    # ---------------------------------------------------------
    # 4. Vintage Numeric (e.g. 12-3456, 301-3456)
    # ---------------------------------------------------------
    cleaned_upper = cleaned.upper()
    compact_upper = re.sub(r"\s+", "", cleaned_upper)

    m_num = re.fullmatch(r"(\d{2,3})[ -]?(\d{4})", compact_upper)
    if m_num:
        norm_plate = f"{m_num.group(1)}-{m_num.group(2)}"
        return {
            "raw_plate": raw_plate,
            "normalized_plate": norm_plate,
            "plate_category": "Numeric",
            "valid": True,
            "text": norm_plate,
            "type": "Numeric"
        }

    # ---------------------------------------------------------
    # 5. Invalid / Unrecognized Plate
    # ---------------------------------------------------------
    return {
        "raw_plate": raw_plate,
        "normalized_plate": "",
        "plate_category": "Unknown",
        "valid": False,
        "text": "",
        "type": "Unknown"
    }


class PlateValidator:
    """
    Plate Validator and Normalizer Class.
    Integrated with OCR reader, retry engine, and backend.
    """

    def __init__(self):
        self.patterns = {
            "Modern3": re.compile(r"^[A-Z]{3}-\d{4}$"),
            "Modern2": re.compile(r"^[A-Z]{2}-\d{4}$"),
            "Numeric": re.compile(r"^\d{2,3}-\d{4}$"),
            "Sri-Series": re.compile(r"^\d{1,3}-\d{1,4}$"),
            "Army": re.compile(r"^ARMY-\d{4,5}$"),
            "Navy": re.compile(r"^NAVY-\d{4,5}$"),
            "Air Force": re.compile(r"^AIR-\d{4,5}$"),
        }

    def validate(self, text: str) -> Dict[str, Any]:
        """
        Validate and normalize OCR text.
        Returns dictionary with validation and normalization status.
        """
        if text is None:
            return {
                "valid": False,
                "type": "Unknown",
                "text": "",
                "raw_plate": "",
                "normalized_plate": "",
                "plate_category": "Unknown"
            }

        # Run master normalization
        norm_res = normalize_plate(text)
        return norm_res

    def normalize(self, text: str) -> Dict[str, Any]:
        """
        Alias to normalize_plate.
        """
        return normalize_plate(text)