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
            "total_amount", "notes", "items", "created_at"
        ]
        read_only_fields = ["id", "subtotal", "discount_amount", "total_amount", "cashier", "created_at"]


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