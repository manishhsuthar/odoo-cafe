from rest_framework import serializers
from .models import Floor, Table


class TableSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source="floor.name", read_only=True)

    class Meta:
        model = Table
        fields = ["id", "floor", "floor_name", "name", "number", "capacity", "status", "customer_name", "created_at"]
        read_only_fields = ["id", "created_at"]


class FloorSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)

    class Meta:
        model = Floor
        fields = ["id", "name", "description", "is_active", "tables", "created_at"]
        read_only_fields = ["id", "created_at"]
