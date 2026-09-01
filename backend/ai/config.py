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
from dotenv import load_dotenv

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

# Load backend/.env if exists
env_path = BASE_DIR.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

# =========================================================
# YOLO DETECTION (PyTorch CUDA / OpenVINO GPU / CPU)
# =========================================================

# Default to INT8 Calibrated OpenVINO model for CPU acceleration if present
_DEFAULT_OV_DIR = BASE_DIR / "CPU Runnig" / "best_exp004_int8_calibrated_openvino_model"
if not _DEFAULT_OV_DIR.exists():
    _DEFAULT_OV_DIR = BASE_DIR / "best_exp004_openvino_model"

YOLO_OPENVINO_MODEL = Path(os.environ.get("ANPR_YOLO_OPENVINO_DIR", str(_DEFAULT_OV_DIR)))
YOLO_MODEL = Path(os.environ.get("ANPR_YOLO_MODEL", str(BASE_DIR / "best_exp004.pt")))
YOLO_ENGINE = os.environ.get("ANPR_YOLO_ENGINE", "PYTORCH")
YOLO_CONFIDENCE = float(os.environ.get("ANPR_YOLO_CONF", "0.25"))

# Device options: 'cuda:0', 'cuda', 'GPU.1', 'CPU'
YOLO_DEVICE = os.environ.get("ANPR_YOLO_DEVICE", "cuda:0")
YOLO_IMGSZ = int(os.environ.get("ANPR_YOLO_IMGSZ", "640"))
CACHE_DIR = BASE_DIR / "cache"

# =========================================================
# OCR RECOGNITION (ONNX Runtime / Intel oneDNN CPU Engine)
# =========================================================

# Default to newly trained FINAL ONNX model for high speed & accuracy
_DEFAULT_ONNX_MODEL = BASE_DIR / "CPU Runnig" / "sinhala_plate_ppocrv5_rec_FINAL.onnx"
_DEFAULT_INFERENCE_YML = BASE_DIR / "CPU Runnig" / "sinhala_plate_ppocrv5_rec_inference" / "inference.yml"

OCR_ONNX_MODEL = Path(os.environ.get("ANPR_OCR_ONNX_MODEL", str(_DEFAULT_ONNX_MODEL)))
OCR_INFERENCE_YML = Path(os.environ.get("ANPR_OCR_INFERENCE_YML", str(_DEFAULT_INFERENCE_YML)))
OCR_ENGINE = os.environ.get("ANPR_OCR_ENGINE", "ONNX")  # Options: 'ONNX', 'PADDLE'

# Default to high-accuracy PP-OCRv5 Server model directory for Paddle fallback
_DEFAULT_OCR_DIR = BASE_DIR / "CPU Runnig" / "inference"
if not _DEFAULT_OCR_DIR.exists():
    _DEFAULT_OCR_DIR = BASE_DIR / "inference"

OCR_INFERENCE_DIR = Path(os.environ.get("ANPR_OCR_INFERENCE_DIR", str(_DEFAULT_OCR_DIR)))

OCR_DICT_PATH = Path(
    os.environ.get(
        "ANPR_OCR_DICT_PATH",
        str(BASE_DIR / "OCR_Model" / "plate_dict_v1.txt")
    )
)

OCR_DEVICE = os.environ.get("ANPR_OCR_DEVICE", "CPU")
OCR_NUM_THREADS = int(os.environ.get("ANPR_CPU_THREADS", 4))
OCR_MAX_RETRIES = int(os.environ.get("ANPR_MAX_RETRIES", "1"))

# =========================================================
# OCR IMAGE SIZE
# =========================================================

OCR_WIDTH = 320
OCR_HEIGHT = 48