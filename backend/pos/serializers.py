from rest_framework import serializers
from content.models import Category, Product
from floors.models import Floor, Table
from orders.models import Order, OrderItem, POSSession
from payments.models import Payment


class POSCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "image"]


class POSProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "name", "category", "category_name", "price", "image", "preparation_time", "is_available"]


class POSTableSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source="floor.name", read_only=True)

    class Meta:
        model = Table
        fields = ["id", "number", "floor", "floor_name", "capacity", "status"]


class POSFloorSerializer(serializers.ModelSerializer):
    tables = POSTableSerializer(many=True, read_only=True)

    class Meta:
        model = Floor
        fields = ["id", "name", "tables"]


class POSOrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.ImageField(source="product.image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "product_image", "quantity", "unit_price", "subtotal", "status", "notes"]
        read_only_fields = ["id", "unit_price", "subtotal"]


class POSOrderSerializer(serializers.ModelSerializer):
    items = POSOrderItemSerializer(many=True, read_only=True)
    table_number = serializers.CharField(source="table.number", read_only=True)
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    cashier_name = serializers.CharField(source="cashier.full_name", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "table", "table_number", "customer", "customer_name",
            "cashier", "cashier_name", "status", "subtotal", "discount_amount",
            "total_amount", "notes", "items", "created_at", "kds_items"
        ]
        read_only_fields = ["id", "subtotal", "discount_amount", "total_amount", "cashier", "created_at"]

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

            # For any product in existing_totals, see if it is decreased/removed
            for prod_name_key, existing_qty in existing_totals.items():
                new_qty = new_totals.get(prod_name_key, 0)
                if new_qty < existing_qty:
                    diff_to_remove = existing_qty - new_qty
                    for item in instance.items.filter(product__name__iexact=prod_name_key, status="pending").order_by("-created_at"):
                        if diff_to_remove <= 0:
                            break
                        if item.quantity <= diff_to_remove:
                            diff_to_remove -= item.quantity
                            item.delete()
                        else:
                            item.quantity -= diff_to_remove
                            item.save()
                            diff_to_remove = 0

            # Calculate KDS items (only added or altered items)
            kds_parts = []
            for prod_name_key, new_qty in new_totals.items():
                old_qty = existing_totals.get(prod_name_key, 0)
                if new_qty > old_qty:
                    diff_qty = new_qty - old_qty
                    kds_parts.append(f"{diff_qty} x {prod_name_key.title()}")

            for prod_name_key, old_qty in existing_totals.items():
                new_qty = new_totals.get(prod_name_key, 0)
                if new_qty < old_qty:
                    diff_qty = old_qty - new_qty
                    kds_parts.append(f"{diff_qty} x {prod_name_key.title()} (Removed)")

            instance.kds_items = ", ".join(kds_parts) if kds_parts else ""
            instance.save()

            # Recalculate totals
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


class POSPaymentSerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(source="order.total_amount", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "order", "order_total", "method", "status", "amount_paid", "change_returned", "transaction_ref"]
        read_only_fields = ["id", "change_returned"]

    def validate(self, data):
        order = data.get("order")
        amount_paid = data.get("amount_paid")
        method = data.get("method")

        if method == "cash" and amount_paid < order.total_amount:
            raise serializers.ValidationError("Amount paid cannot be less than order total for cash payments.")

        if Payment.objects.filter(order=order, status="completed").exists():
            raise serializers.ValidationError("This order has already been paid.")

        return data