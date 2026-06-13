from django.db import models


class Floor(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Table(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        OCCUPIED = "occupied", "Occupied"
        RESERVED = "reserved", "Reserved"

    floor = models.ForeignKey(Floor, on_delete=models.PROTECT, related_name="tables")
    number = models.CharField(max_length=10)
    capacity = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["floor", "number"]
        ordering = ["floor", "number"]

    def __str__(self):
        return f"Table {self.number} — {self.floor.name}"