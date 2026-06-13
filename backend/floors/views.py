from rest_framework import generics, permissions
from .models import Floor, Table
from .serializers import FloorSerializer, TableSerializer


class FloorListCreateView(generics.ListCreateAPIView):
    queryset = Floor.objects.filter(is_active=True)
    serializer_class = FloorSerializer
    permission_classes = [permissions.IsAdminUser]


class FloorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [permissions.IsAdminUser]


class TableListCreateView(generics.ListCreateAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [permissions.IsAdminUser]


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [permissions.IsAdminUser]