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
    pos_session = models.ForeignKey(
        "POSSession",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders"
    )

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

        self.subtotal = sum(item.subtotal for item in self.items.all())
        self.discount_amount = Decimal("0")

        if self.promotion and self.promotion.is_active and self.subtotal >= self.promotion.min_order_amount:
            if self.promotion.discount_type == "percentage":
                self.discount_amount = (self.subtotal * self.promotion.discount_value) / 100
            else:
                self.discount_amount = self.promotion.discount_value

        if self.coupon and self.coupon.is_valid() and self.subtotal >= self.coupon.min_order_amount:
            if self.coupon.discount_type == "percentage":
                self.discount_amount += (self.subtotal * self.coupon.discount_value) / 100
            else:
                self.discount_amount += self.coupon.discount_value

        self.total_amount = max(self.subtotal - self.discount_amount, Decimal("0"))

        Order.objects.filter(pk=self.pk).update(
            subtotal=self.subtotal,
            discount_amount=self.discount_amount,
            total_amount=self.total_amount
        )


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
        self.unit_price = self.product.price
        self.subtotal = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} x{self.quantity} — Order #{self.order.id}"


class POSSession(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"

    cashier = models.ForeignKey(User, on_delete=models.PROTECT, related_name="pos_sessions")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    opening_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    closing_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_orders = models.PositiveIntegerField(default=0)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-opened_at"]

    def __str__(self):
        return f"Session — {self.cashier.full_name} ({self.status}) {self.opened_at.strftime('%d %b %Y %H:%M')}"

    def close_session(self):
        from django.utils import timezone
        from django.db.models import Sum, Count

        session_orders = Order.objects.filter(
            cashier=self.cashier,
            created_at__gte=self.opened_at,
            status="completed"
        )

        result = session_orders.aggregate(
            total_sales=Sum("total_amount"),
            total_orders=Count("id")
        )

        self.total_sales = result["total_sales"] or 0
        self.total_orders = result["total_orders"] or 0
        self.status = self.Status.CLOSED
        self.closed_at = timezone.now()
        self.save()