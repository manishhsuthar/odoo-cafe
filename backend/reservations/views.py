from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Reservation
from .serializers import ReservationSerializer


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class ReservationListCreateView(generics.ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by date
        date = self.request.query_params.get("date")
        if date:
            queryset = queryset.filter(reservation_date=date)

        # Filter by status
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by table
        table_id = self.request.query_params.get("table")
        if table_id:
            queryset = queryset.filter(table_id=table_id)

        # Filter by customer
        customer_id = self.request.query_params.get("customer")
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        return queryset.order_by("reservation_date", "reservation_time")


class ReservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAdmin]


class ReservationCheckInView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response({"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status == "completed":
            return Response({"error": "Reservation already completed"}, status=status.HTTP_400_BAD_REQUEST)

        if reservation.status == "cancelled":
            return Response({"error": "Reservation is cancelled"}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = "completed"
        reservation.save()

        return Response(ReservationSerializer(reservation).data)


class ReservationCancelView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            reservation = Reservation.objects.get(pk=pk)
        except Reservation.DoesNotExist:
            return Response({"error": "Reservation not found"}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status == "completed":
            return Response({"error": "Cannot cancel completed reservation"}, status=status.HTTP_400_BAD_REQUEST)

        reservation.status = "cancelled"
        reservation.save()

        return Response(ReservationSerializer(reservation).data)


class UpcomingReservationsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        reservations = Reservation.objects.filter(
            reservation_date__gte=today,
            status__in=["pending", "confirmed"]
        ).order_by("reservation_date", "reservation_time")

        return Response(ReservationSerializer(reservations, many=True).data)