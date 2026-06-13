from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(source="order.total_amount", max_digits=10, decimal_places=2, read_only=True)
    processed_by_name = serializers.CharField(source="processed_by.full_name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "order", "order_total", "processed_by", "processed_by_name",
            "method", "status", "amount_paid", "change_returned",
            "transaction_ref", "created_at"
        ]
        read_only_fields = ["id", "change_returned", "created_at"]

    def validate(self, data):
        order = data.get("order")
        amount_paid = data.get("amount_paid")
        method = data.get("method")

        # For cash, amount paid must be >= order total
        if method == "cash" and amount_paid < order.total_amount:
            raise serializers.ValidationError("Amount paid cannot be less than order total for cash payments.")

        # Prevent duplicate payment
        if Payment.objects.filter(order=order, status="completed").exists():
            raise serializers.ValidationError("This order has already been paid.")

        return data