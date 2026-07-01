# Generated manually

from django.db import migrations

def seed_floors(apps, schema_editor):
    Floor = apps.get_model('floors', 'Floor')
    Floor.objects.get_or_create(name="First Floor", defaults={"description": "Main floor"})
    Floor.objects.get_or_create(name="Second Floor", defaults={"description": "Rooftop/Second level"})

def rollback_floors(apps, schema_editor):
    Floor = apps.get_model('floors', 'Floor')
    Floor.objects.filter(name__in=["First Floor", "Second Floor"]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('floors', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_floors, rollback_floors),
    ]
