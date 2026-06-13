from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date, time, timedelta
from django.utils import timezone

from customers.models import Customer
from floors.models import Floor, Table
from reservations.models import Reservation

User = get_user_model()


class ReservationFeatureTests(APITestCase):
    def setUp(self):
        # Create Floor
        self.floor = Floor.objects.create(name="Ground Floor", description="Main dining hall")

        # Create Tables
        self.table1 = Table.objects.create(
            floor=self.floor,
            name="T1",
            number="1",
            capacity=4,
            status=Table.Status.FREE
        )
        self.table2 = Table.objects.create(
            floor=self.floor,
            name="T2",
            number="2",
            capacity=6,
            status=Table.Status.FREE
        )

        # Create Customers
        self.customer1 = Customer.objects.create(
            name="John Doe",
            email="john@example.com",
            phone="1234567890"
        )
        self.customer2 = Customer.objects.create(
            name="Jane Smith",
            email="jane@example.com",
            phone="0987654321"
        )

        # Create Users with roles
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpassword",
            full_name="Admin User",
            role="admin"
        )
        self.cashier_user = User.objects.create_user(
            email="cashier@example.com",
            password="cashierpassword",
            full_name="Cashier User",
            role="cashier"
        )

        # URLs
        self.list_create_url = reverse("reservation_list")
        self.upcoming_url = reverse("upcoming_reservations")

    def get_detail_url(self, pk):
        return reverse("reservation_detail", kwargs={"pk": pk})

    def get_checkin_url(self, pk):
        return reverse("reservation_checkin", kwargs={"pk": pk})

    def get_cancel_url(self, pk):
        return reverse("reservation_cancel", kwargs={"pk": pk})

    def test_anonymous_access_denied(self):
        """Verify that anonymous users are blocked from accessing reservation endpoints."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_admin_access_denied(self):
        """Verify that non-admin (e.g. cashier) users are blocked from accessing reservation endpoints."""
        self.client.force_authenticate(user=self.cashier_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_access_granted(self):
        """Verify that admin users can list reservations."""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_reservation_success(self):
        """Test successful reservation creation by an admin."""
        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "customer": self.customer1.id,
            "table": self.table1.id,
            "reservation_date": "2026-06-20",
            "reservation_time": "19:00:00",
            "party_size": 4,
            "notes": "Window seat preferred"
        }
        response = self.client.post(self.list_create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Reservation.objects.count(), 1)
        
        reservation = Reservation.objects.first()
        self.assertEqual(reservation.customer, self.customer1)
        self.assertEqual(reservation.table, self.table1)
        self.assertEqual(reservation.party_size, 4)
        self.assertEqual(reservation.status, Reservation.Status.PENDING)

        # Check serialized fields
        self.assertEqual(response.data["customer_name"], self.customer1.name)
        self.assertEqual(response.data["customer_phone"], self.customer1.phone)
        self.assertEqual(response.data["table_number"], self.table1.number)
        self.assertEqual(response.data["floor_name"], self.floor.name)

    def test_create_reservation_duplicate_fails(self):
        """Test that unique_together constraint prevents double booking a table at the exact same date & time."""
        # Create an initial reservation
        Reservation.objects.create(
            customer=self.customer1,
            table=self.table1,
            reservation_date=date(2026, 6, 20),
            reservation_time=time(19, 0),
            party_size=4,
            status=Reservation.Status.CONFIRMED
        )

        self.client.force_authenticate(user=self.admin_user)
        payload = {
            "customer": self.customer2.id,
            "table": self.table1.id,
            "reservation_date": "2026-06-20",
            "reservation_time": "19:00:00",
            "party_size": 2
        }
        response = self.client.post(self.list_create_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("non_field_errors", response.data)

    def test_filter_reservations(self):
        """Test listing reservations with various filter combinations."""
        r1 = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=date(2026, 6, 20), reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.CONFIRMED
        )
        r2 = Reservation.objects.create(
            customer=self.customer2, table=self.table2,
            reservation_date=date(2026, 6, 21), reservation_time=time(20, 0),
            party_size=2, status=Reservation.Status.PENDING
        )

        self.client.force_authenticate(user=self.admin_user)

        # Filter by date
        response = self.client.get(self.list_create_url, {"date": "2026-06-20"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], r1.id)

        # Filter by status
        response = self.client.get(self.list_create_url, {"status": "pending"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], r2.id)

        # Filter by table
        response = self.client.get(self.list_create_url, {"table": self.table1.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], r1.id)

        # Filter by customer
        response = self.client.get(self.list_create_url, {"customer": self.customer2.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], r2.id)

    def test_reservation_details_and_update(self):
        """Test retrieving, updating, and deleting a specific reservation."""
        reservation = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=date(2026, 6, 20), reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.CONFIRMED
        )

        self.client.force_authenticate(user=self.admin_user)
        detail_url = self.get_detail_url(reservation.id)

        # Retrieve
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["notes"], "")

        # Update notes
        payload = {"notes": "Allergic to nuts"}
        response = self.client.patch(detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        reservation.refresh_from_db()
        self.assertEqual(reservation.notes, "Allergic to nuts")

        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Reservation.objects.count(), 0)

    def test_check_in_reservation(self):
        """Test the custom check-in endpoint flow."""
        reservation = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=date(2026, 6, 20), reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.CONFIRMED
        )

        self.client.force_authenticate(user=self.admin_user)
        checkin_url = self.get_checkin_url(reservation.id)

        # Check-in
        response = self.client.post(checkin_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completed")
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, Reservation.Status.COMPLETED)

        # Check-in again should fail
        response = self.client.post(checkin_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Reservation already completed")

    def test_check_in_cancelled_reservation_fails(self):
        """Test that you cannot check in a cancelled reservation."""
        reservation = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=date(2026, 6, 20), reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.CANCELLED
        )

        self.client.force_authenticate(user=self.admin_user)
        checkin_url = self.get_checkin_url(reservation.id)

        response = self.client.post(checkin_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Reservation is cancelled")

    def test_cancel_reservation(self):
        """Test the custom cancel endpoint flow."""
        reservation = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=date(2026, 6, 20), reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.PENDING
        )

        self.client.force_authenticate(user=self.admin_user)
        cancel_url = self.get_cancel_url(reservation.id)

        # Cancel
        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelled")
        reservation.refresh_from_db()
        self.assertEqual(reservation.status, Reservation.Status.CANCELLED)

        # Cancel a completed reservation should fail
        reservation.status = Reservation.Status.COMPLETED
        reservation.save()

        response = self.client.post(cancel_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["error"], "Cannot cancel completed reservation")

    def test_upcoming_reservations(self):
        """Test filtering and ordering of upcoming reservations."""
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        yesterday = today - timedelta(days=1)

        # Past reservation (should NOT show up)
        Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=yesterday, reservation_time=time(19, 0),
            party_size=4, status=Reservation.Status.CONFIRMED
        )

        # Completed reservation today (should NOT show up)
        Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=today, reservation_time=time(12, 0),
            party_size=4, status=Reservation.Status.COMPLETED
        )

        # Cancelled reservation tomorrow (should NOT show up)
        Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=tomorrow, reservation_time=time(12, 0),
            party_size=4, status=Reservation.Status.CANCELLED
        )

        # Pending reservation today (SHOULD show up)
        r_today = Reservation.objects.create(
            customer=self.customer1, table=self.table1,
            reservation_date=today, reservation_time=time(18, 0),
            party_size=4, status=Reservation.Status.PENDING
        )

        # Confirmed reservation tomorrow (SHOULD show up)
        r_tomorrow = Reservation.objects.create(
            customer=self.customer2, table=self.table2,
            reservation_date=tomorrow, reservation_time=time(13, 0),
            party_size=6, status=Reservation.Status.CONFIRMED
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.upcoming_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        # Should be ordered chronologically: today, then tomorrow
        self.assertEqual(response.data[0]["id"], r_today.id)
        self.assertEqual(response.data[1]["id"], r_tomorrow.id)
