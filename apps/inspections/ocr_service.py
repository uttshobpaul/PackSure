import re
import cv2
import pytesseract
import gc


# Maximum image dimension used for OCR.
# This prevents very large phone images from consuming too much RAM.
MAX_IMAGE_DIMENSION = 1800


def extract_text(image_path):
    """
    Extract raw text from a product-label image using
    memory-efficient OpenCV preprocessing and Tesseract OCR.
    """

    image = cv2.imread(image_path)

    if image is None:
        return ""

    processed = None

    try:
        # -------------------------------------------------
        # LIMIT IMAGE SIZE TO PREVENT OUT-OF-MEMORY ERRORS
        # -------------------------------------------------

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

        # -------------------------------------------------
        # CONVERT TO GRAYSCALE
        # -------------------------------------------------

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        # Release original color image
        del image

        # -------------------------------------------------
        # IMPROVE CONTRAST
        # -------------------------------------------------

        processed = cv2.threshold(
            gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )[1]

        # Release grayscale image
        del gray

        # -------------------------------------------------
        # TESSERACT OCR
        # -------------------------------------------------

        text = pytesseract.image_to_string(
            processed,
            config="--psm 6"
        )

        return text

    finally:

        # Release processed image from memory
        if processed is not None:
            del processed

        # Ask Python garbage collector to release memory
        gc.collect()


# =========================================================
# STRUCTURED FIELD EXTRACTION
# =========================================================

def extract_fields(text):
    """
    Convert imperfect OCR text into structured
    product-label fields.
    """

    text_lower = text.lower()

    fields = {
        "mrp": None,
        "net_quantity": None,
        "manufacturer": None,
        "consumer_care": None,
        "licence_numbers": [],
        "manufacturing_date": None,
        "nutrition_information": False,
    }

    # -------------------------------------------------
    # MRP
    # -------------------------------------------------

    mrp_patterns = [

        r"(?:mrp|m\.r\.p)[^\d]{0,30}"
        r"(?:₹|rs\.?|inr)?\s*"
        r"(\d+(?:\.\d{1,2})?)",

        r"(?:maximum\s+retail\s+price)[^\d]{0,30}"
        r"(?:₹|rs\.?|inr)?\s*"
        r"(\d+(?:\.\d{1,2})?)",
    ]

    for pattern in mrp_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            fields["mrp"] = match.group(1)
            break

    # -------------------------------------------------
    # NET QUANTITY
    # Handles OCR mistakes such as "WET QTY"
    # -------------------------------------------------

    quantity_match = re.search(

        r"(?:net|wet|ne[t7])\s*"
        r"(?:qty|quantity|qly)"
        r"[^\d]{0,20}"
        r"(\d+(?:\.\d+)?)\s*"
        r"(kg|g|ml|l|mg)",

        text,
        re.IGNORECASE
    )

    if quantity_match:

        fields["net_quantity"] = (
            quantity_match.group(1)
            + " "
            + quantity_match.group(2)
        )

    # -------------------------------------------------
    # LICENCE NUMBERS
    # -------------------------------------------------

    licence_matches = re.findall(

        r"(?:lic(?:ence|ense)|"
        r"lc\.?\s*no\.?|"
        r"lic\.?\s*no\.?)"
        r"[^\d]{0,20}"
        r"(\d{8,14})",

        text,
        re.IGNORECASE
    )

    fields["licence_numbers"] = licence_matches

    # -------------------------------------------------
    # NUTRITION INFORMATION
    # -------------------------------------------------

    nutrition_keywords = [

        "nutritional information",
        "nutritional inform",
        "nutf.tional information",
        "nutrition information",
        "nutrition facts",
    ]

    for keyword in nutrition_keywords:

        if keyword in text_lower:

            fields["nutrition_information"] = True
            break

    # -------------------------------------------------
    # MANUFACTURING / USE BY / BEST BEFORE
    # -------------------------------------------------

    date_match = re.search(

        r"(?:mfd|mfg|manufactured|"
        r"use\s*by|best\s*before)"
        r"[^\n]{0,50}",

        text,
        re.IGNORECASE
    )

    if date_match:

        fields["manufacturing_date"] = (
            date_match.group(0).strip()
        )

    # -------------------------------------------------
    # MANUFACTURER
    # -------------------------------------------------

    manufacturer_match = re.search(

        r"(?:manufactured|manufacture|mfd|mfg)"
        r"\s*(?:by)?"
        r"\s*[:\-]?\s*"
        r"([^\n]+)",

        text,
        re.IGNORECASE
    )

    if manufacturer_match:

        value = manufacturer_match.group(1).strip()

        if len(value) > 2:
            fields["manufacturer"] = value

    # -------------------------------------------------
    # CONSUMER CARE
    # -------------------------------------------------

    consumer_match = re.search(

        r"(?:consumer\s*care|"
        r"customer\s*care)"
        r"[^\n]{0,100}",

        text,
        re.IGNORECASE
    )

    if consumer_match:

        fields["consumer_care"] = (
            consumer_match.group(0).strip()
        )

    return fields


# =========================================================
# PRODUCT LABEL VALIDATION
# =========================================================

def validate_product_label(text):
    """
    Detect whether OCR text contains evidence of a
    packaged food/product label.

    This does NOT determine legal compliance.
    """

    text_lower = text.lower()

    # -------------------------------------------------
    # LABEL INDICATORS
    # -------------------------------------------------

    label_indicators = [

        # Indian packaging indicators
        "mrp",
        "m.r.p",
        "maximum retail price",
        "net qty",
        "net quantity",
        "net wt",
        "net weight",
        "manufactured",
        "manufactured by",
        "packed by",
        "packer",
        "mfd",
        "mfg",
        "lic no",
        "lic. no",
        "fssai",
        "consumer care",
        "customer care",
        "customer support",
        "best before",
        "use by",
        "expiry",
        "batch no",
        "batch number",

        # General food/product label indicators
        "ingredients",
        "ingredient",
        "nutrition facts",
        "nutritional information",
        "nutrition information",
        "serving size",
        "servings per container",
        "calories",
        "total fat",
        "saturated fat",
        "protein",
        "carbohydrate",
        "dietary fiber",
        "sodium",
        "vitamin",
        "calcium",
        "iron",
        "potassium",
    ]

    # -------------------------------------------------
    # FIND DETECTED KEYWORDS
    # -------------------------------------------------

    detected_keywords = []

    for keyword in label_indicators:

        if keyword in text_lower:

            detected_keywords.append(keyword)

    # -------------------------------------------------
    # CALCULATE LABEL SCORE
    # -------------------------------------------------

    score = min(
        len(detected_keywords) * 10,
        100
    )

    # At least one recognizable label indicator
    # is required.
    is_valid = len(detected_keywords) >= 1

    # -------------------------------------------------
    # INDIAN COMPLIANCE INDICATORS
    # -------------------------------------------------

    indian_indicators = [

        "mrp",
        "m.r.p",
        "maximum retail price",
        "net qty",
        "net quantity",
        "net wt",
        "net weight",
        "manufactured",
        "mfd",
        "mfg",
        "fssai",
        "lic no",
        "lic. no",
        "consumer care",
        "customer care",
        "best before",
        "use by",
        "batch no",
        "batch number",
    ]

    indian_compliance_evidence = [

        keyword

        for keyword in indian_indicators

        if keyword in text_lower
    ]

    # -------------------------------------------------
    # RETURN VALIDATION RESULT
    # -------------------------------------------------

    return {

        "is_valid": is_valid,

        "score": score,

        "detected_keywords": detected_keywords,

        "indian_compliance_evidence":
            indian_compliance_evidence,
    }
