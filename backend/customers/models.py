from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")
    spend = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    orders_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.phone or 'No phone'}"
