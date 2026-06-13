from django.urls import path
from .views import (
    POSCategoryListView, POSProductListView,
    POSFloorListView, POSTableUpdateView,
    POSOrderListCreateView, POSOrderDetailView,
    POSAddItemView, POSRemoveItemView,
    POSApplyDiscountView, POSPaymentView,
    POSOpenSessionView, POSCloseSessionView
)

urlpatterns = [
    # Menu
    path("categories/", POSCategoryListView.as_view(), name="pos_categories"),
    path("products/", POSProductListView.as_view(), name="pos_products"),

    # Floors & Tables
    path("floors/", POSFloorListView.as_view(), name="pos_floors"),
    path("tables/<int:pk>/", POSTableUpdateView.as_view(), name="pos_table_update"),

    # Orders
    path("orders/", POSOrderListCreateView.as_view(), name="pos_order_list"),
    path("orders/<int:pk>/", POSOrderDetailView.as_view(), name="pos_order_detail"),
    path("orders/<int:pk>/add-item/", POSAddItemView.as_view(), name="pos_add_item"),
    path("orders/<int:pk>/remove-item/<int:item_pk>/", POSRemoveItemView.as_view(), name="pos_remove_item"),
    path("orders/<int:pk>/apply-discount/", POSApplyDiscountView.as_view(), name="pos_apply_discount"),
    path("orders/<int:pk>/payment/", POSPaymentView.as_view(), name="pos_payment"),

    # Session
    path("session/open/", POSOpenSessionView.as_view(), name="pos_open_session"),
    path("session/close/", POSCloseSessionView.as_view(), name="pos_close_session"),
]