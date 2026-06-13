from django.db import models
from accounts.models import User
from customers.models import Customer
from floors.models import Table
from content.models import Product
from promotions.models import Promotion, Coupon


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        READY = "ready", "Ready"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name="orders")
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    table = models.ForeignKey(Table, on_delete=models.PROTECT, related_name="orders")
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL, null=True, blank=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} — Table {self.table.number} ({self.status})"

    def calculate_totals(self):
        from decimal import Decimal

        # Sum all item subtotals
        self.subtotal = sum(item.subtotal for item in self.items.all())
        self.discount_amount = Decimal("0")

        # Apply promotion if active and order meets minimum
        if self.promotion and self.promotion.is_active and self.subtotal >= self.promotion.min_order_amount:
            if self.promotion.discount_type == "percentage":
                self.discount_amount = (self.subtotal * self.promotion.discount_value) / 100
            else:
                self.discount_amount = self.promotion.discount_value

        # Apply coupon if valid and order meets minimum
        if self.coupon and self.coupon.is_valid() and self.subtotal >= self.coupon.min_order_amount:
            if self.coupon.discount_type == "percentage":
                self.discount_amount += (self.subtotal * self.coupon.discount_value) / 100
            else:
                self.discount_amount += self.coupon.discount_value

        self.total_amount = max(self.subtotal - self.discount_amount, Decimal("0"))
        self.save()


class OrderItem(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PREPARING = "preparing", "Preparing"
        READY = "ready", "Ready"
        SERVED = "served", "Served"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name="order_items")
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto calculate subtotal on save
        self.unit_price = self.product.price
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} x{self.quantity} — Order #{self.order.id}"