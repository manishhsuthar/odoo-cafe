from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate
from orders.models import Order, OrderItem
from content.models import Product, Category
from datetime import datetime
from decimal import Decimal


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


def get_completed_orders():
    return Order.objects.exclude(status__iexact="cancelled").distinct()


def get_completed_order_items():
    return OrderItem.objects.exclude(order__status__iexact="cancelled").distinct()


def apply_date_filter(queryset, request, prefix=""):
    date_from = request.query_params.get("from")
    date_to = request.query_params.get("to")
    if date_from:
        clean_from = str(date_from).split("T")[0] if "T" in str(date_from) else str(date_from)
        filter_kwargs = {f"{prefix}created_at__date__gte": clean_from}
        queryset = queryset.filter(**filter_kwargs)
    if date_to:
        clean_to = str(date_to).split("T")[0] if "T" in str(date_to) else str(date_to)
        filter_kwargs = {f"{prefix}created_at__date__lte": clean_to}
        queryset = queryset.filter(**filter_kwargs)
    return queryset


class ReportsSummaryView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = get_completed_orders()
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
        queryset = get_completed_orders()
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
        queryset = get_completed_orders()
        queryset = apply_date_filter(queryset, request)

        # Customer filter (numeric ID or customer name search)
        customer_param = request.query_params.get("customer")
        if customer_param:
            if str(customer_param).isdigit():
                queryset = queryset.filter(customer_id=customer_param)
            else:
                queryset = queryset.filter(customer__name__icontains=customer_param)

        orders = queryset.select_related(
            "customer", "table"
        ).prefetch_related("items__product").order_by("-total_amount")[:50]

        data = []
        for order in orders:
            items_list = [
                f"{item.product.name} x{item.quantity}"
                for item in order.items.all()
                if item.product
            ]
            items_summary = ", ".join(items_list) if items_list else (order.kds_items or "")
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
        queryset = get_completed_order_items()
        queryset = apply_date_filter(queryset, request, prefix="order__")

        # Product filter
        product_param = request.query_params.get("product")
        if product_param:
            if str(product_param).isdigit():
                queryset = queryset.filter(product_id=product_param)
            else:
                queryset = queryset.filter(product__name__icontains=product_param)

        products = queryset.values(
            "product__name"
        ).annotate(
            quantity_sold=Sum("quantity"),
            revenue=Sum("subtotal")
        ).order_by("-revenue")

        total_revenue = sum(p["revenue"] or 0 for p in products)

        data = []
        for p in products:
            prod_name = p["product__name"] or "Unknown Product"
            revenue = p["revenue"] or Decimal("0")
            data.append({
                "product": prod_name,
                "quantity_sold": p["quantity_sold"],
                "revenue": revenue,
                "percent_of_revenue": round((revenue / total_revenue * 100), 2) if total_revenue else 0,
            })

        # Fallback to order.kds_items if OrderItems are missing but completed orders exist
        if not data:
            orders = get_completed_orders()
            orders = apply_date_filter(orders, request)
            product_totals = {}
            for order in orders:
                if not order.kds_items:
                    continue
                parts = [pt.strip() for pt in order.kds_items.split(",") if pt.strip()]
                for part in parts:
                    if " x " in part:
                        try:
                            q_str, name = part.split(" x ", 1)
                            qty = int(q_str)
                        except Exception:
                            qty, name = 1, part
                    else:
                        qty, name = 1, part
                    name = name.strip()
                    if product_param and product_param.lower() not in name.lower():
                        continue
                    prod_obj = Product.objects.filter(Q(name__iexact=name) | Q(name__icontains=name)).first()
                    price = prod_obj.price if prod_obj else Decimal("0")
                    if price == Decimal("0") and order.total_amount > 0 and len(parts) > 0:
                        price = order.total_amount / Decimal(len(parts))
                    if name not in product_totals:
                        product_totals[name] = {"quantity_sold": 0, "revenue": Decimal("0")}
                    product_totals[name]["quantity_sold"] += qty
                    product_totals[name]["revenue"] += price * qty

            fallback_total_rev = sum(item["revenue"] for item in product_totals.values())
            for pname, item in sorted(product_totals.items(), key=lambda x: x[1]["revenue"], reverse=True):
                data.append({
                    "product": pname,
                    "quantity_sold": item["quantity_sold"],
                    "revenue": item["revenue"],
                    "percent_of_revenue": round((item["revenue"] / fallback_total_rev * 100), 2) if fallback_total_rev else 0,
                })

        return Response(data)


class TopCategoriesView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        queryset = get_completed_order_items()
        queryset = apply_date_filter(queryset, request, prefix="order__")

        # Category filter
        category_param = request.query_params.get("category")
        if category_param:
            if str(category_param).isdigit():
                queryset = queryset.filter(product__category_id=category_param)
            else:
                queryset = queryset.filter(product__category__name__icontains=category_param)

        categories = queryset.values(
            "product__category__name"
        ).annotate(
            revenue=Sum("subtotal"),
            orders=Count("order", distinct=True)
        ).order_by("-revenue")

        total_revenue = sum(c["revenue"] or 0 for c in categories)

        data = []
        for c in categories:
            cat_name = c["product__category__name"] or "Other"
            revenue = c["revenue"] or Decimal("0")
            data.append({
                "category": cat_name,
                "revenue": revenue,
                "orders": c["orders"],
                "percent_of_revenue": round((revenue / total_revenue * 100), 2) if total_revenue else 0,
            })

        # Fallback to parsing order.kds_items if OrderItems are missing but completed orders exist
        if not data:
            orders = get_completed_orders()
            orders = apply_date_filter(orders, request)
            cat_totals = {}
            for order in orders:
                if not order.kds_items:
                    continue
                parts = [pt.strip() for pt in order.kds_items.split(",") if pt.strip()]
                for part in parts:
                    if " x " in part:
                        try:
                            q_str, name = part.split(" x ", 1)
                            qty = int(q_str)
                        except Exception:
                            qty, name = 1, part
                    else:
                        qty, name = 1, part
                    name = name.strip()
                    prod_obj = Product.objects.filter(Q(name__iexact=name) | Q(name__icontains=name)).first()
                    cat_name = prod_obj.category.name if (prod_obj and prod_obj.category) else "Other"
                    if category_param and category_param.lower() not in cat_name.lower():
                        continue
                    price = prod_obj.price if prod_obj else Decimal("0")
                    if price == Decimal("0") and order.total_amount > 0 and len(parts) > 0:
                        price = order.total_amount / Decimal(len(parts))
                    if cat_name not in cat_totals:
                        cat_totals[cat_name] = {"revenue": Decimal("0"), "order_ids": set()}
                    cat_totals[cat_name]["revenue"] += price * qty
                    cat_totals[cat_name]["order_ids"].add(order.id)

            fallback_total_rev = sum(item["revenue"] for item in cat_totals.values())
            for cname, item in sorted(cat_totals.items(), key=lambda x: x[1]["revenue"], reverse=True):
                data.append({
                    "category": cname,
                    "revenue": item["revenue"],
                    "orders": len(item["order_ids"]),
                    "percent_of_revenue": round((item["revenue"] / fallback_total_rev * 100), 2) if fallback_total_rev else 0,
                })

        return Response(data)