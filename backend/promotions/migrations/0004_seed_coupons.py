# Generated manually

from django.db import migrations
from datetime import date

def seed_coupons(apps, schema_editor):
    Coupon = apps.get_model('promotions', 'Coupon')
    Coupon.objects.get_or_create(
        code="NEW20",
        defaults={
            "name": "Welcome Offer",
            "type": "Coupon",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_amount": 100,
            "target_type": "all",
            "is_active": True,
            "expiry_date": date(2027, 12, 31)
        }
    )
    Coupon.objects.get_or_create(
        code="FEST50",
        defaults={
            "name": "Festive Special",
            "type": "Coupon",
            "discount_type": "flat",
            "discount_value": 50,
            "min_order_amount": 500,
            "target_type": "all",
            "is_active": True,
            "expiry_date": date(2027, 12, 31)
        }
    )
    Coupon.objects.get_or_create(
        code="SUMMER20",
        defaults={
            "name": "Summer Sale",
            "type": "Coupon",
            "discount_type": "percentage",
            "discount_value": 20,
            "min_order_amount": 100,
            "target_type": "all",
            "is_active": True,
            "expiry_date": date(2027, 12, 31)
        }
    )
    Coupon.objects.get_or_create(
        code="AUTO10",
        defaults={
            "name": "Weekend Bonanza",
            "type": "Automated Promo",
            "discount_type": "percentage",
            "discount_value": 10,
            "min_order_amount": 250,
            "target_type": "all",
            "is_active": True,
            "expiry_date": date(2027, 12, 31)
        }
    )
    Coupon.objects.get_or_create(
        code="FOOD15",
        defaults={
            "name": "Foodie Discount",
            "type": "Coupon",
            "discount_type": "percentage",
            "discount_value": 15,
            "min_order_amount": 150,
            "target_type": "category",
            "target_value": "Food",
            "is_active": True,
            "expiry_date": date(2027, 12, 31)
        }
    )

def rollback_coupons(apps, schema_editor):
    Coupon = apps.get_model('promotions', 'Coupon')
    Coupon.objects.filter(code__in=["NEW20", "FEST50", "SUMMER20", "AUTO10", "FOOD15"]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('promotions', '0003_alter_coupon_expiry_date'),
    ]

    operations = [
        migrations.RunPython(seed_coupons, rollback_coupons),
    ]
