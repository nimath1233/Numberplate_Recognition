"""
=========================================================
Sri Lankan ANPR - High Performance OCR Reader
=========================================================

Author : Senitha Kahatapitiya / Updated for ANPR v4

Engine:
    PP-OCRv5 Custom Recognition Model
    Intel oneDNN (MKLDNN) / AVX2 CPU Acceleration
    Optimized for Intel Xeon 24-thread CPU & Linux/Ubuntu

Input:
    BGR plate image crop

Output:
    {
        "text": str,
        "confidence": float,
        "time_ms": float
    }
"""

import time
import os
from pathlib import Path
import cv2
import numpy as np
import paddle.inference as paddle_infer

try:
    from ai.config import (
        OCR_INFERENCE_DIR,
        OCR_DICT_PATH,
        OCR_WIDTH,
        OCR_HEIGHT,
        OCR_NUM_THREADS,
    )
except ImportError:
    from config import (
        OCR_INFERENCE_DIR,
        OCR_DICT_PATH,
        OCR_WIDTH,
        OCR_HEIGHT,
        OCR_NUM_THREADS,
    )


class OCRReader:

    def __init__(self):
        print("=" * 60)
        print("Loading OCR PP-OCRv5 Model (Intel oneDNN CPU Engine)...")
        print("=" * 60)

        json_path = OCR_INFERENCE_DIR / "inference.json"
        pdiparams_path = OCR_INFERENCE_DIR / "inference.pdiparams"

        print(f"Model Topology: {json_path}")
        print(f"Model Weights : {pdiparams_path}")
        print(f"Dictionary    : {OCR_DICT_PATH}")
        print(f"CPU Threads   : {OCR_NUM_THREADS}")

        if not json_path.exists() or not pdiparams_path.exists():
            raise FileNotFoundError(
                f"\nOCR model files not found in:\n{OCR_INFERENCE_DIR}"
            )

        if not OCR_DICT_PATH.exists():
            # Auto-generate if missing
            self._ensure_dict_exists()

        # -------------------------------------------------
        # Load dictionary
        # -------------------------------------------------
        with open(OCR_DICT_PATH, "r", encoding="utf-8") as f:
            self.dictionary = [line.rstrip("\r\n") for line in f]

        print(f"Dictionary characters: {len(self.dictionary)}")

        # Class 0 = CTC blank, Class 1..N = dictionary, Class N+1 = space
        self.characters = [""] + self.dictionary + [" "]
        print(f"Total CTC classes: {len(self.characters)}")

        # -------------------------------------------------
        # Configure Paddle Inference with Intel oneDNN
        # -------------------------------------------------
        config = paddle_infer.Config(str(json_path), str(pdiparams_path))
        config.disable_gpu()
        config.enable_mkldnn()
        config.set_cpu_math_library_num_threads(OCR_NUM_THREADS)
        config.set_mkldnn_cache_capacity(10)

        self.predictor = paddle_infer.create_predictor(config)
        self.input_name = self.predictor.get_input_names()[0]
        self.output_name = self.predictor.get_output_names()[0]
        self.input_tensor = self.predictor.get_input_handle(self.input_name)
        self.output_tensor = self.predictor.get_output_handle(self.output_name)

        print("OCR Reader initialized successfully with Intel oneDNN / AVX2 acceleration!")

        # Warm-up
        self._warmup()

    def _ensure_dict_exists(self):
        """Extract character dictionary from inference.yml if plate_dict_v1.txt is missing."""
        import yaml
        yml_path = OCR_INFERENCE_DIR / "inference.yml"
        if yml_path.exists():
            with open(yml_path, "r", encoding="utf-8") as f:
                yml_data = yaml.safe_load(f)
            char_dict = yml_data.get("PostProcess", {}).get("character_dict", [])
            OCR_DICT_PATH.parent.mkdir(parents=True, exist_ok=True)
            with open(OCR_DICT_PATH, "w", encoding="utf-8") as f:
                for c in char_dict:
                    f.write(f"{c}\n")

    def _warmup(self):
        print("\nOCR CPU warm-up...")
        dummy = np.zeros((1, 3, OCR_HEIGHT, OCR_WIDTH), dtype=np.float32)
        self.input_tensor.reshape([1, 3, OCR_HEIGHT, OCR_WIDTH])
        self.input_tensor.copy_from_cpu(dummy)
        for _ in range(3):
            self.predictor.run()
        print("OCR warm-up complete.")

    def _preprocess(self, image):
        """
        Prepare plate image crop for PP-OCRv5 model.
        Resizes with aspect ratio preservation and black padding to 320x48.
        """
        if image is None or image.size == 0:
            raise ValueError("OCR received an empty image or crop.")

        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)

        h, w = image.shape[:2]

        # Fit inside 320 x 48 preserving aspect ratio
        scale = min(OCR_WIDTH / w, OCR_HEIGHT / h)
        new_w = max(1, int(round(w * scale)))
        new_h = max(1, int(round(h * scale)))

        resized = cv2.resize(
            image,
            (new_w, new_h),
            interpolation=cv2.INTER_CUBIC
        )

        canvas = np.zeros((OCR_HEIGHT, OCR_WIDTH, 3), dtype=np.uint8)
        y_offset = (OCR_HEIGHT - new_h) // 2
        x_offset = 0
        canvas[y_offset : y_offset + new_h, x_offset : x_offset + new_w] = resized

        # BGR -> RGB
        canvas = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB)

        # Normalize [-1, 1]
        canvas = (canvas.astype(np.float32) / 255.0 - 0.5) / 0.5

        # HWC -> CHW -> NCHW
        canvas = canvas.transpose(2, 0, 1)
        canvas = np.expand_dims(canvas, axis=0)

        return np.ascontiguousarray(canvas, dtype=np.float32)

    def _decode(self, prediction):
        """
        CTC greedy decoding for character sequence and average confidence.
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

        for index, probability in zip(indices, probabilities):
            idx = int(index)
            if idx == 0 or idx == previous_index:
                previous_index = idx
                continue

            if idx < len(self.characters):
                char = self.characters[idx]
                if char != "":
                    text.append(char)
                    char_confidences.append(float(probability))

            previous_index = idx

        result_text = "".join(text).strip().upper()
        confidence = float(np.mean(char_confidences)) if char_confidences else 0.0

        return result_text, confidence

    def _read_single_strip(self, image):
        """Perform raw single-line OCR on an image crop."""
        input_tensor_data = self._preprocess(image)
        self.input_tensor.reshape([1, 3, OCR_HEIGHT, OCR_WIDTH])
        self.input_tensor.copy_from_cpu(input_tensor_data)
        self.predictor.run()
        prediction = self.output_tensor.copy_to_cpu()
        return self._decode(prediction)

    def read(self, image):
        """
        Recognize text from plate image.
        Supports both single-line plates and two-line (square/double-decker) plates.
        Returns:
            {
                "text": str,
                "confidence": float,
                "time_ms": float
            }
        """
        if image is None or image.size == 0:
            return {"text": "", "confidence": 0.0, "time_ms": 0.0}

        start = time.perf_counter()
        try:
            h, w = image.shape[:2]
            aspect = w / max(1, h)

            # Check if this is a square/two-line plate (aspect ratio < 2.3 and height >= 24px)
            if aspect < 2.3 and h >= 24:
                # 1. Read top half and bottom half with overlap
                top_crop = image[:int(h * 0.58), :]
                bot_crop = image[int(h * 0.42):, :]

                top_text, top_conf = self._read_single_strip(top_crop)
                bot_text, bot_conf = self._read_single_strip(bot_crop)

                # 2. Also try full single-strip read
                full_text, full_conf = self._read_single_strip(image)

                # Combine split lines
                split_combined = f"{top_text} {bot_text}".strip()
                split_conf = (top_conf + bot_conf) / 2.0 if (top_conf and bot_conf) else max(top_conf, bot_conf)

                # Choose best result: prefer two-line split if both halves read text or if combined has more detail
                if top_text and bot_text and len(split_combined) >= 4:
                    text, confidence = split_combined, split_conf
                elif full_conf >= 0.75 and len(full_text) >= 4:
                    text, confidence = full_text, full_conf
                else:
                    text = split_combined if len(split_combined) >= len(full_text) else full_text
                    confidence = max(split_conf, full_conf)
            else:
                # Standard single-line plate
                text, confidence = self._read_single_strip(image)

            elapsed = (time.perf_counter() - start) * 1000
            return {
                "text": text,
                "confidence": confidence,
                "time_ms": elapsed
            }
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            print(f"OCR Error: {e}")
            return {
                "text": "",
                "confidence": 0.0,
                "time_ms": elapsed
            }