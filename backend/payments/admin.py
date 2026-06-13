from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "method", "status", "amount_paid", "change_returned", "processed_by", "created_at"]
    list_filter = ["method", "status"]
    search_fields = ["order__id", "transaction_ref"]
    readonly_fields = ["change_returned"]