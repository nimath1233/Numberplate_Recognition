"""
=========================================================
Adaptive Plate Preprocessor
=========================================================

Author : Senitha Kahatapitiya

Applies preprocessing dynamically based on the
recommendations from ImageQualityAnalyzer.
"""

import cv2
import numpy as np

try:
    from ai.config import OCR_WIDTH, OCR_HEIGHT
except ImportError:
    from config import OCR_WIDTH, OCR_HEIGHT


class PlatePreprocessor:

    def __init__(self):
        pass

    # ---------------------------------------------------------
    # Resize
    # ---------------------------------------------------------

    def resize(self, image):

        return cv2.resize(
            image,
            (OCR_WIDTH, OCR_HEIGHT),
            interpolation=cv2.INTER_CUBIC
        )

    # ---------------------------------------------------------
    # Gamma Correction
    # ---------------------------------------------------------

    def gamma(self, image, gamma=1.5):

        inv = 1.0 / gamma

        table = np.array(
            [(i / 255.0) ** inv * 255 for i in range(256)],
            dtype=np.uint8
        )

        return cv2.LUT(image, table)

    # ---------------------------------------------------------
    # CLAHE
    # ---------------------------------------------------------

    def clahe(self, image):

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        clahe = cv2.createCLAHE(
            clipLimit=2.0,
            tileGridSize=(8, 8)
        )

        gray = clahe.apply(gray)

        return cv2.cvtColor(
            gray,
            cv2.COLOR_GRAY2BGR
        )

    # ---------------------------------------------------------
    # Sharpen
    # ---------------------------------------------------------

    def sharpen(self, image):

        kernel = np.array([
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0]
        ])

        return cv2.filter2D(
            image,
            -1,
            kernel
        )

    # ---------------------------------------------------------
    # Highlight Reduction
    # ---------------------------------------------------------

    def highlight(self, image):

        hsv = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2HSV
        )

        h, s, v = cv2.split(hsv)

        v = np.clip(v * 0.85, 0, 255).astype(np.uint8)

        hsv = cv2.merge((h, s, v))

        return cv2.cvtColor(
            hsv,
            cv2.COLOR_HSV2BGR
        )

    # ---------------------------------------------------------
    # Execute Recommended Pipeline
    # ---------------------------------------------------------

    def process(self, image, quality):

        processed = image.copy()

        print("\nRecommended Pipeline")

        print(quality["recommended_pipeline"])

        for step in quality["recommended_pipeline"]:

            if step == "resize":

                processed = self.resize(processed)

            elif step == "gamma":

                processed = self.gamma(processed)

            elif step == "clahe":

                processed = self.clahe(processed)

            elif step == "sharpen":

                processed = self.sharpen(processed)

            elif step == "highlight":

                processed = self.highlight(processed)

        return processed