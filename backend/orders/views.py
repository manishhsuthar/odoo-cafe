from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from payments.models import Payment


class IsCashierOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ["cashier", "admin"]


class OrderListCreateView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsCashierOrAdmin]

    def perform_create(self, serializer):
        serializer.save(cashier=self.request.user)


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]


class OrderStatusUpdateView(APIView):
    permission_classes = [IsCashierOrAdmin]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status")
        payment_method = request.data.get("payment_method")

        # Map frontend statuses
        if new_status:
            status_lower = new_status.lower()
            if status_lower in ["paid", "completed"]:
                order.status = "completed"
            elif status_lower in ["unpaid", "pending"]:
                order.status = "pending"
            elif status_lower == "cancelled":
                order.status = "cancelled"
            else:
                order.status = new_status

        # Handle Payment relation
        if payment_method and payment_method != "-":
            method_lower = payment_method.lower()
            # Map to method choices (cash, card, upi)
            if method_lower not in ["cash", "card", "upi"]:
                method_lower = "cash"

            # Check if payment already exists
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    "processed_by": request.user,
                    "method": method_lower,
                    "status": "completed",
                    "amount_paid": order.total_amount
                }
            )
            if not created:
                payment.method = method_lower
                payment.status = "completed"
                payment.amount_paid = order.total_amount
                payment.save()

            order.status = "completed"
        elif new_status and new_status.lower() in ["paid", "completed"]:
            # Default payment method if status is paid but method is missing
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults={
                    "processed_by": request.user,
                    "method": "cash",
                    "status": "completed",
                    "amount_paid": order.total_amount
                }
            )
            if not created:
                payment.status = "completed"
                payment.save()

            order.status = "completed"
        elif new_status and new_status.lower() in ["unpaid", "pending"]:
            # Delete payment or mark failed if unpaid
            Payment.objects.filter(order=order).delete()
            order.status = "pending"

        order.save()
        return Response(OrderSerializer(order).data)
