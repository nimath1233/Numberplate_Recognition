"""
=========================================================
Sri Lankan ANPR - High Performance OCR Reader
=========================================================

Author : Senitha Kahatapitiya / Updated for ANPR Final ONNX
Engine:
    Sinhala Plate PP-OCRv5 Recognition (ONNX Runtime / Intel oneDNN)
    Optimized for multi-threaded CPU inference (< 20ms)

Input:
    BGR plate image crop

Output:
    {
        "text": str,
        "confidence": float,
        "time_ms": float
    }
=========================================================
"""

import time
import os
import re
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
import cv2
import numpy as np
import yaml

try:
    from ai.config import (
        OCR_ENGINE,
        OCR_ONNX_MODEL,
        OCR_INFERENCE_YML,
        OCR_INFERENCE_DIR,
        OCR_DICT_PATH,
        OCR_WIDTH,
        OCR_HEIGHT,
        OCR_NUM_THREADS,
    )
except ImportError:
    from config import (
        OCR_ENGINE,
        OCR_ONNX_MODEL,
        OCR_INFERENCE_YML,
        OCR_INFERENCE_DIR,
        OCR_DICT_PATH,
        OCR_WIDTH,
        OCR_HEIGHT,
        OCR_NUM_THREADS,
    )

# Sri Lankan Provincial Prefixes
SRI_LANKAN_PROVINCES = ["WP", "SG", "CP", "SP", "NW", "NC", "EP", "UP", "NP", "DP"]


class OCRReader:

    def __init__(self):
        print("=" * 60)
        print("Initializing Sri Lankan ANPR OCR Engine...")
        print("=" * 60)

        self.engine_type = OCR_ENGINE.upper()
        self.num_threads = OCR_NUM_THREADS
        self.device = "cpu"

        # -------------------------------------------------
        # 1. Load Character Dictionary
        # -------------------------------------------------
        self.characters = self._load_dictionary()
        print(f"Dictionary classes: {len(self.characters)} (Total CTC classes: {len(self.characters) + 2})")

        # -------------------------------------------------
        # 2. Initialize Model Engine (ONNX default, Paddle fallback)
        # -------------------------------------------------
        if self.engine_type == "ONNX" and OCR_ONNX_MODEL.exists():
            self._init_onnx_engine()
        else:
            self._init_paddle_engine()

        # Warm-up
        self._warmup()
        print(f"OCR Reader initialized successfully ({self.engine_type} Engine on CPU)!")

    def _load_dictionary(self) -> List[str]:
        """Load exact character dictionary from inference.yml or dictionary file."""
        if OCR_INFERENCE_YML.exists():
            try:
                with open(OCR_INFERENCE_YML, "r", encoding="utf-8") as f:
                    yml_data = yaml.safe_load(f)
                chars = yml_data.get("PostProcess", {}).get("character_dict", [])
                if chars:
                    return chars
            except Exception as e:
                print(f"Warning: Could not parse {OCR_INFERENCE_YML}: {e}")

        if OCR_DICT_PATH.exists():
            with open(OCR_DICT_PATH, "r", encoding="utf-8") as f:
                return [line.rstrip("\r\n") for line in f if line.rstrip("\r\n")]

        # Fallback standard 50-character Sri Lankan dictionary
        return [
            '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
            'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
            'W', 'X', 'Y', 'Z', 'ග', 'න', 'ය', 'ර', 'ව', 'ශ', 'හ',
            '්', 'ා', 'ී', 'ු', '‍'
        ]

    def _init_onnx_engine(self):
        """Initialize ONNX Runtime inference session with multi-threaded CPU provider."""
        import onnxruntime as ort

        print(f"Loading ONNX Model: {OCR_ONNX_MODEL}")
        sess_options = ort.SessionOptions()
        sess_options.intra_op_num_threads = self.num_threads
        sess_options.inter_op_num_threads = self.num_threads
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        providers = ["CPUExecutionProvider"]
        self.session = ort.InferenceSession(str(OCR_ONNX_MODEL), sess_options, providers=providers)
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.engine_type = "ONNX"

    def _init_paddle_engine(self):
        """Fallback initialization for Paddle Inference."""
        import paddle.inference as paddle_infer

        json_path = OCR_INFERENCE_DIR / "inference.json"
        if not json_path.exists():
            json_path = OCR_INFERENCE_DIR / "inference.pdmodel"
        pdiparams_path = OCR_INFERENCE_DIR / "inference.pdiparams"

        print(f"Loading Paddle Model: {json_path}")
        config = paddle_infer.Config(str(json_path), str(pdiparams_path))
        config.disable_gpu()
        config.set_cpu_math_library_num_threads(self.num_threads)
        config.switch_ir_optim(False)

        self.predictor = paddle_infer.create_predictor(config)
        self.input_name = self.predictor.get_input_names()[0]
        self.output_name = self.predictor.get_output_names()[0]
        self.input_tensor = self.predictor.get_input_handle(self.input_name)
        self.output_tensor = self.predictor.get_output_handle(self.output_name)
        self.engine_type = "PADDLE"

    def _warmup(self):
        """Warm-up model with dummy tensor to avoid initial latency jitter."""
        dummy = np.zeros((1, 3, OCR_HEIGHT, OCR_WIDTH), dtype=np.float32)
        for _ in range(2):
            if self.engine_type == "ONNX":
                self.session.run([self.output_name], {self.input_name: dummy})
            else:
                self.input_tensor.reshape([1, 3, OCR_HEIGHT, OCR_WIDTH])
                self.input_tensor.copy_from_cpu(dummy)
                self.predictor.run()

    def _preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        Exact PaddleOCR 2.10 RecResizeImg aspect-ratio preserving preprocessing:
        - Scales height to OCR_HEIGHT (48)
        - Computes proportional width capped at OCR_WIDTH (320)
        - Normalizes to [-1.0, 1.0] (image / 255.0 - 0.5) / 0.5
        - Zero-pads to (48, 320, 3) and converts to NCHW
        """
        if image is None or image.size == 0:
            raise ValueError("OCR received an empty image crop.")

        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

        h, w = image.shape[:2]
        ratio = w / float(max(1, h))

        target_h = OCR_HEIGHT
        target_w = OCR_WIDTH

        resize_w = int(round(target_h * ratio))
        if resize_w > target_w:
            resize_w = target_w
        if resize_w < 1:
            resize_w = 1

        resized = cv2.resize(image, (resize_w, target_h), interpolation=cv2.INTER_CUBIC)
        resized = resized.astype("float32") / 255.0
        resized = (resized - 0.5) / 0.5

        padded = np.zeros((target_h, target_w, 3), dtype=np.float32)
        padded[:, 0:resize_w, :] = resized

        # BGR -> RGB
        padded = padded[:, :, ::-1]

        # HWC -> CHW -> NCHW
        padded = padded.transpose((2, 0, 1))
        padded = np.expand_dims(padded, axis=0)

        return np.ascontiguousarray(padded, dtype=np.float32)

    def _format_sri_lankan_ocr(self, text: str) -> str:
        """
        Format raw OCR token sequence for Sri Lankan plate specifications:
        1. Separates merged province prefixes (e.g. 'SGKX-6671' -> 'SG KX-6671', 'WPCBE-3949' -> 'WP CBE-3949')
        2. Normalizes hyphens and punctuation artifacts
        3. Inserts missing hyphens before 4 trailing digits (e.g. 'WP CAD8260' -> 'WP CAD-8260')
        """
        if not text:
            return ""

        s = text.strip().upper()

        # Collapse repeated hyphens and spaces
        s = re.sub(r"[-–—\s]*[-–—]{2,}[-–—\s]*", " ", s)
        s = re.sub(r"\s*-\s*", "-", s)
        s = re.sub(r"^[^\w\u0D80-\u0DFF]+|[^\w\u0D80-\u0DFF]+$", "", s)

        # Check for provincial prefix directly attached to series letters
        for prov in SRI_LANKAN_PROVINCES:
            if s.startswith(prov) and len(s) > len(prov):
                rest = s[len(prov):].lstrip(" -_")
                s = f"{prov} {rest}"
                break

        # Ensure hyphen before 4 digits if series letters are followed directly by numbers
        s = re.sub(r"([A-Z]{2,3})(\d{4})", r"\1-\2", s)
        # Ensure hyphen between 2 or 3 digit series numbers and 4 digits (e.g. '3013949' -> '301-3949')
        s = re.sub(r"^(\d{2,3})(\d{4})$", r"\1-\2", s)

        return s.strip()

    def _decode_ctc(self, prediction: np.ndarray) -> Tuple[str, float]:
        """
        52-Class CTC greedy decoder:
        - Class 0: CTC blank
        - Class 1..50: Character dictionary
        - Class 51: Extra class / space
        """
        pred = np.asarray(prediction)
        if pred.ndim == 3:
            pred = pred[0]

        # Apply softmax if needed
        if pred.min() < 0.0 or pred.max() > 1.0:
            exp_pred = np.exp(pred - np.max(pred, axis=-1, keepdims=True))
            pred = exp_pred / np.sum(exp_pred, axis=-1, keepdims=True)

        indices = np.argmax(pred, axis=-1)
        probabilities = np.max(pred, axis=-1)

        text = []
        char_confidences = []
        previous_index = -1

        for idx, probability in zip(indices, probabilities):
            idx = int(idx)
            if idx == 0 or idx == previous_index:
                previous_index = idx
                continue

            if 1 <= idx <= len(self.characters):
                char = self.characters[idx - 1]
                if char:
                    text.append(char)
                    char_confidences.append(float(probability))
            elif idx == len(self.characters) + 1:
                # Space or extra class
                text.append(" ")

            previous_index = idx

        raw_text = "".join(text).strip()
        formatted_text = self._format_sri_lankan_ocr(raw_text)
        confidence = float(np.mean(char_confidences)) if char_confidences else 0.0

        return formatted_text, confidence

    def _read_single_strip(self, image: np.ndarray) -> Tuple[str, float]:
        """Perform OCR inference on a single horizontal plate crop."""
        tensor = self._preprocess(image)

        if self.engine_type == "ONNX":
            output = self.session.run([self.output_name], {self.input_name: tensor})[0]
        else:
            self.input_tensor.reshape([1, 3, OCR_HEIGHT, OCR_WIDTH])
            self.input_tensor.copy_from_cpu(tensor)
            self.predictor.run()
            output = self.output_tensor.copy_to_cpu()

        return self._decode_ctc(output)

    def read(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Recognize text from plate image.
        Supports both single-line horizontal plates and two-line square plates with
        adaptive full-pass and two-strip evaluation.
        Returns:
            {
                "text": str,
                "confidence": float,
                "top_candidate": str,
                "bot_candidate": str,
                "time_ms": float
            }
        """
        if image is None or image.size == 0:
            return {"text": "", "confidence": 0.0, "top_candidate": "", "bot_candidate": "", "time_ms": 0.0}

        start = time.perf_counter()
        try:
            h, w = image.shape[:2]
            aspect = w / max(1, h)

            top_cand = ""
            bot_cand = ""

            # 1. First attempt full-crop single pass
            full_text, full_conf = self._read_single_strip(image)

            best_text = full_text
            best_conf = full_conf

            # 2. For square/tall plates (aspect < 2.0 and height >= 20px), also evaluate two-line split
            if aspect < 2.0 and h >= 20:
                if aspect < 1.35:
                    y1_top, y2_top = max(0, int(h * 0.06)), min(h, int(h * 0.45))
                    x1_top, x2_top = max(0, int(w * 0.05)), min(w, int(w * 0.95))
                    y1_bot, y2_bot = max(0, int(h * 0.46)), min(h, int(h * 0.94))
                    x1_bot, x2_bot = max(0, int(w * 0.05)), min(w, int(w * 0.95))
                else:
                    y1_top, y2_top = max(0, int(h * 0.05)), min(h, int(h * 0.48))
                    x1_top, x2_top = max(0, int(w * 0.04)), min(w, int(w * 0.92))
                    y1_bot, y2_bot = max(0, int(h * 0.48)), min(h, int(h * 0.95))
                    x1_bot, x2_bot = max(0, int(w * 0.04)), min(w, int(w * 0.96))

                top_crop = image[y1_top:y2_top, x1_top:x2_top]
                bot_crop = image[y1_bot:y2_bot, x1_bot:x2_bot]

                top_text, top_conf = "", 0.0
                bot_text, bot_conf = "", 0.0

                if top_crop.size > 0:
                    top_text, top_conf = self._read_single_strip(top_crop)
                if bot_crop.size > 0:
                    bot_text, bot_conf = self._read_single_strip(bot_crop)

                clean_top = re.sub(r"[-–—\s]+$", "", top_text).strip()
                clean_bot = re.sub(r"^[-–—\s]+|[-–—\s]+$", "", bot_text).strip()

                combined_parts = [p for p in (clean_top, clean_bot) if p]
                split_combined = " ".join(combined_parts).strip()
                split_conf = (top_conf + bot_conf) / 2.0 if (top_conf and bot_conf) else max(top_conf, bot_conf)

                top_cand = clean_top
                bot_cand = clean_bot

                # Prefer split if full pass was weak and split produced both halves
                if clean_top and clean_bot and (split_conf > full_conf or len(full_text) < 4):
                    best_text = split_combined
                    best_conf = split_conf

            elapsed = (time.perf_counter() - start) * 1000
            return {
                "text": best_text,
                "confidence": best_conf,
                "top_candidate": top_cand,
                "bot_candidate": bot_cand,
                "time_ms": elapsed
            }
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            print(f"OCR Reader Error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "top_candidate": "",
                "bot_candidate": "",
                "time_ms": elapsed
            }

    def switch_device(self, target_device: str) -> Dict[str, Any]:
        """Switch hardware execution provider for OCR."""
        target = target_device.strip().lower()
        if "cuda" in target or "gpu" in target:
            try:
                import onnxruntime as ort
                if "CUDAExecutionProvider" in ort.get_available_providers():
                    self.session = ort.InferenceSession(str(OCR_ONNX_MODEL), providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
                    self.device = "gpu"
                    self._warmup()
                    return {"success": True, "device": "gpu", "device_name": "ONNX CUDA GPU"}
                else:
                    return {"success": False, "error": "CUDAExecutionProvider not available. Running on CPU.", "device": "cpu"}
            except Exception as e:
                return {"success": False, "error": str(e), "device": "cpu"}
        else:
            self._init_onnx_engine()
            self.device = "cpu"
            self._warmup()
            return {"success": True, "device": "cpu", "device_name": f"ONNX Runtime CPU ({self.num_threads} threads)"}

    def get_device_status(self) -> Dict[str, Any]:
        """Return current hardware and engine status."""
        return {
            "engine": f"PP-OCRv5 ({self.engine_type})",
            "model_file": str(OCR_ONNX_MODEL.name if self.engine_type == "ONNX" else OCR_INFERENCE_DIR.name),
            "device": self.device,
            "is_gpu": self.device == "gpu",
            "device_name": f"ONNX Runtime CPU ({self.num_threads} threads)" if self.engine_type == "ONNX" else f"Paddle CPU ({self.num_threads} threads)",
            "cpu_threads": self.num_threads
        }