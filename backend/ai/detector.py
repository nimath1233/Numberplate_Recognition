import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

class PlateDetector:
    @staticmethod
    def preprocess_and_crop(image_np):
        """
        Attempts to locate and crop the license plate using contour detection.
        Returns:
            cropped_image: The cropped license plate region, or the original image if detection fails.
            is_cropped: Boolean indicating if a plate region was successfully localized.
        """
        try:
            # Check if image is valid
            if image_np is None or image_np.size == 0:
                return None, False

            height, width = image_np.shape[:2]
            
            # 1. Convert to Grayscale
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
            
            # 2. Filter noise while keeping edges sharp
            gray_filtered = cv2.bilateralFilter(gray, 11, 17, 17)
            
            # 3. Find edges
            edged = cv2.Canny(gray_filtered, 30, 200)
            
            # 4. Find contours
            contours, _ = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            
            # Sort contours by area, descending, and take top 15
            contours = sorted(contours, key=cv2.contourArea, reverse=True)[:15]
            
            plate_contour = None
            
            for c in contours:
                # Approximate the contour
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.018 * peri, True)
                
                # If the contour has 4 vertices, it's likely a rectangle
                if len(approx) == 4:
                    # Get bounding box coordinates
                    x, y, w, h = cv2.boundingRect(approx)
                    aspect_ratio = float(w) / h
                    
                    # License plates typically have an aspect ratio between 2.0 and 5.5
                    # Also enforce a minimum size (e.g. 50px wide) to avoid noise
                    if 2.0 <= aspect_ratio <= 5.5 and w > 40 and h > 10:
                        plate_contour = approx
                        break
            
            if plate_contour is not None:
                # Get bounding box of the plate contour
                x, y, w, h = cv2.boundingRect(plate_contour)
                
                # Add a small padding (5-10%) around the crop to assist OCR
                padding_x = int(w * 0.05)
                padding_y = int(h * 0.05)
                
                x_start = max(0, x - padding_x)
                y_start = max(0, y - padding_y)
                x_end = min(width, x + w + padding_x)
                y_end = min(height, y + h + padding_y)
                
                cropped = image_np[y_start:y_end, x_start:x_end]
                logger.info(f"License plate candidate cropped successfully: rect=({x_start},{y_start},{x_end},{y_end})")
                return cropped, True
            
            # If no rectangular contour is found, return the original image
            # EasyOCR will use its built-in text detection (CRAFT) on the full image
            logger.info("No rectangular plate contour detected. Falling back to full image OCR.")
            return image_np, False
            
        except Exception as e:
            logger.error(f"Error in plate detection: {str(e)}")
            return image_np, False
