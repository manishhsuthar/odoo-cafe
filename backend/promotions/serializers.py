from rest_framework import serializers
from .models import Promotion, Coupon


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = [
            "id", "name", "discount_type", "discount_value",
            "min_order_amount", "is_active", "start_date", "end_date", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            "id", "code", "discount_type", "discount_value", "min_order_amount",
            "max_uses", "used_count", "is_active", "expiry_date", "created_at", "is_valid"
        ]
        read_only_fields = ["id", "used_count", "created_at"]

    def get_is_valid(self, obj):
        return obj.is_valid()