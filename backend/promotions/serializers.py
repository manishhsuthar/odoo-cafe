from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = [
            "id", "name", "type", "code", "discount_type", "value",
            "min_amount", "target_type", "target_value", "activated", "created_at"
        ]
        read_only_fields = ["id", "created_at"]
