from django.urls import path
from .views import (
    KDSOrderListView, KDSOrderDetailView,
    KDSUpdateItemView, KDSDashboardView
)

urlpatterns = [
    path("dashboard/", KDSDashboardView.as_view(), name="kds_dashboard"),
    path("orders/", KDSOrderListView.as_view(), name="kds_orders"),
    path("orders/<int:pk>/", KDSOrderDetailView.as_view(), name="kds_order_detail"),
    path("items/<int:item_pk>/update/", KDSUpdateItemView.as_view(), name="kds_update_item"),
]