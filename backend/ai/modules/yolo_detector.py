"""
=========================================================
Sri Lankan ANPR - High Precision YOLO Detector (PyTorch & OpenVINO)
=========================================================

Author : Senitha Kahatapitiya / Updated for ANPR v4

Engine:
    Primary  : Ultralytics YOLO PyTorch (best_exp004.pt unquantized)
    Fallback : Intel OpenVINO Engine (best_exp004_openvino_model)

Input:
    BGR image (any resolution)

Output:
    List of detections:
    [
        {
            "bbox": (x1, y1, x2, y2),
            "polygon": None,
            "crop": np.ndarray,
            "yolo_confidence": float,
            "detection_time_ms": float
        }
    ]
"""

import time
import os
from pathlib import Path
import cv2
import numpy as np

try:
    from ai.config import YOLO_MODEL, YOLO_OPENVINO_MODEL, YOLO_ENGINE, YOLO_CONFIDENCE, YOLO_DEVICE
except ImportError:
    from config import YOLO_MODEL, YOLO_OPENVINO_MODEL, YOLO_ENGINE, YOLO_CONFIDENCE, YOLO_DEVICE


class YOLODetector:

    def __init__(self):
        self.engine_type = YOLO_ENGINE.upper()
        self.model = None
        self.compiled_model = None

        print("=" * 60)
        print(f"Initializing YOLO Exp004 Detector (Engine: {self.engine_type})...")
        print("=" * 60)

        # 1. Primary: Try Ultralytics PyTorch with best_exp004.pt
        if self.engine_type == "PYTORCH" or str(YOLO_MODEL).endswith(".pt"):
            pt_path = Path(YOLO_MODEL)
            if pt_path.exists():
                try:
                    # Ensure torch dll directory is registered on Windows
                    import site
                    for sp in site.getsitepackages():
                        t_lib = Path(sp) / "torch" / "lib"
                        if t_lib.exists():
                            try:
                                os.environ["PATH"] = str(t_lib) + ";" + os.environ.get("PATH", "")
                                if hasattr(os, "add_dll_directory"):
                                    os.add_dll_directory(str(t_lib))
                            except Exception:
                                pass

                    import torch
                    from ultralytics import YOLO
                    try:
                        torch.set_num_threads(os.cpu_count() or 4)
                    except Exception:
                        pass
                    print(f"Loading Unquantized PyTorch Model: {pt_path}")
                    self.model = YOLO(str(pt_path))
                    self.engine_type = "PYTORCH"
                    print(f"Unquantized YOLO Exp004 PyTorch Model loaded successfully! (Device: {'CUDA' if torch.cuda.is_available() else 'CPU'}, Threads: {torch.get_num_threads()})")
                    self.warmup()
                    return
                except Exception as e:
                    print(f"Warning: Failed to load PyTorch model ({e}). Attempting OpenVINO fallback...")

        # 2. Fallback / OpenVINO Runtime
        self._init_openvino()

    def _init_openvino(self):
        try:
            import openvino as ov
            ov_dir = Path(YOLO_OPENVINO_MODEL)
            xml_path = ov_dir / "best_exp004.xml"
            bin_path = ov_dir / "best_exp004.bin"

            if not xml_path.exists():
                raise FileNotFoundError(f"OpenVINO model not found in {ov_dir}")

            print(f"Loading OpenVINO Model: {xml_path}")
            self.core = ov.Core()
            model = self.core.read_model(str(xml_path))
            
            target_device = YOLO_DEVICE
            available_devices = self.core.available_devices
            if target_device not in available_devices and target_device not in ("AUTO", "GPU"):
                target_device = "GPU.1" if "GPU.1" in available_devices else ("GPU.0" if "GPU.0" in available_devices else "CPU")
            
            compile_config = {"PERFORMANCE_HINT": "LATENCY"}
            if target_device == "CPU":
                compile_config["INFERENCE_NUM_THREADS"] = "4"

            try:
                self.compiled_model = self.core.compile_model(model, target_device, compile_config)
                print(f"OpenVINO compiled on {target_device}!")
            except Exception:
                self.compiled_model = self.core.compile_model(model, "CPU", {"PERFORMANCE_HINT": "LATENCY", "INFERENCE_NUM_THREADS": "4"})
                print("OpenVINO compiled on CPU fallback!")

            self.input_layer = self.compiled_model.input(0)
            self.output_layer = self.compiled_model.output(0)
            self.engine_type = "OPENVINO"
            self.warmup()
        except Exception as e:
            print(f"Critical error initializing YOLO OpenVINO: {e}")

    def warmup(self):
        print("YOLO model warm-up...")
        try:
            dummy = np.zeros((480, 640, 3), dtype=np.uint8)
            if self.engine_type == "PYTORCH" and self.model is not None:
                self.model.predict(dummy, conf=YOLO_CONFIDENCE, imgsz=640, verbose=False)
            elif self.compiled_model is not None:
                tensor = np.zeros((1, 3, 960, 960), dtype=np.float32)
                for _ in range(2):
                    self.compiled_model([tensor])
            print("YOLO warm-up complete.")
        except Exception as e:
            print(f"Warm-up notice: {e}")

    def detect(self, image):
        """
        Detect license plates in an image frame.
        """
        if image is None or image.size == 0:
            return []

        start = time.perf_counter()
        detections = []

        try:
            # -------------------------------------------------------------
            # A. PYTORCH ENGINE (best_exp004.pt unquantized)
            # -------------------------------------------------------------
            if self.engine_type == "PYTORCH" and self.model is not None:
                orig_h, orig_w = image.shape[:2]
                results = self.model.predict(image, conf=YOLO_CONFIDENCE, imgsz=640, verbose=False)
                inference_time = (time.perf_counter() - start) * 1000

                if results and len(results) > 0:
                    r = results[0]
                    if r.boxes is not None:
                        for box in r.boxes:
                            x1, y1, x2, y2 = [int(round(v)) for v in box.xyxy[0].tolist()]
                            conf = float(box.conf[0])

                            x1 = max(0, min(orig_w - 1, x1))
                            y1 = max(0, min(orig_h - 1, y1))
                            x2 = max(x1 + 1, min(orig_w, x2))
                            y2 = max(y1 + 1, min(orig_h, y2))

                            crop_w = x2 - x1
                            crop_h = y2 - y1
                            aspect = crop_w / max(1, crop_h)

                            if crop_w >= 30 and crop_h >= 12 and 1.1 <= aspect <= 7.0:
                                # Expand crop upward by 35-40% to capture two-line / square plate top series
                                pad_top = int(round(crop_h * 0.38))
                                pad_bot = int(round(crop_h * 0.10))
                                pad_x = int(round(crop_w * 0.08))

                                cy1 = max(0, y1 - pad_top)
                                cy2 = min(orig_h, y2 + pad_bot)
                                cx1 = max(0, x1 - pad_x)
                                cx2 = min(orig_w, x2 + pad_x)

                                crop = image[cy1:cy2, cx1:cx2].copy()
                                detections.append({
                                    "bbox": (x1, y1, x2, y2),
                                    "polygon": None,
                                    "crop": crop,
                                    "yolo_confidence": conf,
                                    "detection_time_ms": inference_time
                                })

                            if len(detections) >= 3:
                                break

                print(f"\nYOLO PyTorch Detections : {len(detections)}")
                print(f"YOLO Time             : {inference_time:.2f} ms")
                return detections

            # -------------------------------------------------------------
            # B. OPENVINO ENGINE (best_exp004_openvino_model)
            # -------------------------------------------------------------
            elif self.compiled_model is not None:
                h, w = image.shape[:2]
                scale = 960.0 / max(h, w)
                nh, nw = int(round(h * scale)), int(round(w * scale))
                resized = cv2.resize(image, (nw, nh), interpolation=cv2.INTER_LINEAR)
                canvas = np.zeros((960, 960, 3), dtype=np.uint8)
                canvas[:nh, :nw] = resized

                canvas_rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)
                tensor = canvas_rgb.transpose(2, 0, 1).astype(np.float32) / 255.0
                tensor = np.ascontiguousarray(np.expand_dims(tensor, axis=0))

                results = self.compiled_model([tensor])
                out0 = results[self.output_layer][0]
                inference_time = (time.perf_counter() - start) * 1000

                top_indices = np.argsort(out0[:, 4])[::-1]
                for idx in top_indices:
                    x1, y1, x2, y2, conf = out0[idx, :5]
                    if conf < YOLO_CONFIDENCE:
                        continue

                    ox1 = max(0, min(w - 1, int(round(x1 / scale))))
                    oy1 = max(0, min(h - 1, int(round(y1 / scale))))
                    ox2 = max(ox1 + 1, min(w, int(round(x2 / scale))))
                    oy2 = max(oy1 + 1, min(h, int(round(y2 / scale))))

                    crop_w = ox2 - ox1
                    crop_h = oy2 - oy1
                    aspect = crop_w / max(1, crop_h)

                    if crop_w >= 30 and crop_h >= 12 and 1.1 <= aspect <= 7.0:
                        # Expand crop upward by 35-40% to capture two-line / square plate top series
                        pad_top = int(round(crop_h * 0.38))
                        pad_bot = int(round(crop_h * 0.10))
                        pad_x = int(round(crop_w * 0.08))

                        cy1 = max(0, oy1 - pad_top)
                        cy2 = min(h, oy2 + pad_bot)
                        cx1 = max(0, ox1 - pad_x)
                        cx2 = min(w, ox2 + pad_x)

                        crop = image[cy1:cy2, cx1:cx2].copy()
                        detections.append({
                            "bbox": (ox1, oy1, ox2, oy2),
                            "polygon": None,
                            "crop": crop,
                            "yolo_confidence": float(conf),
                            "detection_time_ms": inference_time
                        })

                    if len(detections) >= 3:
                        break

                print(f"\nYOLO OpenVINO Detections : {len(detections)}")
                print(f"YOLO Time                : {inference_time:.2f} ms")
                return detections

        except Exception as e:
            print(f"YOLO Detection Error: {e}")
            return []

        return detections