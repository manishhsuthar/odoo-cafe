from datetime import date
from django.db import models


class Promotion(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FLAT = "flat", "Flat Amount"

    name = models.CharField(max_length=150)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.discount_type} — {self.discount_value})"


class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FLAT = "flat", "Flat Amount"

    class PromoType(models.TextChoices):
        COUPON = "Coupon", "Coupon"
        AUTOMATED = "Automated Promo", "Automated Promo"

    class TargetType(models.TextChoices):
        ALL = "all", "All"
        CATEGORY = "category", "Category"
        PRODUCT = "product", "Product"

    name = models.CharField(max_length=150, default="Promotion")
    type = models.CharField(max_length=20, choices=PromoType.choices, default=PromoType.COUPON)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    target_type = models.CharField(max_length=20, choices=TargetType.choices, default=TargetType.ALL)
    target_value = models.CharField(max_length=150, blank=True, default="")
    max_uses = models.PositiveIntegerField(default=1000)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    expiry_date = models.DateField(default=date(2027, 12, 31))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.code or 'Auto'} ({self.discount_type} {self.discount_value})"

    def is_valid(self):
        from django.utils import timezone
        from datetime import datetime

        expiry = self.expiry_date
        if isinstance(expiry, str):
            expiry = datetime.strptime(expiry, "%Y-%m-%d").date()

        return (
            self.is_active and
            self.used_count < self.max_uses and
            expiry >= timezone.now().date()
        )