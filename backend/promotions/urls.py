from django.urls import path
from .views import (
    PromotionListCreateView, PromotionDetailView,
    CouponListCreateView, CouponDetailView
)

urlpatterns = [
    path("promotions/", PromotionListCreateView.as_view(), name="promotion_list"),
    path("promotions/<int:pk>/", PromotionDetailView.as_view(), name="promotion_detail"),
    path("coupons/", CouponListCreateView.as_view(), name="coupon_list"),
    path("coupons/<int:pk>/", CouponDetailView.as_view(), name="coupon_detail"),
]