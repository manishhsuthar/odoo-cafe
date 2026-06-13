from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Floor, Table
from .serializers import FloorSerializer, TableSerializer


class FloorListCreateView(generics.ListCreateAPIView):
    queryset = Floor.objects.filter(is_active=True)
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]


class FloorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Floor.objects.all()
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]


class TableListCreateView(generics.ListCreateAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.all()
    serializer_class = TableSerializer
    permission_classes = [IsAuthenticated]
