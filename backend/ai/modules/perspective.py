"""
=========================================================
Perspective Transformer
=========================================================

Author : Senitha Kahatapitiya

Uses the YOLO segmentation polygon to generate a
rectified number plate for OCR.

Pipeline

YOLO Polygon
      ↓
Convex Hull
      ↓
Minimum Area Rectangle
      ↓
Expand Rectangle
      ↓
Clip to Image
      ↓
Order Points
      ↓
Perspective Warp
      ↓
Rectified Plate
"""

from pathlib import Path
import cv2
import numpy as np
try:
    from ai.modules.geometry import GeometryUtils
except ImportError:
    from modules.geometry import GeometryUtils


class PerspectiveTransformer:

    def __init__(self, debug=True):

        self.debug = debug

        self.debug_folder = Path("outputs/debug")

        self.debug_folder.mkdir(
            parents=True,
            exist_ok=True
        )

    # ---------------------------------------------------------
    # Perspective Warp
    # ---------------------------------------------------------

    def warp(self, image, rect):

        width, height = GeometryUtils.rectangle_size(rect)

        # Minimum OCR size
        width = max(width, 180)
        height = max(height, 50)

        destination = np.array([
            [0, 0],
            [width - 1, 0],
            [width - 1, height - 1],
            [0, height - 1]
        ], dtype=np.float32)

        matrix = cv2.getPerspectiveTransform(
            rect,
            destination
        )

        warped = cv2.warpPerspective(
            image,
            matrix,
            (width, height),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )

        return warped

    # ---------------------------------------------------------
    # Save Debug Images
    # ---------------------------------------------------------

    def save_debug(
        self,
        original,
        polygon,
        rectangle,
        warped
    ):

        if not self.debug:
            return

        overlay = original.copy()

        # Draw segmentation polygon

        if polygon is not None:

            pts = np.array(
                polygon,
                dtype=np.int32
            )

            cv2.polylines(
                overlay,
                [pts],
                True,
                (0, 255, 0),
                2
            )

        # Draw minimum rectangle

        if rectangle is not None:

            box = rectangle.astype(np.int32)

            cv2.polylines(
                overlay,
                [box],
                True,
                (0, 0, 255),
                2
            )

        cv2.imwrite(
            str(self.debug_folder / "01_original.jpg"),
            original
        )

        cv2.imwrite(
            str(self.debug_folder / "02_overlay.jpg"),
            overlay
        )

        cv2.imwrite(
            str(self.debug_folder / "03_warped.jpg"),
            warped
        )

    # ---------------------------------------------------------
    # Main Perspective Function
    # ---------------------------------------------------------

    def rectify(
        self,
        image,
        polygon=None,
        bbox=None
    ):
        if polygon is None or len(polygon) < 4:
            if bbox is not None:
                x1, y1, x2, y2 = bbox
                rect = np.array([
                    [x1, y1],
                    [x2, y1],
                    [x2, y2],
                    [x1, y2]
                ], dtype=np.float32)
                return self.warp(image, rect)
            elif polygon is None:
                raise ValueError("Both polygon and bbox are missing.")

        polygon = np.array(
            polygon,
            dtype=np.float32
        )

        if len(polygon) < 4:
            if bbox is not None:
                x1, y1, x2, y2 = bbox
                rect = np.array([
                    [x1, y1],
                    [x2, y1],
                    [x2, y2],
                    [x1, y2]
                ], dtype=np.float32)
                return self.warp(image, rect)
            raise ValueError(
                "Polygon must contain at least 4 points."
            )

        # ---------------------------------------------
        # Convex Hull
        # ---------------------------------------------

        hull = GeometryUtils.convex_hull(
            polygon
        )

        # ---------------------------------------------
        # Minimum Rectangle
        # ---------------------------------------------

        rect = GeometryUtils.minimum_rectangle(
            hull
        )

        # ---------------------------------------------
        # Expand Rectangle (Only expand single-line plates; keep square plates tight)
        # ---------------------------------------------
        rw, rh = GeometryUtils.rectangle_size(rect)
        aspect = rw / max(1, rh)
        exp_scale = 1.05 if aspect >= 2.0 else 1.00

        rect = GeometryUtils.expand_rectangle(
            rect,
            scale=exp_scale
        )

        # ---------------------------------------------
        # Keep Rectangle Inside Image
        # ---------------------------------------------

        image_height, image_width = image.shape[:2]

        rect = GeometryUtils.clip_points(
            rect,
            image_width,
            image_height
        )

        # ---------------------------------------------
        # Order Rectangle Points
        # ---------------------------------------------

        rect = GeometryUtils.order_points(
            rect
        )

        # ---------------------------------------------
        # Perspective Warp
        # ---------------------------------------------

        warped = self.warp(
            image,
            rect
        )

        # ---------------------------------------------
        # Save Debug Images
        # ---------------------------------------------

        self.save_debug(
            original=image,
            polygon=polygon,
            rectangle=rect,
            warped=warped
        )

        return warped