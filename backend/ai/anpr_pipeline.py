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
except ImportError:
    from ai.modules.yolo_detector import YOLODetector
    from ai.modules.perspective import PerspectiveTransformer
    from ai.modules.preprocess import PlatePreprocessor
    from ai.modules.ocr_reader import OCRReader
    from ai.modules.validator import PlateValidator
    from ai.modules.image_quality import ImageQualityAnalyzer
    from ai.modules.retry_engine import RetryEngine


_pipeline_instance = None


def get_pipeline() -> "ANPRPipeline":
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = ANPRPipeline()
    return _pipeline_instance


class ANPRPipeline:

    def __init__(self):

        print("=" * 60)
        print("Initializing Sri Lankan ANPR Pipeline V4...")
        print("=" * 60)

        # =================================================
        # YOLO
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

        print("\nPipeline Ready!")


    # =====================================================
    # PROCESS ONE IMAGE
    # =====================================================

    def process(self, image):

        start = time.perf_counter()

        # =================================================
        # YOLO DETECTION
        # =================================================

        detections = self.detector.detect(image)

        results = []

        # =================================================
        # PROCESS EACH PLATE
        # =================================================

        for plate in detections:

            try:

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
                # 2. RETRY ENGINE
                #
                # Inside RetryEngine:
                #
                # Perspective plate
                #       ↓
                # Adaptive upscale
                #       ↓
                # Quality analysis
                #       ↓
                # Preprocessing
                #       ↓
                # OCR
                #       ↓
                # Validation
                #       ↓
                # Retry if invalid
                # =========================================

                retry_start = time.perf_counter()

                ocr_result = self.retry_engine.recognize(
                    rectified
                )

                # Truncated Two-Line Plate Recovery:
                # If OCR resulted in an invalid/incomplete plate (e.g. standalone "WP 5842"),
                # perform an expanded upward crop from the original image to recover the top series digits.
                if not ocr_result.get("valid") and plate.get("bbox") is not None:
                    bx1, by1, bx2, by2 = plate["bbox"]
                    bh = by2 - by1
                    bw = bx2 - bx1
                    exp_y1 = max(0, by1 - int(round(bh * 0.85)))
                    exp_y2 = min(image.shape[0], by2 + int(round(bh * 0.15)))
                    exp_x1 = max(0, bx1 - int(round(bw * 0.08)))
                    exp_x2 = min(image.shape[1], bx2 + int(round(bw * 0.08)))

                    if (exp_y2 - exp_y1) > bh + 8:
                        exp_crop = image[exp_y1:exp_y2, exp_x1:exp_x2]
                        if exp_crop.size > 0:
                            exp_ocr = self.retry_engine.recognize(exp_crop)
                            if exp_ocr.get("valid"):
                                ocr_result = exp_ocr

                retry_time = (
                    time.perf_counter()
                    - retry_start
                ) * 1000

                # =========================================
                # 3. SAVE QUALITY INFORMATION
                # =========================================

                plate["quality"] = (
                    ocr_result["quality"]
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
                # 8. ADD RESULT & EARLY EXIT ON VALID
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