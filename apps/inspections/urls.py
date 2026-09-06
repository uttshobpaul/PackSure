from django.urls import path
from . import views


urlpatterns = [

    # ==========================================
    # SCAN PRODUCT
    # ==========================================

    path(
        "",
        views.scan_product,
        name="scan_product"
    ),


    # ==========================================
    # INSPECTION HISTORY
    # ==========================================

    path(
        "history/",
        views.inspection_history,
        name="inspection_history"
    ),


    # ==========================================
    # INSPECTION RESULT
    # ==========================================

    path(
        "result/<int:inspection_id>/",
        views.inspection_result,
        name="inspection_result"
    ),


    # ==========================================
    # PDF REPORT
    # ==========================================

    path(
        "report/<int:inspection_id>/",
        views.generate_report,
        name="generate_report"
    ),


    # ==========================================
    # INSPECTIONS
    # ==========================================

    path(
        "inspections/",
        views.inspections,
        name="inspections"
    ),


    # ==========================================
    # PRODUCTS
    # ==========================================

    path(
        "products/",
        views.products,
        name="products"
    ),


    # ==========================================
    # VIOLATIONS
    # ==========================================

    path(
        "violations/",
        views.violations,
        name="violations"
    ),


    # ==========================================
    # REPORTS
    # ==========================================

    path(
        "reports/",
        views.reports,
        name="reports"
    ),

]