"""
=========================================================
ANPR Configuration
=========================================================

Author : Senitha Kahatapitiya / Updated for ANPR v4

Central configuration for Sri Lankan ANPR system optimized
for HP Z640 Workstation (Intel Xeon CPU + Ubuntu).
"""

from pathlib import Path
import os
import sys

# Ensure torch dll directory is in PATH on Windows before any imports
if sys.platform == "win32":
    try:
        import site
        for sp in site.getsitepackages():
            t_lib = Path(sp) / "torch" / "lib"
            if t_lib.exists():
                os.environ["PATH"] = str(t_lib) + ";" + os.environ.get("PATH", "")
                if hasattr(os, "add_dll_directory"):
                    try:
                        os.add_dll_directory(str(t_lib))
                    except Exception:
                        pass
    except Exception:
        pass

# =========================================================
# PROJECT ROOT
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

# =========================================================
# YOLO DETECTION (OpenVINO CPU / GPU / AUTO)
# =========================================================

YOLO_MODEL = (
    BASE_DIR
    / "best_exp004.pt"
)
YOLO_OPENVINO_MODEL = (
    BASE_DIR
    / "best_exp004_openvino_model"
)
YOLO_ENGINE = os.environ.get("ANPR_YOLO_ENGINE", "PYTORCH")
YOLO_CONFIDENCE = float(os.environ.get("ANPR_YOLO_CONF", "0.25"))
# Device options: 'GPU.1' (NVIDIA RTX 3050), 'GPU.0' (Intel iGPU), 'AUTO', 'CPU'
YOLO_DEVICE = os.environ.get("ANPR_YOLO_DEVICE", "GPU.1")
CACHE_DIR = BASE_DIR / "cache"

# =========================================================
# OCR RECOGNITION (Intel oneDNN / OpenVINO CPU)
# =========================================================

OCR_INFERENCE_DIR = (
    BASE_DIR
    / "inference"
)

OCR_DICT_PATH = (
    BASE_DIR
    / "OCR_Model"
    / "plate_dict_v1.txt"
)

OCR_DEVICE = os.environ.get("ANPR_OCR_DEVICE", "CPU")
OCR_NUM_THREADS = int(os.environ.get("ANPR_CPU_THREADS", 4))

# =========================================================
# OCR IMAGE SIZE
# =========================================================

OCR_WIDTH = 320
OCR_HEIGHT = 48