from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView,
    OrderItemListCreateView, OrderItemDetailView,
    ApplyDiscountView
)

urlpatterns = [
    path("orders/", OrderListCreateView.as_view(), name="order_list"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order_detail"),
    path("orders/<int:pk>/apply-discount/", ApplyDiscountView.as_view(), name="apply_discount"),
    path("order-items/", OrderItemListCreateView.as_view(), name="orderitem_list"),
    path("order-items/<int:pk>/", OrderItemDetailView.as_view(), name="orderitem_detail"),
]