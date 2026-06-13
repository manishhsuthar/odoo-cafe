from django.contrib import admin
from .models import Floor, Table


class TableInline(admin.TabularInline):
    model = Table
    extra = 1


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    search_fields = ["name"]
    inlines = [TableInline]


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ["number", "floor", "capacity", "status"]
    list_filter = ["floor", "status"]
    search_fields = ["number"]