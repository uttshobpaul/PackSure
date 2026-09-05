from django.urls import path
from . import views

urlpatterns = [

    path("", views.scan_product, name="scan_product"),

    path(
        "history/",
        views.inspection_history,
        name="inspection_history"
    ),

    path(
        "report/<int:inspection_id>/",
        views.generate_report,
        name="generate_report"
    ),

]