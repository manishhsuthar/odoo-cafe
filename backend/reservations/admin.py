from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ["customer", "table", "reservation_date", "reservation_time", "party_size", "status", "created_at"]
    list_filter = ["status", "reservation_date", "table"]
    search_fields = ["customer__name", "customer__phone", "table__number"]
    readonly_fields = ["created_at", "updated_at"]