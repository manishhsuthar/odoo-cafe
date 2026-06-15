from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg, F
from django.db.models.functions import TruncDate
from orders.models import Order, OrderItem
from datetime import datetime
from decimal import Decimal


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ["admin", "cashier"]


class ReportsSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Order.objects.filter(status="completed")
        queryset = apply_date_filter(queryset, request)

        result = queryset.aggregate(
            total_orders=Count("id"),
            total_revenue=Sum("total_amount"),
            avg_order_value=Avg("total_amount")
        )

        return Response({
            "total_orders": result["total_orders"] or 0,
            "total_revenue": result["total_revenue"] or Decimal("0.00"),
            "avg_order_value": result["avg_order_value"] or Decimal("0.00"),
        })


class SalesTrendView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Order.objects.filter(status="completed")
        queryset = apply_date_filter(queryset, request)

        trend = queryset.annotate(
            date=TruncDate("created_at")
        ).values("date").annotate(
            total_orders=Count("id"),
            total_revenue=Sum("total_amount")
        ).order_by("date")

        return Response(list(trend))


class TopOrdersView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = Order.objects.filter(status="completed")
        queryset = apply_date_filter(queryset, request)

        # Customer filter
        customer_id = request.query_params.get("customer")
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        orders = queryset.select_related(
            "customer", "table"
        ).prefetch_related("items__product").order_by("-total_amount")[:50]

        data = []
        for order in orders:
            items_summary = ", ".join([
                f"{item.product.name} x{item.quantity}"
                for item in order.items.all()
            ])
            data.append({
                "order_id": order.id,
                "customer": order.customer.name if order.customer else "Walk-in",
                "amount": order.total_amount,
                "items": items_summary,
                "date": order.created_at.strftime("%d %b %Y %H:%M"),
            })

        return Response(data)


class TopProductsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = OrderItem.objects.filter(order__status="completed")

        # Date filter on related order
        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")
        if date_from:
            queryset = queryset.filter(order__created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(order__created_at__date__lte=date_to)

        # Product filter
        product_id = request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        products = queryset.values(
            "product__name"
        ).annotate(
            quantity_sold=Sum("quantity"),
            revenue=Sum("subtotal")
        ).order_by("-revenue")

        # Calculate total revenue for percentage
        total_revenue = sum(p["revenue"] or 0 for p in products)

        data = []
        for p in products:
            revenue = p["revenue"] or Decimal("0")
            data.append({
                "product": p["product__name"],
                "quantity_sold": p["quantity_sold"],
                "revenue": revenue,
                "percent_of_revenue": round((revenue / total_revenue * 100), 2) if total_revenue else 0,
            })

        return Response(data)


class TopCategoriesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = OrderItem.objects.filter(order__status="completed")

        # Date filter
        date_from = request.query_params.get("from")
        date_to = request.query_params.get("to")
        if date_from:
            queryset = queryset.filter(order__created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(order__created_at__date__lte=date_to)

        # Category filter
        category_id = request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(product__category_id=category_id)

        categories = queryset.values(
            "product__category__name"
        ).annotate(
            revenue=Sum("subtotal"),
            orders=Count("order", distinct=True)
        ).order_by("-revenue")

        total_revenue = sum(c["revenue"] or 0 for c in categories)

        data = []
        for c in categories:
            revenue = c["revenue"] or Decimal("0")
            data.append({
                "category": c["product__category__name"],
                "revenue": revenue,
                "orders": c["orders"],
                "percent_of_revenue": round((revenue / total_revenue * 100), 2) if total_revenue else 0,
            })

        return Response(data)


def apply_date_filter(queryset, request):
    date_from = request.query_params.get("from")
    date_to = request.query_params.get("to")
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)
    return queryset