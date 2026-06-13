from rest_framework import serializers
from orders.models import Order, OrderItem


class KDSOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    preparation_time = serializers.IntegerField(source="product.preparation_time", read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "category_name", "quantity", "status", "notes", "preparation_time", "created_at"]
        read_only_fields = ["id", "product", "product_name", "category_name", "quantity", "notes", "preparation_time", "created_at"]


class KDSOrderSerializer(serializers.ModelSerializer):
    items = KDSOrderItemSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source="table.number", read_only=True)
    floor_name = serializers.CharField(source="table.floor.name", read_only=True)

    class Meta:
        model = Order
        fields = ["id", "table_number", "floor_name", "status", "notes", "items", "created_at"]