from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from content.models import Category, Product
from floors.models import Floor, Table
from orders.models import Order, OrderItem, POSSession
from payments.models import Payment
from promotions.models import Coupon, Promotion

from .serializers import (
    POSCategorySerializer, POSProductSerializer,
    POSFloorSerializer, POSTableSerializer,
    POSOrderSerializer, POSOrderItemSerializer,
    POSPaymentSerializer
)


class IsCashier(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["cashier", "admin"]


# --- Menu ---

class POSCategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = POSCategorySerializer
    permission_classes = [IsCashier]


class POSProductListView(generics.ListAPIView):
    serializer_class = POSProductSerializer
    permission_classes = [IsCashier]

    def get_queryset(self):
        queryset = Product.objects.filter(is_available=True)
        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


# --- Floors & Tables ---

class POSFloorListView(generics.ListAPIView):
    queryset = Floor.objects.filter(is_active=True)
    serializer_class = POSFloorSerializer
    permission_classes = [IsCashier]


class POSTableUpdateView(generics.UpdateAPIView):
    queryset = Table.objects.all()
    serializer_class = POSTableSerializer
    permission_classes = [IsCashier]


# --- Orders ---

class POSOrderListCreateView(generics.ListCreateAPIView):
    serializer_class = POSOrderSerializer
    permission_classes = [IsCashier]

    def get_queryset(self):
        return Order.objects.filter(
            cashier=self.request.user
        ).exclude(status__in=["completed", "cancelled"])

    def perform_create(self, serializer):
        # Get open session for this cashier
        session = POSSession.objects.filter(
            cashier=self.request.user,
            status="open"
        ).first()

        order = serializer.save(
            cashier=self.request.user,
            pos_session=session
        )

        # Mark table as occupied
        order.table.status = "occupied"
        order.table.save()


class POSOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = POSOrderSerializer
    permission_classes = [IsCashier]

    def get_queryset(self):
        return Order.objects.filter(cashier=self.request.user)


class POSAddItemView(APIView):
    permission_classes = [IsCashier]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, cashier=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = POSOrderItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order)
            order.calculate_totals()
            return Response(POSOrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class POSRemoveItemView(APIView):
    permission_classes = [IsCashier]

    def delete(self, request, pk, item_pk):
        try:
            order = Order.objects.get(pk=pk, cashier=request.user)
            item = OrderItem.objects.get(pk=item_pk, order=order)
        except (Order.DoesNotExist, OrderItem.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        order.calculate_totals()
        return Response(POSOrderSerializer(order).data)


class POSApplyDiscountView(APIView):
    permission_classes = [IsCashier]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, cashier=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        coupon_code = request.data.get("coupon_code")
        promotion_id = request.data.get("promotion_id")

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)
                if not coupon.is_valid():
                    return Response({"error": "Coupon is invalid or expired"}, status=status.HTTP_400_BAD_REQUEST)
                order.coupon = coupon
            except Coupon.DoesNotExist:
                return Response({"error": "Coupon not found"}, status=status.HTTP_404_NOT_FOUND)

        if promotion_id:
            try:
                promotion = Promotion.objects.get(pk=promotion_id, is_active=True)
                order.promotion = promotion
            except Promotion.DoesNotExist:
                return Response({"error": "Promotion not found"}, status=status.HTTP_404_NOT_FOUND)

        order.save()
        order.calculate_totals()
        return Response(POSOrderSerializer(order).data)


# --- Payment ---

class POSPaymentView(APIView):
    permission_classes = [IsCashier]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, cashier=request.user)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = POSPaymentSerializer(data={**request.data, "order": order.id})
        if serializer.is_valid():
            payment = serializer.save(
                order=order,
                processed_by=request.user,
                status="completed"
            )
            # Free up the table
            order.table.status = "available"
            order.table.save()
            return Response(POSPaymentSerializer(payment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- Session ---

class POSOpenSessionView(APIView):
    permission_classes = [IsCashier]

    def post(self, request):
        # Check if already open
        existing = POSSession.objects.filter(
            cashier=request.user,
            status="open"
        ).first()

        if existing:
            return Response({
                "message": "Session already open",
                "session_id": existing.id,
                "opened_at": existing.opened_at
            })

        session = POSSession.objects.create(
            cashier=request.user,
            opening_cash=request.data.get("opening_cash", 0)
        )
        return Response({
            "message": "Session opened",
            "session_id": session.id,
            "opened_at": session.opened_at
        }, status=status.HTTP_201_CREATED)


class POSCloseSessionView(APIView):
    permission_classes = [IsCashier]

    def post(self, request):
        session = POSSession.objects.filter(
            cashier=request.user,
            status="open"
        ).first()

        if not session:
            return Response({"error": "No open session found"}, status=status.HTTP_404_NOT_FOUND)

        session.closing_cash = request.data.get("closing_cash", 0)
        session.close_session()
        return Response({
            "message": "Session closed",
            "session_id": session.id,
            "total_orders": session.total_orders,
            "total_sales": session.total_sales,
            "opened_at": session.opened_at,
            "closed_at": session.closed_at
        })