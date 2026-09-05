import re
import cv2
import pytesseract
import gc


MAX_IMAGE_DIMENSION = 1800


def extract_text(image_path):
    """
    Extract text from a product-label image using
    memory-efficient OpenCV preprocessing and Tesseract OCR.
    """

    image = cv2.imread(image_path)

    if image is None:
        return ""

    try:
        # -----------------------------------------
        # Limit image size to prevent OOM
        # -----------------------------------------
        height, width = image.shape[:2]

        largest_dimension = max(height, width)

        if largest_dimension > MAX_IMAGE_DIMENSION:
            scale = MAX_IMAGE_DIMENSION / largest_dimension

            new_width = int(width * scale)
            new_height = int(height * scale)

            image = cv2.resize(
                image,
                (new_width, new_height),
                interpolation=cv2.INTER_AREA
            )

        # -----------------------------------------
        # Grayscale
        # -----------------------------------------
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Release original image
        del image

        # -----------------------------------------
        # Improve contrast
        # -----------------------------------------
        processed = cv2.threshold(
            gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )[1]

        del gray

        # -----------------------------------------
        # OCR
        # -----------------------------------------
        text = pytesseract.image_to_string(
            processed,
            config="--psm 6"
        )

        return text

    finally:
        # Release OpenCV memory
        try:
            del processed
        except UnboundLocalError:
            pass

        gc.collect()