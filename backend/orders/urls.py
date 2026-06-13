from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView, OrderStatusUpdateView,
)

urlpatterns = [
    path("orders/", OrderListCreateView.as_view(), name="order_list"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order_detail"),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order_status"),
]
