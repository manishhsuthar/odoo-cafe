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
            "notes", "date_time", "updated_at", "order_items", "kds_items"
        ]
        read_only_fields = ["id", "cashier", "date_time", "updated_at"]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        if not request:
            raise serializers.ValidationError("Request context is missing")

        data = request.data

        # 1. Resolve Table if provided
        table_name = data.get("table")
        if table_name:
            from floors.models import Table
            try:
                table_obj = Table.objects.filter(name__iexact=table_name).first()
                if table_obj:
                    instance.table = table_obj
            except Exception:
                pass

        # 2. Resolve Coupon
        coupon_code = data.get("couponCode") or data.get("coupon_code")
        if coupon_code is not None:
            if coupon_code == "":
                instance.coupon = None
            else:
                from promotions.models import Coupon
                coupon_obj = Coupon.objects.filter(code__iexact=coupon_code).first()
                if coupon_obj:
                    instance.coupon = coupon_obj

        # 3. Map status to choices: pending, in_progress, ready, completed, cancelled
        status_input = data.get("status")
        if status_input:
            status_lower = status_input.lower()
            if status_lower in ["paid", "completed"]:
                instance.status = "completed"
            elif status_lower in ["unpaid", "pending"]:
                instance.status = "pending"
            elif status_lower == "cancelled":
                instance.status = "cancelled"

        discount_amt = data.get("discountAmount") or data.get("discount_amount")
        if discount_amt is not None:
            instance.discount_amount = discount_amt

        total_amt = data.get("amount") or data.get("total_amount")
        if total_amt is not None:
            instance.total_amount = total_amt
            if discount_amt is not None:
                instance.subtotal = float(total_amt) + float(discount_amt)
            else:
                instance.subtotal = float(total_amt) + float(instance.discount_amount)

        notes = data.get("notes")
        if notes is not None:
            instance.notes = notes

        instance.save()

        # 4. Parse and compare OrderItems
        items_str = data.get("items")
        if items_str:
            from content.models import Product
            # Get existing items for this order
            existing_items = instance.items.all()
            # Map product name -> total quantity currently in the order
            existing_totals = {}
            for item in existing_items:
                name = item.product.name.lower()
                existing_totals[name] = existing_totals.get(name, 0) + item.quantity

            # Parse new items string
            parts = [p.strip() for p in items_str.split(",") if p.strip()]
            new_totals = {}
            for part in parts:
                try:
                    if " x " in part:
                        qty_str, prod_name = part.split(" x ", 1)
                        qty = int(qty_str)
                    else:
                        qty = 1
                        prod_name = part
                    
                    name_key = prod_name.strip().lower()
                    new_totals[name_key] = new_totals.get(name_key, 0) + qty
                except Exception as e:
                    print(f"Error parsing part: {e}")

            # For any product in new_totals, see if it is added or quantity increased
            kds_parts = []
            for prod_name_key, new_qty in new_totals.items():
                existing_qty = existing_totals.get(prod_name_key, 0)
                if new_qty > existing_qty:
                    # Quantity increased! We create a new OrderItem for the difference
                    diff_qty = new_qty - existing_qty
                    product = Product.objects.filter(name__iexact=prod_name_key).first()
                    if product:
                        OrderItem.objects.create(
                            order=instance,
                            product=product,
                            quantity=diff_qty,
                            unit_price=product.price,
                            subtotal=product.price * diff_qty,
                            status="pending"
                        )
                        kds_parts.append(f"{diff_qty} x {product.name} (Added)")

            if kds_parts:
                instance.kds_items = ", ".join(kds_parts)
            instance.save()

            # Recalculate totals across all items (original + newly added)
            instance.calculate_totals()

            # Send WebSocket update
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "kds",
                    {
                        "type": "kds_update",
                        "data": {
                            "type": "ORDER_UPDATED",
                            "order_id": instance.id,
                            "table_name": instance.table.name,
                            "kds_items": instance.kds_items,
                            "status": instance.status,
                        }
                    }
                )
            except Exception as e:
                print(f"Failed to send KDS update via WebSocket: {e}")

        # Handle Payment if status is Paid/Completed or paymentMethod is specified
        payment_method = data.get("paymentMethod") or data.get("payment_method")
        if instance.status == "completed" or (payment_method and payment_method != "-"):
            from payments.models import Payment
            method_lower = payment_method.lower() if payment_method else "cash"
            if method_lower not in ["cash", "card", "upi"]:
                method_lower = "cash"

            Payment.objects.update_or_create(
                order=instance,
                defaults={
                    "processed_by": request.user,
                    "method": method_lower,
                    "status": "completed",
                    "amount_paid": instance.total_amount
                }
            )

        return instance

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

        # Preserve Ticket Continuity: if an active order exists for this table, update it instead of creating a new ticket
        if table_obj and table_name.strip().lower() != "takeaway":
            existing_order = Order.objects.filter(
                table=table_obj,
                status__in=["pending", "in_progress", "ready"]
            ).order_by("-created_at").first()
            if existing_order:
                return self.update(existing_order, validated_data)

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
            order.kds_items = items_str
            order.save()

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

            # Send WebSocket update
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            try:
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    "kds",
                    {
                        "type": "kds_update",
                        "data": {
                            "type": "ORDER_CREATED",
                            "order_id": order.id,
                            "table_name": order.table.name,
                            "kds_items": order.kds_items,
                            "status": order.status,
                        }
                    }
                )
            except Exception as e:
                print(f"Failed to send KDS update via WebSocket: {e}")

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
