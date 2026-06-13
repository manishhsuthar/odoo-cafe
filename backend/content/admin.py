from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "color", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "display_price", "in_stock", "tax"]
    list_filter = ["category", "in_stock"]
    search_fields = ["name"]

    def display_price(self, obj):
        return f"₹{obj.price}"
    display_price.short_description = "Price"
