# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="kds_items",
            field=models.TextField(blank=True, default=""),
        ),
    ]
