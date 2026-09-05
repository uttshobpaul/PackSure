
import os
import re
import cv2
import pytesseract

if os.name != "nt":
    pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

def extract_text(image_path):
    """
    Extract text from a product-label image using Tesseract OCR.
    Images are resized safely to reduce memory usage.
    """

    image = cv2.imread(image_path)

    if image is None:
        return ""

    # Limit maximum image dimension to reduce RAM usage
    max_dimension = 1600

    height, width = image.shape[:2]

    if max(height, width) > max_dimension:
        scale = max_dimension / max(height, width)

        image = cv2.resize(
            image,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_AREA
        )

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Improve contrast
    processed = cv2.threshold(
        gray,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    text = pytesseract.image_to_string(
        processed,
        config="--psm 6"
    )

    return text

def extract_fields(text):
    """
    Convert imperfect OCR text into structured product-label fields.
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
        r"(?:mrp|m\.r\.p)[^\d]{0,30}(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)",
        r"(?:maximum\s+retail\s+price)[^\d]{0,30}(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)",
    ]

    for pattern in mrp_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            fields["mrp"] = match.group(1)
            break

    # -------------------------------------------------
    # NET QUANTITY
    # Handles OCR mistakes such as "WET QTY"
    # -------------------------------------------------

    quantity_match = re.search(
        r"(?:net|wet|ne[t7])\s*(?:qty|quantity|qly)"
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
        r"(?:lic(?:ence|ense)|lc\.?\s*no\.?|lic\.?\s*no\.?)"
        r"[^\d]{0,20}"
        r"(\d{8,14})",
        text,
        re.IGNORECASE
    )

    fields["licence_numbers"] = licence_matches

    # -------------------------------------------------
    # NUTRITION INFORMATION
    # Handles OCR variations
    # -------------------------------------------------

    nutrition_keywords = [
        "nutritional information",
        "nutritional inform",
        "nutf.tional information",
        "nutrition information",
    ]

    for keyword in nutrition_keywords:
        if keyword in text_lower:
            fields["nutrition_information"] = True
            break

    # -------------------------------------------------
    # MANUFACTURING / USE BY
    # -------------------------------------------------

    date_match = re.search(
        r"(?:mfd|mfg|manufactured|use\s*by|best\s*before)"
        r"[^\n]{0,50}",
        text,
        re.IGNORECASE
    )

    if date_match:
        fields["manufacturing_date"] = date_match.group(0).strip()

    # -------------------------------------------------
    # MANUFACTURER
    # -------------------------------------------------

    manufacturer_match = re.search(
        r"(?:manufactured|manufacture|mfd|mfg)"
        r"\s*(?:by)?"
        r"\s*[:\-]?\s*([^\n]+)",
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
        r"(?:consumer\s*care|customer\s*care)"
        r"[^\n]{0,100}",
        text,
        re.IGNORECASE
    )

    if consumer_match:
        fields["consumer_care"] = consumer_match.group(0).strip()

    return fields
 
def validate_product_label(text):
    """
    Detect whether OCR text contains evidence of a packaged
    food/product label.

    This does NOT determine legal compliance.
    """

    text_lower = text.lower()

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

    detected_keywords = []

    for keyword in label_indicators:
        if keyword in text_lower:
            detected_keywords.append(keyword)

    # Score based on detected label evidence
    score = min(len(detected_keywords) * 10, 100)

    # A general product-label image needs at least one
    # recognizable label indicator.
    is_valid = len(detected_keywords) >= 1

    # Determine whether Indian compliance indicators
    # are present.
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

    return {
        "is_valid": is_valid,
        "score": score,
        "detected_keywords": detected_keywords,
        "indian_compliance_evidence": indian_compliance_evidence,
    }