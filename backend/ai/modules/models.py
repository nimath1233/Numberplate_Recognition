from dataclasses import dataclass
from typing import Optional
import numpy as np


@dataclass
class PlateDetection:

    # Detection
    bbox: tuple
    polygon: np.ndarray
    yolo_confidence: float

    # Original image
    vehicle_image: np.ndarray

    # Processing
    rectified: Optional[np.ndarray] = None
    processed: Optional[np.ndarray] = None

    # OCR
    text: str = ""
    ocr_confidence: float = 0.0

    # Timing
    detect_time_ms: float = 0.0
    preprocess_time_ms: float = 0.0
    ocr_time_ms: float = 0.0