"""
=========================================================
Sri Lankan ANPR - Camera Feed & Frame Processing Manager
=========================================================
"""

import cv2
import time
import numpy as np
from typing import Optional, Generator


class VideoCamera:
    def __init__(self, source=0):
        self.source = source
        self.cap = None

    def start(self):
        if self.cap is None or not self.cap.isOpened():
            self.cap = cv2.VideoCapture(self.source)
        return self.cap.isOpened()

    def stop(self):
        if self.cap and self.cap.isOpened():
            self.cap.release()
        self.cap = None

    def read_frame(self) -> Optional[np.ndarray]:
        if self.cap is None or not self.cap.isOpened():
            if not self.start():
                return None
        ret, frame = self.cap.read()
        if not ret:
            return None
        return frame

    def get_jpeg_frame(self) -> Optional[bytes]:
        frame = self.read_frame()
        if frame is None:
            return None
        ret, jpeg = cv2.imencode('.jpg', frame)
        if not ret:
            return None
        return jpeg.tobytes()

    def generate_mjpeg_stream(self) -> Generator[bytes, None, None]:
        while True:
            frame_bytes = self.get_jpeg_frame()
            if frame_bytes is None:
                time.sleep(0.1)
                continue
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
            )
            time.sleep(0.033)
