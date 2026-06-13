from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id", "order", "product", "product_name",
            "quantity", "unit_price", "subtotal", "status", "notes", "created_at"
        ]
        read_only_fields = ["id", "unit_price", "subtotal", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    cashier_name = serializers.CharField(source="cashier.full_name", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    table_number = serializers.CharField(source="table.number", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "cashier", "cashier_name", "customer", "customer_name",
            "table", "table_number", "promotion", "coupon", "status",
            "subtotal", "discount_amount", "total_amount",
            "notes", "items", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "subtotal", "discount_amount", "total_amount", "created_at", "updated_at"]