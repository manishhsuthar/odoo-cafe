from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "order", "product_name", "quantity", "price", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True, source="order_items")

    class Meta:
        model = Order
        fields = [
            "id", "cashier", "customer", "table", "status", "payment_method",
            "amount", "items", "coupon_code", "discount_amount",
            "notes", "date_time", "updated_at", "order_items"
        ]
        read_only_fields = ["id", "date_time", "updated_at"]
