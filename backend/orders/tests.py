from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from floors.models import Table
from content.models import Product, Category
from orders.models import Order, OrderItem
from orders.serializers import OrderSerializer

User = get_user_model()

class KDSOrderEditTestCase(TestCase):
    def setUp(self):
        # 1. Create a cashier user
        self.cashier = User.objects.create_user(
            email="cashier@example.com",
            password="password123",
            role="cashier",
            full_name="Test Cashier"
        )
        
        # 2. Create a Table
        self.table = Table.objects.create(name="Table 5", floor=1, capacity=4)
        
        # 3. Create a Category and Products
        self.category = Category.objects.create(name="Burgers", is_active=True)
        self.burger = Product.objects.create(
            name="Classic Burger",
            price=150.00,
            category=self.category,
            is_available=True
        )
        self.fries = Product.objects.create(
            name="French Fries",
            price=80.00,
            category=self.category,
            is_available=True
        )
        
        self.factory = APIRequestFactory()

    def test_create_order_sets_kds_items(self):
        request = self.factory.post("/api/orders/", {
            "table": "Table 5",
            "amount": 230.00,
            "items": "1 x Classic Burger, 1 x French Fries",
            "status": "Unpaid"
        }, format="json")
        request.user = self.cashier
        
        serializer = OrderSerializer(data=request.data, context={"request": request})
        self.assertTrue(serializer.is_valid(), serializer.errors)
        order = serializer.save()
        
        # Check that order items were created
        self.assertEqual(order.items.count(), 2)
        # Check that kds_items matches the full items
        self.assertEqual(order.kds_items, "1 x Classic Burger, 1 x French Fries")

    def test_update_order_sets_diff_kds_items(self):
        # 1. First create an order with 1 Burger
        request = self.factory.post("/api/orders/", {
            "table": "Table 5",
            "amount": 150.00,
            "items": "1 x Classic Burger",
            "status": "Unpaid"
        }, format="json")
        request.user = self.cashier
        serializer = OrderSerializer(data=request.data, context={"request": request})
        self.assertTrue(serializer.is_valid())
        order = serializer.save()
        
        self.assertEqual(order.kds_items, "1 x Classic Burger")
        
        # 2. Now update order by adding 1 Fries (so cart has 1 Burger, 1 Fries)
        request_update = self.factory.patch(f"/api/orders/{order.id}/", {
            "table": "Table 5",
            "amount": 230.00,
            "items": "1 x Classic Burger, 1 x French Fries",
            "status": "Unpaid"
        }, format="json")
        request_update.user = self.cashier
        
        serializer_update = OrderSerializer(order, data=request_update.data, partial=True, context={"request": request_update})
        self.assertTrue(serializer_update.is_valid(), serializer_update.errors)
        updated_order = serializer_update.save()
        
        # Check that only French Fries was added as new OrderItem (total 2 OrderItem instances)
        self.assertEqual(updated_order.items.count(), 2)
        # Check that kds_items contains only the diff (French Fries)
        self.assertEqual(updated_order.kds_items, "1 x French Fries")

    def test_update_order_removes_and_adds_kds_items(self):
        # 1. First create an order with 2 Burgers, 1 Fries
        request = self.factory.post("/api/orders/", {
            "table": "Table 5",
            "amount": 380.00,
            "items": "2 x Classic Burger, 1 x French Fries",
            "status": "Unpaid"
        }, format="json")
        request.user = self.cashier
        serializer = OrderSerializer(data=request.data, context={"request": request})
        self.assertTrue(serializer.is_valid())
        order = serializer.save()
        
        # 2. Now update order by removing 1 Burger and adding 1 Fries (so cart has 1 Burger, 2 Fries)
        request_update = self.factory.patch(f"/api/orders/{order.id}/", {
            "table": "Table 5",
            "amount": 310.00,
            "items": "1 x Classic Burger, 2 x French Fries",
            "status": "Unpaid"
        }, format="json")
        request_update.user = self.cashier
        
        serializer_update = OrderSerializer(order, data=request_update.data, partial=True, context={"request": request_update})
        self.assertTrue(serializer_update.is_valid())
        updated_order = serializer_update.save()
        
        # kds_items should show: "+1 x French Fries, -1 x Classic Burger" or similar depending on sorting.
        # Let's verify both are in the kds_items string
        self.assertIn("1 x Classic Burger (Removed)", updated_order.kds_items)
        self.assertIn("1 x French Fries", updated_order.kds_items)
