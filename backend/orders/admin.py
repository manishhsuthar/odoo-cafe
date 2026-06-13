from django.contrib import admin
from .models import Order, OrderItem, POSSession


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ["unit_price", "subtotal"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "table", "cashier", "customer", "status", "subtotal", "discount_amount", "display_total", "created_at"]
    list_filter = ["status", "table__floor"]
    search_fields = ["id", "table__number", "customer__name", "cashier__full_name"]
    readonly_fields = ["subtotal", "discount_amount", "total_amount"]
    inlines = [OrderItemInline]

    def display_total(self, obj):
        return f"₹{obj.total_amount}"
    display_total.short_description = "Total"

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        form.instance.calculate_totals()


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product", "quantity", "unit_price", "subtotal", "status"]
    list_filter = ["status"]
    search_fields = ["order__id", "product__name"]


@admin.register(POSSession)
class POSSessionAdmin(admin.ModelAdmin):
    list_display = ["cashier", "status", "opening_cash", "closing_cash", "total_orders", "display_total_sales", "opened_at", "closed_at"]
    list_filter = ["status", "cashier"]
    search_fields = ["cashier__full_name", "cashier__email"]
    readonly_fields = ["total_orders", "total_sales", "opened_at", "closed_at"]

    def display_total_sales(self, obj):
        return f"₹{obj.total_sales}"
    display_total_sales.short_description = "Total Sales"

    def has_delete_permission(self, request, obj=None):
        return False