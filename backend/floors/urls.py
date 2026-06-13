from django.urls import path
from .views import FloorListCreateView, FloorDetailView, TableListCreateView, TableDetailView

urlpatterns = [
    path("floors/", FloorListCreateView.as_view(), name="floor_list"),
    path("floors/<int:pk>/", FloorDetailView.as_view(), name="floor_detail"),
    path("tables/", TableListCreateView.as_view(), name="table_list"),
    path("tables/<int:pk>/", TableDetailView.as_view(), name="table_detail"),
]