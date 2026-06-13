from django.contrib import admin
from .models import Promotion, Coupon


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ["name", "discount_type", "discount_value", "min_order_amount", "is_active", "start_date", "end_date"]
    list_filter = ["discount_type", "is_active"]
    search_fields = ["name"]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code", "discount_type", "discount_value", "min_order_amount", "max_uses", "used_count", "is_active", "expiry_date"]
    list_filter = ["discount_type", "is_active"]
    search_fields = ["code"]