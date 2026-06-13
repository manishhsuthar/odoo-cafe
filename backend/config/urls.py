from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root_view(request):
    return JsonResponse({"status": "online", "message": "Odoo Hackathon API is running!"})


urlpatterns = [
    path("", api_root_view),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("content.urls")),
    path("api/", include("floors.urls")),
    path("api/", include("customers.urls")),
    path("api/", include("promotions.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("payments.urls")),
    path("api/pos/", include("pos.urls")),
    path("api/kds/", include("kds.urls")),
]