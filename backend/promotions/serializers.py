from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            "id", "name", "type", "code", "discount_type", "discount_value",
            "min_order_amount", "target_type", "target_value",
            "max_uses", "used_count", "is_active", "expiry_date", "created_at", "is_valid"
        ]
        read_only_fields = ["id", "used_count", "created_at"]

    def get_is_valid(self, obj):
        return obj.is_valid()