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
        Enlarge small perspective-corrected plates before OCR.
        Avoids redundant upscaling when plate width is already sufficient.
        """
        if image is None or image.size == 0:
            return None, 1.0

        height, width = image.shape[:2]

        if width < 100:
            scale = 2.5
        elif width < 160:
            scale = 1.8
        elif width < 220:
            scale = 1.3
        else:
            scale = 1.0

        if scale == 1.0:
            return image, 1.0

        new_width = max(1, int(width * scale))
        new_height = max(1, int(height * scale))

        enlarged = cv2.resize(
            image,
            (new_width, new_height),
            interpolation=cv2.INTER_CUBIC
        )

        return enlarged, scale

    # =====================================================
    # OCR ATTEMPT
    # =====================================================

    def run_ocr_attempt(self, image, attempt_name):
        """
        Run quality analysis → preprocessing → OCR → validation.
        """

        if image is None or image.size == 0:
            return {
                "text": "",
                "confidence": 0.0,
                "valid": False,
                "validated_text": "",
                "plate_type": "Unknown",
                "attempt": attempt_name,
                "quality": None,
                "processed": None,
                "ocr_time_ms": 0.0,
                "preprocess_time_ms": 0.0,
            }

        # -------------------------------------------------
        # QUALITY
        # -------------------------------------------------

        quality = self.quality_analyzer.analyze(image)

        # -------------------------------------------------
        # PREPROCESS
        # -------------------------------------------------

        preprocess_start = time.perf_counter()

        processed = self.preprocessor.process(
            image,
            quality
        )

        preprocess_time = (
            time.perf_counter() - preprocess_start
        ) * 1000

        # -------------------------------------------------
        # OCR
        # -------------------------------------------------

        ocr = self.ocr.read(processed)

        text = ocr.get("text", "")
        confidence = float(
            ocr.get("confidence", 0.0)
        )

        # -------------------------------------------------
        # VALIDATION & NORMALIZATION
        # -------------------------------------------------

        validation = self.validator.validate(text)

        # Automatic 2-Line / Square Plate De-stacker (e.g. WP CBE on top, 3319 on bottom)
        if not validation.get("valid", False) and image.shape[0] >= 30:
            h, w = image.shape[:2]
            aspect = w / max(1, h)
            if aspect <= 2.8:
                top_part = image[:int(h * 0.58), :]
                bottom_part = image[int(h * 0.42):, :]
                
                target_h = 48
                tw = max(10, int(top_part.shape[1] * (target_h / max(1, top_part.shape[0]))))
                bw = max(10, int(bottom_part.shape[1] * (target_h / max(1, bottom_part.shape[0]))))
                
                t_resized = cv2.resize(top_part, (tw, target_h), interpolation=cv2.INTER_LINEAR)
                b_resized = cv2.resize(bottom_part, (bw, target_h), interpolation=cv2.INTER_LINEAR)
                stitched = np.hstack([t_resized, b_resized])
                
                stitched_processed = self.preprocessor.process(stitched, quality)
                stitched_ocr = self.ocr.read(stitched_processed)
                stitched_text = stitched_ocr.get("text", "")
                stitched_val = self.validator.validate(stitched_text)
                
                if stitched_val.get("valid", False):
                    text = stitched_text
                    confidence = float(stitched_ocr.get("confidence", confidence))
                    validation = stitched_val
                    processed = stitched

        norm_plate = validation.get("normalized_plate", validation.get("text", text))
        plate_cat = validation.get("plate_category", validation.get("type", "Unknown"))

        return {
            "text": text,
            "raw_plate": text,
            "normalized_plate": norm_plate,
            "plate_category": plate_cat,
            "confidence": confidence,
            "valid": bool(validation.get("valid", False)),
            "validated_text": norm_plate,
            "plate_type": plate_cat,
            "attempt": attempt_name,
            "quality": quality,
            "processed": processed,
            "ocr_time_ms": float(
                ocr.get("time_ms", 0.0)
            ),
            "preprocess_time_ms": preprocess_time,
        }

    # =====================================================
    # RETRY PIPELINE
    # =====================================================

    def recognize(self, rectified):
        """
        Complete OCR + retry process.

        Attempt 0:
            Original perspective plate + adaptive upscale

        Retry 1:
            Gamma / CLAHE / sharpening based on quality

        Retry 2:
            Stronger enhancement

        Returns the best result.
        """

        if rectified is None or rectified.size == 0:
            return {
                "text": "",
                "confidence": 0.0,
                "valid": False,
                "validated_text": "",
                "plate_type": "Unknown",
                "attempt": "none",
                "attempts": [],
                "upscale": 1.0,
                "total_ocr_time_ms": 0.0,
            }

        total_start = time.perf_counter()

        # =================================================
        # ADAPTIVE UPSCALE
        # =================================================

        enlarged, scale = self.upscale_plate(
            rectified
        )

        print(
            f"\nAdaptive upscale: "
            f"{scale:.1f}x"
        )

        print(
            f"Perspective plate: "
            f"{rectified.shape[1]} x "
            f"{rectified.shape[0]}"
        )

        print(
            f"Enlarged plate: "
            f"{enlarged.shape[1]} x "
            f"{enlarged.shape[0]}"
        )

        attempts = []

        # =================================================
        # ATTEMPT 0
        # =================================================

        print("\nOCR Attempt 1/3")

        result = self.run_ocr_attempt(
            enlarged,
            "initial"
        )

        attempts.append(result)

        print(
            f"Text       : "
            f"{result['text']}"
        )

        print(
            f"Confidence : "
            f"{result['confidence']:.4f}"
        )

        print(
            f"Valid      : "
            f"{result['valid']}"
        )

        # =================================================
        # SUCCESS
        # =================================================

        if result["valid"]:
            result["attempts"] = attempts
            result["upscale"] = scale

            result["total_ocr_time_ms"] = (
                time.perf_counter()
                - total_start
            ) * 1000

            print(
                "\nSUCCESS on first OCR attempt."
            )

            return result

        # =================================================
        # RETRIES
        # =================================================

        retry_images = []

        # -------------------------------------------------
        # RETRY 1
        # -------------------------------------------------

        if self.max_retries >= 1:

            retry1 = enlarged.copy()

            # Mild sharpening
            retry1 = self.preprocessor.sharpen(
                retry1
            )

            retry_images.append(
                ("retry_1_sharpen", retry1)
            )

        # -------------------------------------------------
        # RETRY 2
        # -------------------------------------------------

        if self.max_retries >= 2:

            retry2 = enlarged.copy()

            # CLAHE
            retry2 = self.preprocessor.clahe(
                retry2
            )

            # Sharpen after CLAHE
            retry2 = self.preprocessor.sharpen(
                retry2
            )

            retry_images.append(
                ("retry_2_clahe_sharpen", retry2)
            )

        # =================================================
        # EXECUTE RETRIES
        # =================================================

        for retry_number, (
            retry_name,
            retry_image
        ) in enumerate(
            retry_images,
            start=1
        ):

            print(
                f"\nOCR Attempt "
                f"{retry_number + 1}/"
                f"{self.max_retries + 1}"
            )

            result = self.run_ocr_attempt(
                retry_image,
                retry_name
            )

            attempts.append(result)

            print(
                f"Text       : "
                f"{result['text']}"
            )

            print(
                f"Confidence : "
                f"{result['confidence']:.4f}"
            )

            print(
                f"Valid      : "
                f"{result['valid']}"
            )

            # -------------------------------------------------
            # VALID RESULT → STOP IMMEDIATELY
            # -------------------------------------------------

            if result["valid"]:

                result["attempts"] = attempts
                result["upscale"] = scale

                result["total_ocr_time_ms"] = (
                    time.perf_counter()
                    - total_start
                ) * 1000

                print(
                    f"\nSUCCESS on "
                    f"{retry_name}."
                )

                return result

        # =================================================
        # NO VALID RESULT
        # =================================================

        print(
            "\nNo valid plate after retries."
        )

        # Choose highest-confidence attempt
        best = max(
            attempts,
            key=lambda x: x["confidence"]
        )

        best["attempts"] = attempts
        best["upscale"] = scale

        best["total_ocr_time_ms"] = (
            time.perf_counter()
            - total_start
        ) * 1000

        return best