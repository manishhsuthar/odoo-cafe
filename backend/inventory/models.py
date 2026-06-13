from django.db import models
from content.models import Product
from accounts.models import User


class InventoryItem(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="inventory")
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    unit = models.CharField(max_length=50, default="pieces")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} — {self.quantity} {self.unit}"

    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold and self.quantity > 0

    def is_out_of_stock(self):
        return self.quantity == 0


class InventoryLog(models.Model):
    class ActionType(models.TextChoices):
        RESTOCK = "restock", "Restock"
        DEDUCTION = "deduction", "Deduction"
        ADJUSTMENT = "adjustment", "Adjustment"

    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name="logs")
    action = models.CharField(max_length=20, choices=ActionType.choices)
    quantity_changed = models.IntegerField()
    quantity_before = models.PositiveIntegerField()
    quantity_after = models.PositiveIntegerField()
    note = models.TextField(blank=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.inventory_item.product.name} — {self.action} ({self.quantity_changed})"