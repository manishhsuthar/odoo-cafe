from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "table", "status", "payment_method", "amount", "date_time"]
    list_filter = ["status", "payment_method"]
    search_fields = ["id", "table", "items"]
    inlines = [OrderItemInline]

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product_name", "quantity", "price"]
    search_fields = ["order__id", "product_name"]
