"""
=========================================================
Geometry Utilities
=========================================================

Author : Senitha Kahatapitiya

Reusable geometry functions for the Sri Lankan
ANPR System.

This module contains ONLY mathematical operations.

No OCR.
No YOLO.
No Image Processing.
"""

import cv2
import numpy as np


class GeometryUtils:

    # ---------------------------------------------------------
    # Order Rectangle Points
    # ---------------------------------------------------------

    @staticmethod
    def order_points(points):
        """
        Order rectangle points as:

        Top Left
        Top Right
        Bottom Right
        Bottom Left
        """

        points = np.array(points, dtype=np.float32)

        rect = np.zeros((4, 2), dtype=np.float32)

        s = points.sum(axis=1)

        rect[0] = points[np.argmin(s)]
        rect[2] = points[np.argmax(s)]

        diff = np.diff(points, axis=1)

        rect[1] = points[np.argmin(diff)]
        rect[3] = points[np.argmax(diff)]

        return rect

    # ---------------------------------------------------------
    # Distance
    # ---------------------------------------------------------

    @staticmethod
    def distance(p1, p2):

        return np.linalg.norm(
            np.array(p1) - np.array(p2)
        )

    # ---------------------------------------------------------
    # Rectangle Size
    # ---------------------------------------------------------

    @staticmethod
    def rectangle_size(rect):

        widthA = GeometryUtils.distance(
            rect[2],
            rect[3]
        )

        widthB = GeometryUtils.distance(
            rect[1],
            rect[0]
        )

        heightA = GeometryUtils.distance(
            rect[1],
            rect[2]
        )

        heightB = GeometryUtils.distance(
            rect[0],
            rect[3]
        )

        width = int(max(widthA, widthB))
        height = int(max(heightA, heightB))

        return width, height

    # ---------------------------------------------------------
    # Expand Rectangle
    # ---------------------------------------------------------

    @staticmethod
    def expand_rectangle(rect, scale=1.05):
        """
        Expand rectangle from its center.

        scale=1.05
        means increase size by 5%.
        """

        center = np.mean(rect, axis=0)

        expanded = center + (rect - center) * scale

        return expanded.astype(np.float32)

    # ---------------------------------------------------------
    # Keep Rectangle Inside Image
    # ---------------------------------------------------------

    @staticmethod
    def clip_points(rect, width, height):
        """
        Prevent rectangle corners from going
        outside the image.
        """

        rect[:, 0] = np.clip(
            rect[:, 0],
            0,
            width - 1
        )

        rect[:, 1] = np.clip(
            rect[:, 1],
            0,
            height - 1
        )

        return rect

    # ---------------------------------------------------------
    # Convex Hull
    # ---------------------------------------------------------

    @staticmethod
    def convex_hull(polygon):

        polygon = np.array(
            polygon,
            dtype=np.float32
        )

        hull = cv2.convexHull(
            polygon
        )

        return hull.reshape(-1, 2)

    # ---------------------------------------------------------
    # Minimum Area Rectangle
    # ---------------------------------------------------------

    @staticmethod
    def minimum_rectangle(polygon):

        rect = cv2.minAreaRect(
            np.array(
                polygon,
                dtype=np.float32
            )
        )

        box = cv2.boxPoints(rect)

        return box.astype(np.float32)

    # ---------------------------------------------------------
    # Polygon Area
    # ---------------------------------------------------------

    @staticmethod
    def polygon_area(polygon):

        polygon = np.array(
            polygon,
            dtype=np.float32
        )

        return cv2.contourArea(
            polygon
        )

    # ---------------------------------------------------------
    # Polygon Perimeter
    # ---------------------------------------------------------

    @staticmethod
    def polygon_perimeter(polygon):

        polygon = np.array(
            polygon,
            dtype=np.float32
        )

        return cv2.arcLength(
            polygon,
            True
        )