from django.db import models


class Inspection(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("compliant", "Compliant"),
        ("violation", "Violation"),
        ("high_risk", "High Risk"),
    ]

    product_name = models.CharField(
        max_length=200,
        blank=True
    )

    image = models.ImageField(
        upload_to="inspections/"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    compliance_score = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.product_name or f"Inspection #{self.id}"