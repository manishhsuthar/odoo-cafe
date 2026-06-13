from django.contrib import admin
from .models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["name", "type", "code", "discount_type", "value", "min_amount", "activated"]
    list_filter = ["type", "discount_type", "activated"]
    search_fields = ["name", "code"]
