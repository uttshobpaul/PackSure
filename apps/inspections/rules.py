def check_compliance(product_name):
    """
    Prototype compliance rule engine.

    Later, the detected declarations will come from OCR/AI.
    """

    required_declarations = [
        "Manufacturer / Packer Details",
        "Net Quantity",
        "MRP",
        "Consumer Care Details",
    ]

    product = product_name.strip().lower()

    # Demo scenarios for today's prototype
    if "violation" in product:

        detected = [
            "Manufacturer / Packer Details",
            "Net Quantity",
        ]

    elif "risk" in product:

        detected = [
            "Manufacturer / Packer Details",
        ]

    else:

        detected = required_declarations.copy()

    violations = []

    for declaration in required_declarations:

        if declaration not in detected:

            violations.append({
                "field": declaration,
                "message": f"{declaration} declaration not detected."
            })

    total = len(required_declarations)
    passed = total - len(violations)

    score = int((passed / total) * 100)

    if score == 100:
        status = "compliant"

    elif score >= 50:
        status = "violation"

    else:
        status = "high_risk"

    return {
        "status": status,
        "score": score,
        "detected": detected,
        "violations": violations,
    }