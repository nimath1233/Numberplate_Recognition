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
from typing import Dict, Any, Optional, List, Tuple
import cv2
import numpy as np

try:
    from ai.config import YOLO_MODEL, YOLO_OPENVINO_MODEL, YOLO_ENGINE, YOLO_CONFIDENCE, YOLO_DEVICE, YOLO_IMGSZ
except ImportError:
    from config import YOLO_MODEL, YOLO_OPENVINO_MODEL, YOLO_ENGINE, YOLO_CONFIDENCE, YOLO_DEVICE, YOLO_IMGSZ



class YOLODetector:

    def __init__(self):
        self.engine_type = YOLO_ENGINE.upper()
        self.model = None
        self.compiled_model = None

        print("=" * 60)
        print(f"Initializing YOLO Exp004 Detector (Engine: {self.engine_type}, ImgSz: {YOLO_IMGSZ})...")
        print("=" * 60)

        # 1. Primary: Try Ultralytics PyTorch if engine is explicitly set to PYTORCH
        if self.engine_type == "PYTORCH":
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
                    
                    dev = YOLO_DEVICE if YOLO_DEVICE else ("cuda:0" if torch.cuda.is_available() else "cpu")
                    if "GPU" in dev.upper() or "CUDA" in dev.upper():
                        dev = "cuda:0" if torch.cuda.is_available() else "cpu"
                    self.device = dev
                    
                    print(f"Loading PyTorch Model on {self.device}: {pt_path}")
                    self.model = YOLO(str(pt_path))
                    self.model.to(self.device)
                    self.engine_type = "PYTORCH"
                    device_desc = f"{torch.cuda.get_device_name(0)} (CUDA)" if self.device.startswith("cuda") and torch.cuda.is_available() else f"CPU ({torch.get_num_threads()} threads)"
                    print(f"Unquantized YOLO Exp004 PyTorch Model loaded successfully! (Device: {device_desc})")
                    self.warmup()
                    return
                except Exception as e:
                    print(f"Warning: Failed to load PyTorch model ({e}). Attempting OpenVINO fallback...")

        # 2. Fallback / OpenVINO Runtime
        self._init_openvino()

    def _init_openvino(self):
        try:
            import openvino as ov
            ov_path = Path(YOLO_OPENVINO_MODEL)
            if ov_path.is_file() and ov_path.suffix.lower() == ".xml":
                xml_path = ov_path
            elif ov_path.is_dir():
                xml_path = ov_path / "best_exp004.xml"
                if not xml_path.exists():
                    xml_candidates = list(ov_path.glob("*.xml"))
                    if xml_candidates:
                        xml_path = xml_candidates[0]
            else:
                xml_path = ov_path / "best_exp004.xml"

            if not xml_path.exists():
                print(f"Warning: OpenVINO model not found at {xml_path}")
                return

            print(f"Loading OpenVINO Model: {xml_path}")
            self.core = ov.Core()

            # Configure OpenVINO Device
            target_device = YOLO_DEVICE.upper()
            if target_device not in self.core.available_devices:
                target_device = "CPU"

            model = self.core.read_model(str(xml_path))
            
            # If targeting CPU, set inference threads
            if target_device == "CPU":
                self.compiled_model = self.core.compile_model(
                    model,
                    target_device,
                    {"INFERENCE_NUM_THREADS": 4}
                )
            else:
                self.compiled_model = self.core.compile_model(model, target_device)

            print(f"OpenVINO compiled on {target_device}!")

            self.input_layer = self.compiled_model.input(0)
            self.output_layer = self.compiled_model.output(0)
            
            # Detect model input dimensions dynamically
            shape = self.input_layer.shape
            self.input_h = int(shape[2]) if len(shape) >= 4 else 960
            self.input_w = int(shape[3]) if len(shape) >= 4 else 960

            self.engine_type = "OPENVINO"
            self.warmup()
        except Exception as e:
            print(f"Critical error initializing YOLO OpenVINO: {e}")

    def warmup(self):
        print("YOLO model warm-up...")
        try:
            dummy = np.zeros((480, 640, 3), dtype=np.uint8)
            if self.engine_type == "PYTORCH" and self.model is not None:
                import torch
                dev = getattr(self, "device", "cuda:0" if torch.cuda.is_available() else "cpu")
                self.model.predict(dummy, conf=YOLO_CONFIDENCE, imgsz=YOLO_IMGSZ, device=dev, verbose=False)
            elif self.compiled_model is not None:
                h = getattr(self, "input_h", 960)
                w = getattr(self, "input_w", 960)
                tensor = np.zeros((1, 3, h, w), dtype=np.float32)
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
            # A. PYTORCH ENGINE (best_exp004.pt unquantized on CUDA / CPU)
            # -------------------------------------------------------------
            if self.engine_type == "PYTORCH" and self.model is not None:
                import torch
                orig_h, orig_w = image.shape[:2]
                dev = getattr(self, "device", "cuda:0" if torch.cuda.is_available() else "cpu")
                results = self.model.predict(image, conf=YOLO_CONFIDENCE, imgsz=YOLO_IMGSZ, device=dev, verbose=False)
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

                            if crop_w >= 28 and crop_h >= 12 and 1.0 <= aspect <= 7.5:
                                # Clean 6-8% margin padding without encroaching into car body
                                pad_y = max(2, int(round(crop_h * 0.08)))
                                pad_x = max(2, int(round(crop_w * 0.06)))

                                cy1 = max(0, y1 - pad_y)
                                cy2 = min(orig_h, y2 + pad_y)
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
                in_h = getattr(self, "input_h", 960)
                in_w = getattr(self, "input_w", 960)

                scale = min(float(in_w) / w, float(in_h) / h)
                nh, nw = int(round(h * scale)), int(round(w * scale))
                resized = cv2.resize(image, (nw, nh), interpolation=cv2.INTER_LINEAR)
                canvas = np.zeros((in_h, in_w, 3), dtype=np.uint8)
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

                    if crop_w >= 28 and crop_h >= 12 and 1.0 <= aspect <= 7.5:
                        # Directional padding: 10% top/bot and 5% left/right for square plates
                        if aspect < 2.0:
                            pad_y = max(2, int(round(crop_h * 0.10)))
                            pad_x = max(2, int(round(crop_w * 0.05)))
                        else:
                            pad_y = max(2, int(round(crop_h * 0.06)))
                            pad_x = max(2, int(round(crop_w * 0.06)))

                        cy1 = max(0, oy1 - pad_y)
                        cy2 = min(h, oy2 + pad_y)
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

    def switch_device(self, target_device: str, target_engine: Optional[str] = None) -> Dict[str, Any]:
        """
        Hot-switch YOLO detector between CPU and GPU (CUDA/OpenVINO).
        """
        target = target_device.strip().lower()
        engine = (target_engine or ("PYTORCH" if "cuda" in target or "gpu" in target else "OPENVINO")).upper()

        if "cuda" in target or "gpu" in target:
            try:
                import torch
                from ultralytics import YOLO
                if not torch.cuda.is_available():
                    return {"success": False, "error": "CUDA GPU is not available on this machine", "device": getattr(self, "device", "cpu")}

                pt_path = Path(YOLO_MODEL)
                if not pt_path.exists():
                    return {"success": False, "error": f"PyTorch model file not found: {pt_path}", "device": getattr(self, "device", "cpu")}

                self.device = "cuda:0"
                if self.model is None or self.engine_type != "PYTORCH":
                    self.model = YOLO(str(pt_path))
                self.model.to(self.device)
                self.engine_type = "PYTORCH"
                self.warmup()
                device_desc = f"{torch.cuda.get_device_name(0)} (CUDA)"
                return {"success": True, "engine": "PYTORCH", "device": "cuda:0", "device_name": device_desc}
            except Exception as e:
                return {"success": False, "error": str(e), "device": getattr(self, "device", "cpu")}
        else:
            # CPU target: Try OpenVINO first, or PyTorch on CPU
            try:
                if engine == "OPENVINO" or Path(YOLO_OPENVINO_MODEL).exists():
                    self.device = "cpu"
                    self.engine_type = "OPENVINO"
                    self._init_openvino()
                    return {"success": True, "engine": "OPENVINO", "device": "cpu", "device_name": "Intel OpenVINO (CPU)"}
                else:
                    import torch
                    from ultralytics import YOLO
                    pt_path = Path(YOLO_MODEL)
                    self.device = "cpu"
                    if self.model is None:
                        self.model = YOLO(str(pt_path))
                    self.model.to("cpu")
                    self.engine_type = "PYTORCH"
                    self.warmup()
                    return {"success": True, "engine": "PYTORCH", "device": "cpu", "device_name": f"PyTorch CPU ({torch.get_num_threads()} threads)"}
            except Exception as e:
                return {"success": False, "error": str(e), "device": getattr(self, "device", "cpu")}

    def get_device_status(self) -> Dict[str, Any]:
        """Return current hardware and device status for YOLO."""
        import sys
        cuda_avail = False
        gpu_name = "None"
        vram_mb = 0.0
        try:
            import torch
            cuda_avail = torch.cuda.is_available()
            if cuda_avail:
                gpu_name = torch.cuda.get_device_name(0)
                vram_mb = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 2)
        except Exception:
            pass

        current_dev = getattr(self, "device", "cpu")
        active_desc = gpu_name if current_dev.startswith("cuda") and cuda_avail else f"CPU ({self.engine_type})"

        return {
            "engine": self.engine_type,
            "device": current_dev,
            "is_gpu": current_dev.startswith("cuda") and cuda_avail,
            "device_name": active_desc,
            "cuda_available": cuda_avail,
            "gpu_hardware_name": gpu_name,
            "vram_allocated_mb": vram_mb
        }