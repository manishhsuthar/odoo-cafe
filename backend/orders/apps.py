from django.apps import AppConfig


class OrdersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "orders"

    def ready(self):
        from django.core.management import call_command
        try:
            call_command("migrate", "orders", interactive=False)
        except Exception as e:
            print(f"Failed to dynamically run migrations: {e}")
