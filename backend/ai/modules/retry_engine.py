"""
=========================================================
ANPR V4 Retry Engine
=========================================================

Author : Senitha Kahatapitiya

Pipeline:

Perspective corrected plate
        ↓
Adaptive upscale
        ↓
Quality analysis
        ↓
Adaptive preprocessing
        ↓
OCR
        ↓
Validation
        ↓
If invalid:
    Retry 1
    Retry 2
        ↓
Best result

The retry engine does NOT run unnecessary OCR attempts.
It stops immediately when a valid plate is found.
"""

import cv2
import numpy as np
import time
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


class RetryEngine:

    def __init__(
        self,
        quality_analyzer,
        preprocessor,
        ocr,
        validator,
        max_retries=2
    ):
        self.quality_analyzer = quality_analyzer
        self.preprocessor = preprocessor
        self.ocr = ocr
        self.validator = validator
        self.max_retries = max_retries

    # =====================================================
    # ADAPTIVE UPSCALE
    # =====================================================

    def upscale_plate(self, image):
        """
        Enlarge small perspective-corrected plates before OCR using Lanczos4 interpolation.
        Ensures character line height is at least 32-48px for clear stroke separation.
        """
        if image is None or image.size == 0:
            return None, 1.0

        height, width = image.shape[:2]
        aspect = width / max(1, height)
        is_two_line = aspect < 2.0
        line_h = height / 2.0 if is_two_line else float(height)

        if width < 100 or line_h < 20:
            scale = 3.5
        elif width < 150 or line_h < 28:
            scale = 2.5
        elif width < 220 or line_h < 36:
            scale = 1.8
        elif width < 300:
            scale = 1.3
        else:
            scale = 1.0

        if scale == 1.0:
            return image, 1.0

        new_width = max(1, int(round(width * scale)))
        new_height = max(1, int(round(height * scale)))

        interp = cv2.INTER_LANCZOS4 if scale >= 1.8 else cv2.INTER_CUBIC

        enlarged = cv2.resize(
            image,
            (new_width, new_height),
            interpolation=interp
        )

        return enlarged, scale

    # =====================================================
    # OCR ATTEMPT
    # =====================================================

    def run_ocr_attempt(self, image, attempt_name, mode="clean"):
        """
        Run OCR pass and validation with specialized preprocessing hypothesis:
        - mode="clean": Raw upscale
        - mode="clahe": CLAHE local contrast enhancement
        - mode="sharpen": Edge sharpening to separate merged character strokes
        - mode="unsharp_mask": Unsharp mask filtering
        """
        if image is None or image.size == 0:
            return {
                "text": "",
                "confidence": 0.0,
                "valid": False,
                "status": "INVALID",
                "validated_text": "",
                "plate_type": "Unknown",
                "attempt": attempt_name,
                "quality": None,
                "processed": None,
                "ocr_time_ms": 0.0,
                "preprocess_time_ms": 0.0,
            }

        # -------------------------------------------------
        # PREPROCESS HYPOTHESIS
        # -------------------------------------------------
        preprocess_start = time.perf_counter()
        if mode == "clahe":
            processed = self.preprocessor.clahe(image)
        elif mode == "sharpen":
            kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
            processed = cv2.filter2D(image, -1, kernel)
        elif mode == "unsharp_mask":
            gaussian = cv2.GaussianBlur(image, (0, 0), 2.0)
            processed = cv2.addWeighted(image, 1.5, gaussian, -0.5, 0)
        else:
            processed = image

        preprocess_time = (time.perf_counter() - preprocess_start) * 1000

        # -------------------------------------------------
        # OCR
        # -------------------------------------------------
        ocr = self.ocr.read(processed)
        text = ocr.get("text", "")
        confidence = float(ocr.get("confidence", 0.0))
        top_cand = ocr.get("top_candidate", "")
        bot_cand = ocr.get("bot_candidate", "")

        # -------------------------------------------------
        # VALIDATION & CANDIDATE NORMALIZATION
        # -------------------------------------------------
        validation = self.validator.validate(text)
        if not validation.get("valid") and top_cand and bot_cand:
            from .validator import parse_two_line_plate
            two_line_res = parse_two_line_plate(top_cand, bot_cand)
            if two_line_res and two_line_res.get("valid"):
                validation = two_line_res

        norm_plate = validation.get("normalized_plate", validation.get("text", text))
        plate_cat = validation.get("plate_category", validation.get("type", "Unknown"))
        status = validation.get("status", "VALID" if validation.get("valid") else "INVALID")

        return {
            "text": text,
            "raw_plate": text,
            "top_candidate": top_cand,
            "bot_candidate": bot_cand,
            "normalized_plate": norm_plate,
            "plate_category": plate_cat,
            "confidence": confidence,
            "valid": bool(validation.get("valid", False)),
            "status": status,
            "validated_text": norm_plate,
            "plate_type": plate_cat,
            "attempt": attempt_name,
            "quality": None,
            "processed": processed,
            "ocr_time_ms": float(ocr.get("time_ms", 0.0)),
            "preprocess_time_ms": preprocess_time,
        }

    # =====================================================
    # RETRY PIPELINE (MULTI-HYPOTHESIS PREPROCESSING ENSEMBLE)
    # =====================================================

    def recognize(self, rectified):
        """
        Multi-Hypothesis Preprocessing Ensemble + Strict Validation:
        Variant 1: Raw perspective crop + high-ratio Lanczos4 upscale
        Variant 2: Light CLAHE contrast
        Variant 3: Stroke Sharpening (separates fused character strokes)
        Variant 4: Unsharp Masking
        """
        if rectified is None or rectified.size == 0:
            return {
                "text": "",
                "confidence": 0.0,
                "valid": False,
                "status": "INVALID",
                "validated_text": "",
                "plate_type": "Unknown",
                "attempt": "none",
                "attempts": [],
                "upscale": 1.0,
                "total_ocr_time_ms": 0.0,
            }

        total_start = time.perf_counter()

        # Adaptive upscale for small crops
        enlarged, scale = self.upscale_plate(rectified)
        attempts = []

        # -------------------------------------------------
        # VARIANT 1: Clean High-Ratio Scaled Crop
        # -------------------------------------------------
        print(f"\nAdaptive upscale: {scale:.1f}x ({rectified.shape[1]}x{rectified.shape[0]} -> {enlarged.shape[1]}x{enlarged.shape[0]})")
        print("OCR Attempt 1 (Clean Crop)")

        result = self.run_ocr_attempt(enlarged, "clean_raw", mode="clean")
        attempts.append(result)

        print(f"Text       : {result['text']}")
        print(f"Confidence : {result['confidence']:.4f}")
        print(f"Status     : {result.get('status', 'INVALID')} (Valid={result['valid']})")

        # If valid and high confidence, return immediately
        if result["valid"] and result["confidence"] >= 0.85:
            result["attempts"] = attempts
            result["upscale"] = scale
            result["total_ocr_time_ms"] = (time.perf_counter() - total_start) * 1000
            print("SUCCESS on first OCR attempt.")
            return result

        # -------------------------------------------------
        # VARIANT 2: CLAHE Contrast Normalization
        # -------------------------------------------------
        if self.max_retries >= 1:
            print("\nOCR Attempt 2 (Light CLAHE Contrast)")
            clahe_result = self.run_ocr_attempt(enlarged, "light_clahe", mode="clahe")
            attempts.append(clahe_result)

            print(f"Text       : {clahe_result['text']}")
            print(f"Confidence : {clahe_result['confidence']:.4f}")
            print(f"Status     : {clahe_result.get('status', 'INVALID')} (Valid={clahe_result['valid']})")

            if clahe_result["valid"] and clahe_result["confidence"] >= 0.85:
                clahe_result["attempts"] = attempts
                clahe_result["upscale"] = scale
                clahe_result["total_ocr_time_ms"] = (time.perf_counter() - total_start) * 1000
                print("SUCCESS on CLAHE retry.")
                return clahe_result

        # -------------------------------------------------
        # VARIANT 3: Stroke Sharpening (Separates Fused Digits)
        # -------------------------------------------------
        if self.max_retries >= 2 or not any(a["valid"] for a in attempts):
            print("\nOCR Attempt 3 (Stroke Sharpening)")
            sharp_result = self.run_ocr_attempt(enlarged, "stroke_sharpen", mode="sharpen")
            attempts.append(sharp_result)

            print(f"Text       : {sharp_result['text']}")
            print(f"Confidence : {sharp_result['confidence']:.4f}")
            print(f"Status     : {sharp_result.get('status', 'INVALID')} (Valid={sharp_result['valid']})")

            if sharp_result["valid"] and sharp_result["confidence"] >= 0.85:
                sharp_result["attempts"] = attempts
                sharp_result["upscale"] = scale
                sharp_result["total_ocr_time_ms"] = (time.perf_counter() - total_start) * 1000
                print("SUCCESS on Sharpening retry.")
                return sharp_result

        # -------------------------------------------------
        # VARIANT 4: Unsharp Masking
        # -------------------------------------------------
        if not any(a["valid"] for a in attempts):
            print("\nOCR Attempt 4 (Unsharp Mask)")
            unsharp_result = self.run_ocr_attempt(enlarged, "unsharp_mask", mode="unsharp_mask")
            attempts.append(unsharp_result)

            print(f"Text       : {unsharp_result['text']}")
            print(f"Confidence : {unsharp_result['confidence']:.4f}")
            print(f"Status     : {unsharp_result.get('status', 'INVALID')} (Valid={unsharp_result['valid']})")

        # Select the best candidate across all hypotheses (preferring VALID candidates with highest confidence)
        best = max(
            attempts,
            key=lambda x: (
                x["valid"],
                x.get("status") in ["VALID", "PENDING_OCR"],
                x["confidence"]
            )
        )
        best["attempts"] = attempts
        best["upscale"] = scale
        best["total_ocr_time_ms"] = (time.perf_counter() - total_start) * 1000
        return best