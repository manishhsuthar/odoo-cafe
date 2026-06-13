from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root_view(request):
    return JsonResponse({"status": "online", "message": "Odoo Hackathon API is running!"})

urlpatterns = [
    path("", api_root_view),
    path("admin/", admin.site.urls),
    path("auth/", include("accounts.urls")),
    path("", include("content.urls")),
    path("", include("floors.urls")),
    path("", include("customers.urls")),
    path("", include("promotions.urls")),
    path("", include("orders.urls")),
    path("", include("payments.urls")),
]
