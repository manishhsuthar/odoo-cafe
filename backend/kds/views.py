from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from orders.models import Order, OrderItem
from .serializers import KDSOrderSerializer, KDSOrderItemSerializer
from inventory.utils import deduct_inventory


class IsKDSReadOrKitchenWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return request.user.role in ["kitchen", "admin", "cashier"]
        return request.user.role in ["kitchen", "admin"]


class KDSOrderListView(generics.ListAPIView):
    serializer_class = KDSOrderSerializer
    permission_classes = [IsKDSReadOrKitchenWrite]

    def get_queryset(self):
        queryset = Order.objects.filter(
            status__in=["pending", "in_progress"]
        ).prefetch_related("items__product", "table__floor")

        tab = self.request.query_params.get("tab")
        if tab == "to_cook":
            queryset = queryset.filter(status="pending")
        elif tab == "preparing":
            queryset = queryset.filter(status="in_progress")

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(table__number__icontains=search) | \
                       queryset.filter(id__icontains=search)

        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(items__product__category_id=category_id).distinct()

        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(items__product_id=product_id).distinct()

        return queryset


class KDSOrderDetailView(generics.RetrieveAPIView):
    serializer_class = KDSOrderSerializer
    permission_classes = [IsKDSReadOrKitchenWrite]
    queryset = Order.objects.all()


class KDSDashboardView(APIView):
    permission_classes = [IsKDSReadOrKitchenWrite]

    def get(self, request):
        all_orders = Order.objects.filter(status__in=["pending", "in_progress"])
        preparing_orders = Order.objects.filter(status="in_progress")
        completed_orders = Order.objects.filter(status="completed")

        preparing_data = KDSOrderSerializer(preparing_orders, many=True).data

        return Response({
            "counts": {
                "all": all_orders.count(),
                "preparing": preparing_orders.count(),
                "completed": completed_orders.count(),
            },
            "preparing_orders": preparing_data,
            "completed_count_for_reports": completed_orders.count(),
        })


class KDSUpdateItemView(APIView):
    permission_classes = [IsKDSReadOrKitchenWrite]

    def patch(self, request, item_pk):
        try:
            item = OrderItem.objects.get(pk=item_pk)
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        valid_statuses = ["pending", "preparing", "ready", "served"]

        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Choose from {valid_statuses}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Auto deduct inventory when chef starts preparing
        if new_status == "preparing":
            deduct_inventory(item, performed_by=request.user)

        # These lines are OUTSIDE the if block — always run
        item.status = new_status
        item.save()

        order = item.order
        all_items = order.items.all()
        channel_layer = get_channel_layer()

        # Update order status based on items
        if all(i.status == "ready" for i in all_items):
            order.status = "ready"
            order.save()

            # Notify cashier that order is ready
            try:
                async_to_sync(channel_layer.group_send)(
                    "cashier",
                    {
                        "type": "order_ready",
                        "data": {
                            "type": "ORDER_READY",
                            "order_id": order.id,
                            "table_number": order.table.number,
                            "floor_name": order.table.floor.name,
                            "message": f"Order #{order.id} — Table {order.table.number} is ready!"
                        }
                    }
                )
            except Exception as e:
                print(f"Failed to send cashier notification via WebSocket: {e}")

        elif any(i.status == "preparing" for i in all_items):
            order.status = "in_progress"
            order.save()

        # Notify KDS of item update
        try:
            async_to_sync(channel_layer.group_send)(
                "kds",
                {
                    "type": "kds_update",
                    "data": {
                        "type": "ITEM_UPDATED",
                        "order_id": order.id,
                        "item_id": item.id,
                        "item_status": item.status,
                        "order_status": order.status,
                    }
                }
            )
        except Exception as e:
            print(f"Failed to send KDS update via WebSocket: {e}")

        return Response(KDSOrderItemSerializer(item).data)
    