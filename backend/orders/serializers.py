from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.DecimalField(source="unit_price", max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "order", "product", "product_name", "quantity", "price", "subtotal", "status", "notes", "created_at"]
        read_only_fields = ["id", "price", "subtotal", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True, source="items")
    date_time = serializers.DateTimeField(source="created_at", read_only=True)
    table_name = serializers.CharField(source="table.name", read_only=True)
    table = serializers.CharField(source="table.name", read_only=True)
    amount = serializers.DecimalField(source="total_amount", max_digits=10, decimal_places=2, read_only=True)
    coupon_code = serializers.CharField(source="coupon.code", read_only=True, default="")
    payment_method = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "cashier", "customer", "table", "table_name", "status", "payment_method",
            "amount", "items", "coupon_code", "discount_amount",
            "notes", "date_time", "updated_at", "order_items"
        ]
        read_only_fields = ["id", "date_time", "updated_at"]

    def get_payment_method(self, obj):
        try:
            if hasattr(obj, 'payment') and obj.payment:
                method = obj.payment.method
                if method:
                    if method.lower() == 'upi':
                        return 'UPI'
                    return method.capitalize()
        except Exception:
            pass
        return "-"

    def get_items(self, obj):
        try:
            items = obj.items.all()
            return ", ".join([f"{item.quantity} x {item.product.name}" for item in items])
        except Exception:
            return ""

    def get_status(self, obj):
        # Map backend status to frontend display status
        if obj.status == 'completed':
            return 'Paid'
        return 'Unpaid'
