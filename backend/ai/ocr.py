import easyocr
import re
import logging

logger = logging.getLogger(__name__)

class PlateOCR:
    def __init__(self):
        # Initialize the EasyOCR reader. 
        # We specify English ('en') and disable GPU to run on standard CPU.
        logger.info("Initializing EasyOCR Reader...")
        self.reader = easyocr.Reader(['en'], gpu=False)
        logger.info("EasyOCR Reader loaded successfully.")

    def extract_text(self, cropped_image_np):
        """
        Runs EasyOCR on a cropped license plate image.
        Returns the cleaned string of the detected license plate.
        """
        try:
            # reader.readtext returns list of tuples: (bbox, text, confidence)
            results = self.reader.readtext(cropped_image_np)
            if not results:
                return ""
            
            # Sort results by confidence and filter text
            # Often, plates are read in one block, but sometimes they are read in chunks.
            # We join them together.
            extracted_texts = []
            for bbox, text, confidence in results:
                if confidence > 0.20:  # Conf threshold
                    cleaned = self.clean_plate_text(text)
                    if cleaned:
                        extracted_texts.append(cleaned)
            
            final_text = "".join(extracted_texts)
            return final_text
            
        except Exception as e:
            logger.error(f"Error running OCR: {str(e)}")
            return ""

    def clean_plate_text(self, text):
        """
        Cleans the detected text to only keep alphanumeric characters, uppercase them.
        """
        if not text:
            return ""
        # Remove whitespace and non-alphanumeric characters, convert to uppercase
        cleaned = re.sub(r'[^a-zA-Z0-9]', '', text)
        return cleaned.upper()

# Singleton instance
ocr_engine = PlateOCR()
