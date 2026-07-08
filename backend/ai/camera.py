import cv2
import numpy as np
import base64
import os
import uuid
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

class CameraHelper:
    @staticmethod
    def base64_to_cv2(base64_string):
        """
        Converts a base64 encoded image string (e.g. data:image/jpeg;base64,...)
        into an OpenCV image (numpy array).
        """
        try:
            # Strip metadata prefix if present
            if "," in base64_string:
                base64_string = base64_string.split(",")[1]
            
            # Decode base64 bytes
            img_data = base64.b64decode(base64_string)
            
            # Convert bytes to numpy array
            nparr = np.frombuffer(img_data, np.uint8)
            
            # Decode to OpenCV BGR format
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            logger.error(f"Error decoding base64 image: {str(e)}")
            return None

    @staticmethod
    def save_image(image_np, directory, filename_prefix="snap"):
        """
        Saves an OpenCV image (numpy array) to the specified directory.
        Generates a unique filename and returns the relative path.
        """
        try:
            # Ensure the directory exists
            os.makedirs(directory, exist_ok=True)
            
            # Generate unique filename
            filename = f"{filename_prefix}_{uuid.uuid4().hex[:8]}.jpg"
            file_path = os.path.join(directory, filename)
            
            # Save the image
            cv2.imwrite(file_path, image_np)
            logger.info(f"Image saved to: {file_path}")
            
            # Return relative path for web and DB references
            # We standardize on forward slashes for URL references
            relative_dir = os.path.basename(os.path.normpath(directory))
            parent_dir = os.path.basename(os.path.dirname(os.path.normpath(directory)))
            
            # We want something like 'uploads/vehicles/filename.jpg'
            if parent_dir == "uploads":
                return f"uploads/{relative_dir}/{filename}"
            else:
                return f"uploads/{filename}"
                
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            return ""
