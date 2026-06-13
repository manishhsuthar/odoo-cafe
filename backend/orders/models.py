from django.db import models
from accounts.models import User
from customers.models import Customer
from floors.models import Table


class Order(models.Model):
    class Status(models.TextChoices):
        UNPAID = "Unpaid", "Unpaid"
        PAID = "Paid", "Paid"
        CANCELLED = "Cancelled", "Cancelled"

    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders", null=True, blank=True)
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    table = models.CharField(max_length=50, default="Takeaway", help_text="Table name/number")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UNPAID)
    payment_method = models.CharField(max_length=50, default="-")
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    items = models.TextField(blank=True, default="", help_text="Comma-separated item descriptions")
    coupon_code = models.CharField(max_length=50, blank=True, default="")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True, default="")
    date_time = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_time"]

    def __str__(self):
        return f"Order #{self.id} — {self.table} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product_name = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"
