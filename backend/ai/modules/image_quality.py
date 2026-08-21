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