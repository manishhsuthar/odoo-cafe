from django.urls import path
from .views import (
    ReportsSummaryView,
    SalesTrendView,
    TopOrdersView,
    TopProductsView,
    TopCategoriesView
)

urlpatterns = [
    path("summary/", ReportsSummaryView.as_view(), name="reports_summary"),
    path("sales-trend/", SalesTrendView.as_view(), name="sales_trend"),
    path("top-orders/", TopOrdersView.as_view(), name="top_orders"),
    path("top-products/", TopProductsView.as_view(), name="top_products"),
    path("top-categories/", TopCategoriesView.as_view(), name="top_categories"),
]