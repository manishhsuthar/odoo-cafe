import re
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Floor, Table
from .serializers import FloorSerializer, TableSerializer


def natural_sort_key(table):
    name = table.name or ""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', name)]


class FloorListCreateView(generics.ListCreateAPIView):
    queryset = Floor.objects.filter(is_active=True)
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]


class FloorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]


class TableListCreateView(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tables = list(Table.objects.all())
        tables.sort(key=lambda t: (t.floor_id or 0, natural_sort_key(t)))
        return tables


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]
