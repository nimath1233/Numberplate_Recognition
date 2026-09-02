"""
=========================================================
Image Quality Analyzer
=========================================================

Author : Senitha Kahatapitiya

Analyzes the quality of a detected number plate
before preprocessing.

This module DOES NOT modify the image.

It only measures image quality.
"""

import cv2
import numpy as np


class ImageQualityAnalyzer:

    def __init__(self):
        pass

    # -----------------------------------------------------
    # Brightness
    # -----------------------------------------------------

    def brightness(self, image):

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        return float(np.mean(gray))

    # -----------------------------------------------------
    # Contrast
    # -----------------------------------------------------

    def contrast(self, image):

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        return float(np.std(gray))

    # -----------------------------------------------------
    # Blur
    # -----------------------------------------------------

    def blur(self, image):

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        return float(
            cv2.Laplacian(
                gray,
                cv2.CV_64F
            ).var()
        )

    # -----------------------------------------------------
    # Plate Size
    # -----------------------------------------------------

    def plate_size(self, image):

        h, w = image.shape[:2]

        return w, h

    # -----------------------------------------------------
    # Main Analysis
    # -----------------------------------------------------

    def analyze(self, image):
        """
        Analyze image quality and recommend
        preprocessing steps.
        """

        brightness = self.brightness(image)
        contrast = self.contrast(image)
        blur = self.blur(image)
        width, height = self.plate_size(image)

        pipeline = []

        # Small plate
        if width < 180:
            pipeline.append("resize")

        # Dark image
        if brightness < 80:
            pipeline.append("gamma")

        # Bright image
        elif brightness > 180:
            pipeline.append("highlight")

        # Low contrast
        if contrast < 40:
            pipeline.append("clahe")

        # Blurry
        if blur < 100:
            pipeline.append("sharpen")

        # Quality score
        score = 100

        if brightness < 80 or brightness > 180:
            score -= 20

        if contrast < 40:
            score -= 20

        if blur < 100:
            score -= 30

        if width < 180:
            score -= 10

        if score >= 85:
            quality = "Excellent"
        elif score >= 70:
            quality = "Good"
        elif score >= 50:
            quality = "Fair"
        else:
            quality = "Poor"

        return {

            "brightness": brightness,
            "contrast": contrast,
            "blur": blur,

            "width": width,
            "height": height,

            "quality": quality,

            "score": score,

            "recommended_pipeline": pipeline

        }

    # -----------------------------------------------------
    # Fast Pre-OCR Quality Gate (<1ms)
    # -----------------------------------------------------

    def is_quality_acceptable(
        self,
        image,
        min_blur: float = 60.0,
        min_width: int = 45,
        min_height: int = 15,
        min_brightness: float = 25.0,
        max_brightness: float = 240.0,
    ) -> tuple[bool, str, dict]:
        """
        Ultra-fast pre-OCR gate (<1ms) to reject unreadable or motion-blurred crops
        BEFORE invoking deep OCR networks.
        
        Returns:
            (is_acceptable: bool, reason: str, metrics: dict)
        """
        if image is None or image.size == 0:
            return False, "Empty or invalid image crop", {"width": 0, "height": 0, "blur": 0.0, "brightness": 0.0}

        h, w = image.shape[:2]
        if w < min_width or h < min_height:
            return False, f"Plate crop too small ({w}x{h} < {min_width}x{min_height})", {
                "width": w, "height": h, "blur": 0.0, "brightness": 0.0
            }

        # Convert to grayscale once
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY) if len(image.shape) == 3 else image

        # 1. Motion Blur check via Laplacian variance
        blur_val = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if blur_val < min_blur:
            return False, f"Severe blur / motion artifact (blur={blur_val:.1f} < {min_blur})", {
                "width": w, "height": h, "blur": blur_val, "brightness": float(np.mean(gray))
            }

        # 2. Exposure check
        mean_bright = float(np.mean(gray))
        if mean_bright < min_brightness:
            return False, f"Severe underexposure (brightness={mean_bright:.1f} < {min_brightness})", {
                "width": w, "height": h, "blur": blur_val, "brightness": mean_bright
            }
        if mean_bright > max_brightness:
            return False, f"Severe overexposure / glare washout (brightness={mean_bright:.1f} > {max_brightness})", {
                "width": w, "height": h, "blur": blur_val, "brightness": mean_bright
            }

        return True, "Quality acceptable", {
            "width": w, "height": h, "blur": blur_val, "brightness": mean_bright
        }