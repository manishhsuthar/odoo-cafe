from rest_framework import serializers
from .models import Reservation


class ReservationSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    table_number = serializers.CharField(source="table.number", read_only=True)
    floor_name = serializers.CharField(source="table.floor.name", read_only=True)

    class Meta:
        model = Reservation
        fields = [
            "id", "customer", "customer_name", "customer_phone",
            "table", "table_number", "floor_name",
            "reservation_date", "reservation_time", "party_size",
            "status", "notes", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]