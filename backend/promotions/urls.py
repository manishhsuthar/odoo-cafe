from django.urls import path
from .views import CouponListCreateView, CouponDetailView

urlpatterns = [
    path("coupons/", CouponListCreateView.as_view(), name="coupon_list"),
    path("coupons/<int:pk>/", CouponDetailView.as_view(), name="coupon_detail"),
]
