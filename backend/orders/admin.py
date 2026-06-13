from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ["unit_price", "subtotal"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "table", "cashier", "customer", "status", "subtotal", "discount_amount", "total_amount", "created_at"]
    list_filter = ["status", "table__floor"]
    search_fields = ["id", "table__number", "customer__name", "cashier__full_name"]
    readonly_fields = ["subtotal", "discount_amount", "total_amount"]
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product", "quantity", "unit_price", "subtotal", "status"]
    list_filter = ["status"]
    search_fields = ["order__id", "product__name"]