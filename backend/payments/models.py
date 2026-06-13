from django.db import models
from orders.models import Order
from accounts.models import User


class Payment(models.Model):
    class Method(models.TextChoices):
        CASH = "cash", "Cash"
        CARD = "card", "Card"
        UPI = "upi", "UPI"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name="payment")
    processed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="payments")
    method = models.CharField(max_length=20, choices=Method.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    change_returned = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    transaction_ref = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} — {self.method} ({self.status})"

    def save(self, *args, **kwargs):
        # Auto calculate change for cash payments
        if self.method == self.Method.CASH:
            self.change_returned = max(self.amount_paid - self.order.total_amount, 0)
        super().save(*args, **kwargs)

        # Mark order as completed when payment is completed
        if self.status == self.Status.COMPLETED:
            self.order.status = "completed"
            self.order.save()

            # Increment coupon used count if applied
            if self.order.coupon:
                self.order.coupon.used_count += 1
                self.order.coupon.save()