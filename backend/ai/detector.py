"""
=========================================================
Sri Lankan ANPR - Number Plate Detector Wrapper
=========================================================
"""

import cv2
import numpy as np
from ai.modules.yolo_detector import YOLODetector


class Detector:
    def __init__(self):
        self._detector = YOLODetector()

    def detect(self, image: np.ndarray):
        """
        Detect license plates in an image.
        Returns list of detection dictionaries.
        """
        return self._detector.detect(image)
