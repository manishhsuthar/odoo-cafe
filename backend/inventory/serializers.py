from rest_framework import serializers
from .models import InventoryItem, InventoryLog


class InventoryLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source="performed_by.full_name", read_only=True)

    class Meta:
        model = InventoryLog
        fields = ["id", "action", "quantity_changed", "quantity_before", "quantity_after", "note", "performed_by_name", "created_at"]
        read_only_fields = ["id", "created_at"]


class InventoryItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)
    is_low_stock = serializers.SerializerMethodField()
    is_out_of_stock = serializers.SerializerMethodField()
    logs = InventoryLogSerializer(many=True, read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id", "product", "product_name", "category_name",
            "quantity", "unit", "low_stock_threshold",
            "is_low_stock", "is_out_of_stock",
            "logs", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_is_low_stock(self, obj):
        return obj.is_low_stock()

    def get_is_out_of_stock(self, obj):
        return obj.is_out_of_stock()


class RestockSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)


class AdjustmentSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True)