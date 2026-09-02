"""
=============================================================================
Sri Lankan ANPR - Vehicle Body Detector (Stage 1)
=============================================================================
Detects full vehicle bodies (Car, Motorcycle, Bus, Truck) for multi-object
ByteTrack tracking before license plate extraction.
=============================================================================
"""

import os
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

import cv2

COCO_VEHICLE_CLASSES = {
    2: "Car",
    3: "Motorcycle",
    5: "Bus",
    7: "Truck"
}


class VehicleDetector:
    def __init__(self, model_path: Optional[str] = None, confidence: float = 0.35):
        self.confidence = confidence
        self.model = None


        # Resolve weights path
        if model_path:
            weights = Path(model_path)
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent
            weights = base_dir / "yolov8n.pt"
            if not weights.exists():
                weights = Path("yolov8n.pt")

        try:
            from ultralytics import YOLO
            print(f"[VehicleDetector] Loading YOLOv8 vehicle weights: {weights}")
            self.model = YOLO(str(weights))
            self.model.to("cpu")
            print("[VehicleDetector] Vehicle body detector initialized on CPU (Fast & Lightweight).")
        except Exception as e:
            print(f"[VehicleDetector] Warning: Could not initialize YOLOv8 vehicle model: {e}")
            self.model = None

    def detect(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect vehicle bodies in image.
        Returns:
            List of dicts:
            [
                {
                    "bbox": (x1, y1, x2, y2),
                    "confidence": float,
                    "category": "Car" | "Motorcycle" | "Bus" | "Truck",
                    "crop": np.ndarray
                }
            ]
        """
        if self.model is None or image is None or image.size == 0:
            return []

        h, w = image.shape[:2]
        vehicles = []

        try:
            results = self.model.predict(
                image,
                classes=list(COCO_VEHICLE_CLASSES.keys()),
                conf=self.confidence,
                device="cpu",
                verbose=False,
                imgsz=640
            )

            if results and len(results) > 0:
                boxes = results[0].boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()

                    x1 = max(0, min(w - 1, int(xyxy[0])))
                    y1 = max(0, min(h - 1, int(xyxy[1])))
                    x2 = max(0, min(w, int(xyxy[2])))
                    y2 = max(0, min(h, int(xyxy[3])))

                    if x2 <= x1 or y2 <= y1:
                        continue

                    category = COCO_VEHICLE_CLASSES.get(cls_id, "Car")
                    crop = image[y1:y2, x1:x2]

                    vehicles.append({
                        "bbox": (x1, y1, x2, y2),
                        "confidence": conf,
                        "category": category,
                        "crop": crop
                    })
        except Exception as err:
            print(f"[VehicleDetector] Inference error: {err}")

        return vehicles
