from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

# A tiny function to return a success message
def api_root_view(request):
    return JsonResponse({"status": "online", "message": "Odoo Hackathon API is running!"})

urlpatterns = [
    path("", api_root_view), # Now '/' will return a JSON success message
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("content.urls")),
    path("api/", include("floors.urls")),
    path("api/", include("customers.urls")),
    path("api/", include("promotions.urls")),
]