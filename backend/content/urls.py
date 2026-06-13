from django.urls import path
from .views import (
    CategoryListCreateView, CategoryDetailView,
    ProductListCreateView, ProductDetailView
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="category_list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="category_detail"),
    path("products/", ProductListCreateView.as_view(), name="product_list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product_detail"),
]