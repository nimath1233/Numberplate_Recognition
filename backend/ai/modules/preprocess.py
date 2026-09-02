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

    def clahe(self, image):
        """Mild CLAHE for low-contrast images."""
        if image is None or image.size == 0:
            return image
        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )
        clahe = cv2.createCLAHE(
            clipLimit=1.5,
            tileGridSize=(8, 8)
        )
        gray = clahe.apply(gray)
        return cv2.cvtColor(
            gray,
            cv2.COLOR_GRAY2BGR
        )

    def sharpen(self, image):
        """Subtle unsharp masking instead of harsh high-pass filter."""
        if image is None or image.size == 0:
            return image
        blurred = cv2.GaussianBlur(image, (0, 0), 1.0)
        return cv2.addWeighted(image, 1.2, blurred, -0.2, 0)

    def process(self, image, quality=None):
        """
        Gentle preprocessing pass. Only enhances if quality metrics indicate severe deficiency.
        """
        if image is None or image.size == 0:
            return image

        # Keep original image clean by default
        if quality is None:
            return image

        pipeline = quality.get("recommended_pipeline", [])
        processed = image.copy()

        if "clahe" in pipeline:
            processed = self.clahe(processed)
        elif "gamma" in pipeline:
            processed = self.gamma(processed)

        return processed