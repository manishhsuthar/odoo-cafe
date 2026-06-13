from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import InventoryItem, InventoryLog
from .serializers import InventoryItemSerializer, RestockSerializer, AdjustmentSerializer
from .utils import deduct_inventory


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class InventoryListView(generics.ListCreateAPIView):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = InventoryItem.objects.select_related("product__category").prefetch_related("logs")

        stock_status = self.request.query_params.get("status")
        category_id = self.request.query_params.get("category")

        if category_id:
            queryset = queryset.filter(product__category_id=category_id)

        all_items = list(queryset)

        if stock_status == "low":
            return [item for item in all_items if item.is_low_stock()]
        elif stock_status == "out":
            return [item for item in all_items if item.is_out_of_stock()]

        return all_items


class InventoryDetailView(generics.RetrieveUpdateAPIView):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAdmin]


class RestockView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Inventory item not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RestockSerializer(data=request.data)
        if serializer.is_valid():
            quantity_before = item.quantity
            item.quantity += serializer.validated_data["quantity"]
            item.save()

            InventoryLog.objects.create(
                inventory_item=item,
                action="restock",
                quantity_changed=serializer.validated_data["quantity"],
                quantity_before=quantity_before,
                quantity_after=item.quantity,
                note=serializer.validated_data.get("note", ""),
                performed_by=request.user
            )

            if quantity_before == 0:
                item.product.is_available = True
                item.product.save()

            return Response(InventoryItemSerializer(item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdjustmentView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            item = InventoryItem.objects.get(pk=pk)
        except InventoryItem.DoesNotExist:
            return Response({"error": "Inventory item not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdjustmentSerializer(data=request.data)
        if serializer.is_valid():
            quantity_before = item.quantity
            new_quantity = item.quantity + serializer.validated_data["quantity"]

            if new_quantity < 0:
                return Response({"error": "Quantity cannot go below zero"}, status=status.HTTP_400_BAD_REQUEST)

            item.quantity = new_quantity
            item.save()

            InventoryLog.objects.create(
                inventory_item=item,
                action="adjustment",
                quantity_changed=serializer.validated_data["quantity"],
                quantity_before=quantity_before,
                quantity_after=item.quantity,
                note=serializer.validated_data.get("note", ""),
                performed_by=request.user
            )

            from .utils import deduct_inventory
            if item.is_out_of_stock():
                item.product.is_available = False
                item.product.save()
            elif item.is_low_stock():
                pass

            return Response(InventoryItemSerializer(item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InventoryAlertsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        all_items = list(InventoryItem.objects.select_related("product"))
        low_stock = [item for item in all_items if item.is_low_stock()]
        out_of_stock = [item for item in all_items if item.is_out_of_stock()]

        return Response({
            "low_stock": InventoryItemSerializer(low_stock, many=True).data,
            "out_of_stock": InventoryItemSerializer(out_of_stock, many=True).data,
            "total_alerts": len(low_stock) + len(out_of_stock)
        })