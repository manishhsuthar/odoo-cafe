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
        read_only_fields = ["id", "cashier", "date_time", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if not request:
            raise serializers.ValidationError("Request context is missing")

        data = request.data

        # 1. Resolve Table
        table_name = data.get("table")
        if not table_name:
            raise serializers.ValidationError({"table": "Table name is required"})

        from floors.models import Table
        try:
            table_obj = Table.objects.filter(name__iexact=table_name).first()
            if not table_obj:
                table_obj = Table.objects.first()
                if not table_obj:
                    table_obj = Table.objects.create(name=table_name, floor=1, capacity=4)
        except Exception as e:
            raise serializers.ValidationError({"table": f"Error resolving table: {str(e)}"})

        # 2. Resolve Coupon
        coupon_obj = None
        coupon_code = data.get("couponCode") or data.get("coupon_code")
        if coupon_code:
            from promotions.models import Coupon
            coupon_obj = Coupon.objects.filter(code__iexact=coupon_code).first()

        # 3. Map status to choices: pending, in_progress, ready, completed, cancelled
        status_input = data.get("status")
        backend_status = "pending"
        if status_input:
            status_lower = status_input.lower()
            if status_lower in ["paid", "completed"]:
                backend_status = "completed"
            elif status_lower in ["unpaid", "pending"]:
                backend_status = "pending"
            elif status_lower == "cancelled":
                backend_status = "cancelled"

        # 4. Create the Order
        discount_amt = data.get("discountAmount") or 0
        total_amt = data.get("amount") or 0
        subtotal = float(total_amt) + float(discount_amt)

        order = Order.objects.create(
            cashier=validated_data.get("cashier") or request.user,
            customer=validated_data.get("customer"),
            table=table_obj,
            coupon=coupon_obj,
            status=backend_status,
            subtotal=subtotal,
            discount_amount=discount_amt,
            total_amount=total_amt,
            notes=data.get("notes", "")
        )

        # 5. Parse and create OrderItems
        items_str = data.get("items")
        if items_str:
            from content.models import Product
            parts = [p.strip() for p in items_str.split(",") if p.strip()]
            for part in parts:
                try:
                    if " x " in part:
                        qty_str, prod_name = part.split(" x ", 1)
                        qty = int(qty_str)
                    else:
                        qty = 1
                        prod_name = part
                    
                    product = Product.objects.filter(name__iexact=prod_name).first()
                    if product:
                        OrderItem.objects.create(
                            order=order,
                            product=product,
                            quantity=qty,
                            unit_price=product.price,
                            subtotal=product.price * qty,
                            status="pending"
                        )
                except Exception as e:
                    print(f"Error parsing order item part '{part}': {str(e)}")

        # Handle Payment if status is Paid/Completed
        payment_method = data.get("paymentMethod") or data.get("payment_method")
        if backend_status == "completed" or (payment_method and payment_method != "-"):
            from payments.models import Payment
            method_lower = payment_method.lower() if payment_method else "cash"
            if method_lower not in ["cash", "card", "upi"]:
                method_lower = "cash"
            
            Payment.objects.create(
                order=order,
                processed_by=request.user,
                method=method_lower,
                status="completed",
                amount_paid=total_amt
            )

        return order

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
