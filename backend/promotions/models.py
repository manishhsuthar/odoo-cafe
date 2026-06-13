from django.db import models


class Coupon(models.Model):
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=50, default="Coupon", choices=[
        ("Coupon", "Coupon (Code based)"),
        ("Automated Promo", "Automated (Automatic discount)"),
    ])
    code = models.CharField(max_length=50, blank=True, default="")
    discount_type = models.CharField(max_length=50, default="Percentage", choices=[
        ("Percentage", "Percentage"),
        ("Fixed Amount", "Fixed Amount"),
    ])
    value = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    target_type = models.CharField(max_length=50, default="All", choices=[
        ("All", "All Products"),
        ("Category", "Specific Category"),
        ("Product", "Specific Product"),
    ])
    target_value = models.CharField(max_length=150, blank=True, default="")
    activated = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.code or 'Auto'})"
