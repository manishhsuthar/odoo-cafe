from rest_framework import serializers
from django.core.exceptions import ObjectDoesNotExist
from .models import Floor, Table


class FloorPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    def to_internal_value(self, data):
        try:
            return self.get_queryset().get(pk=data)
        except ObjectDoesNotExist:
            try:
                floor_id = int(data)
                floor, created = Floor.objects.get_or_create(
                    id=floor_id,
                    defaults={'name': f"Floor {floor_id}"}
                )
                return floor
            except Exception:
                self.fail('does_not_exist', pk_value=data)
        except (TypeError, ValueError):
            self.fail('incorrect_type', data_type=type(data).__name__)


class TableSerializer(serializers.ModelSerializer):
    floor = FloorPrimaryKeyRelatedField(queryset=Floor.objects.all())
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

