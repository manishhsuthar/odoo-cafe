from django.contrib import admin
from .models import InventoryItem, InventoryLog


class InventoryLogInline(admin.TabularInline):
    model = InventoryLog
    extra = 0
    readonly_fields = ["action", "quantity_changed", "quantity_before", "quantity_after", "performed_by", "created_at"]

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ["product", "quantity", "unit", "low_stock_threshold", "display_status", "updated_at"]
    list_filter = ["unit"]
    search_fields = ["product__name"]
    inlines = [InventoryLogInline]

    def display_status(self, obj):
        if obj.is_out_of_stock():
            return "❌ Out of Stock"
        elif obj.is_low_stock():
            return "⚠️ Low Stock"
        return "✅ In Stock"
    display_status.short_description = "Status"


@admin.register(InventoryLog)
class InventoryLogAdmin(admin.ModelAdmin):
    list_display = ["inventory_item", "action", "quantity_changed", "quantity_before", "quantity_after", "performed_by", "created_at"]
    list_filter = ["action"]
    search_fields = ["inventory_item__product__name"]
    readonly_fields = ["inventory_item", "action", "quantity_changed", "quantity_before", "quantity_after", "performed_by", "created_at"]

    def has_add_permission(self, request):
        return False