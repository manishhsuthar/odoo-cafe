from django.urls import path
from .views import (
    ReservationListCreateView, ReservationDetailView,
    ReservationCheckInView, ReservationCancelView,
    UpcomingReservationsView
)

urlpatterns = [
    path("", ReservationListCreateView.as_view(), name="reservation_list"),
    path("<int:pk>/", ReservationDetailView.as_view(), name="reservation_detail"),
    path("<int:pk>/check-in/", ReservationCheckInView.as_view(), name="reservation_checkin"),
    path("<int:pk>/cancel/", ReservationCancelView.as_view(), name="reservation_cancel"),
    path("upcoming/", UpcomingReservationsView.as_view(), name="upcoming_reservations"),
]