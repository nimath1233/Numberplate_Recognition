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
except ImportError:
    from ai.modules.yolo_detector import YOLODetector
    from ai.modules.perspective import PerspectiveTransformer
    from ai.modules.preprocess import PlatePreprocessor
    from ai.modules.ocr_reader import OCRReader
    from ai.modules.validator import PlateValidator
    from ai.modules.image_quality import ImageQualityAnalyzer
    from ai.modules.retry_engine import RetryEngine
    from ai.modules.temporal_voter import TemporalPlateVoter


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

        # =================================================
        # TEMPORAL VOTER
        # =================================================

        self.temporal_voter = TemporalPlateVoter(
            window_size=5,
            min_confirmed_frames=2,
            min_confirmed_confidence=0.80,
            track_ttl_seconds=3.0
        )

        print("\nPipeline Ready (Pre-OCR Quality Gate & Temporal Voting Active)!")


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