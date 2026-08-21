"""
=========================================================
Sri Lankan ANPR - OCR Recognition Wrapper
=========================================================
"""

import numpy as np
from ai.modules.ocr_reader import OCRReader
from ai.modules.validator import PlateValidator, normalize_plate


class OCR:
    def __init__(self):
        self._reader = OCRReader()
        self._validator = PlateValidator()

    def recognize(self, image: np.ndarray):
        """
        Recognize text from plate image crop and normalize plate output.
        """
        ocr_res = self._reader.read(image)
        norm_res = self._validator.validate(ocr_res.get("text", ""))
        
        return {
            "raw_text": ocr_res.get("text", ""),
            "confidence": ocr_res.get("confidence", 0.0),
            "normalized_plate": norm_res.get("normalized_plate", ""),
            "plate_category": norm_res.get("plate_category", "Unknown"),
            "valid": norm_res.get("valid", False),
            "time_ms": ocr_res.get("time_ms", 0.0)
        }
