from django.urls import path
from .views import (
    InventoryListView, InventoryDetailView,
    RestockView, AdjustmentView, InventoryAlertsView
)

urlpatterns = [
    path("", InventoryListView.as_view(), name="inventory_list"),
    path("<int:pk>/", InventoryDetailView.as_view(), name="inventory_detail"),
    path("<int:pk>/restock/", RestockView.as_view(), name="inventory_restock"),
    path("<int:pk>/adjust/", AdjustmentView.as_view(), name="inventory_adjust"),
    path("alerts/", InventoryAlertsView.as_view(), name="inventory_alerts"),
]