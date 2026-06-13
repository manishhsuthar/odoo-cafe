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
        FREE = "free", "Free"
        OCCUPIED = "occupied", "Occupied"
        RESERVED = "reserved", "Reserved"

    floor = models.ForeignKey(Floor, on_delete=models.PROTECT, related_name="tables")
    name = models.CharField(max_length=10, help_text="Table identifier like f1, s2")
    number = models.CharField(max_length=10, blank=True, default="")
    capacity = models.PositiveIntegerField(default=4)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.FREE)
    customer_name = models.CharField(max_length=150, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["floor", "name"]
        ordering = ["floor", "name"]

    def __str__(self):
        return f"Table {self.name} — {self.floor.name}"
