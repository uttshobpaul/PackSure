from django.shortcuts import render
from .models import Inspection
from .rules import check_compliance
from .ocr_service import extract_text, extract_fields, validate_product_label
from django.http import HttpResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def scan_product(request):

    if request.method == "POST":

        product_name = request.POST.get("product_name", "")
        image = request.FILES.get("image")

        if image:

            # Save uploaded image temporarily
            inspection = Inspection.objects.create(
                product_name=product_name,
                image=image,
                status="pending",
                compliance_score=0
            )

            # Step 1: OCR
            image_path = inspection.image.path
            text = extract_text(image_path)

            # Step 2: Validate whether image is a product label
            validation = validate_product_label(text)

            # Reject invalid/random images
            if not validation["is_valid"]:
            
                # inspection.delete()

                return render(
                    request,
                    "scan_product.html",
                    {
                        "error": "Label validation failed. "
                        f"OCR detected: {validation['detected_keywords']} "
                        f"| Score: {validation['score']}%"
                        
                    }
                )

            # Step 3: Extract structured fields
            fields = extract_fields(text)

            # Step 4: Run compliance engine
            analysis = check_compliance(product_name)

            # Update inspection result
            inspection.status = analysis["status"]
            inspection.compliance_score = analysis["score"]
            inspection.save()

            return render(
                request,
                "inspection_result.html",
                {
                    "inspection": inspection,
                    "analysis": analysis,
                    "fields": fields,
                    "validation": validation,
                    "ocr_text": text,
                }
            )

    return render(request, "scan_product.html")

def inspection_history(request):

    inspections = Inspection.objects.all().order_by("-created_at")

    return render(
        request,
        "inspection_history.html",
        {
            "inspections": inspections
        }
    )

def generate_report(request, inspection_id):

    inspection = Inspection.objects.get(id=inspection_id)

    analysis = check_compliance(inspection.product_name)

    response = HttpResponse(content_type="application/pdf")

    response["Content-Disposition"] = (
        f'attachment; filename="PackSure_Report_{inspection.id}.pdf"'
    )

    pdf = canvas.Canvas(response, pagesize=A4)

    width, height = A4

    # Title
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(50, height - 60, "PackSure")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 82, "AI-Powered Packaged Commodity Compliance Report")

    # Inspection details
    y = height - 130

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Inspection Details")

    y -= 30

    pdf.setFont("Helvetica", 11)

    pdf.drawString(50, y, f"Inspection ID: {inspection.id}")
    y -= 20

    pdf.drawString(50, y, f"Product Name: {inspection.product_name}")
    y -= 20

    pdf.drawString(
        50,
        y,
        f"Inspection Date: {inspection.created_at.strftime('%d %b %Y, %I:%M %p')}"
    )

    # Result
    y -= 45

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Compliance Result")

    y -= 30

    pdf.setFont("Helvetica", 11)

    status = analysis["status"].replace("_", " ").upper()

    pdf.drawString(50, y, f"Status: {status}")
    y -= 20

    pdf.drawString(
        50,
        y,
        f"Compliance Score: {analysis['score']}%"
    )

    # Detected declarations
    y -= 45

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Detected Declarations")

    y -= 25

    pdf.setFont("Helvetica", 11)

    for declaration in analysis["detected"]:

        pdf.drawString(65, y, f"✓ {declaration}")

        y -= 20

    # Violations
    y -= 20

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(50, y, "Violations")

    y -= 25

    pdf.setFont("Helvetica", 11)

    if analysis["violations"]:

        for violation in analysis["violations"]:

            pdf.drawString(
                65,
                y,
                f"✗ {violation['field']}"
            )

            y -= 18

            pdf.drawString(
                80,
                y,
                violation["message"]
            )

            y -= 25

    else:

        pdf.drawString(
            65,
            y,
            "No violations detected."
        )

    # Footer
    pdf.setFont("Helvetica-Oblique", 9)

    pdf.drawString(
        50,
        35,
        "Generated by PackSure — Prototype Compliance Inspection System"
    )

    pdf.save()

    return response