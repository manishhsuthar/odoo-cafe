from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def deduct_inventory(order_item, performed_by=None):
    try:
        inventory = order_item.product.inventory
    except Exception:
        return  # No inventory tracked for this product

    if inventory.quantity <= 0:
        return

    quantity_before = inventory.quantity
    inventory.quantity = max(inventory.quantity - order_item.quantity, 0)
    inventory.save()

    from .models import InventoryLog
    InventoryLog.objects.create(
        inventory_item=inventory,
        action="deduction",
        quantity_changed=-order_item.quantity,
        quantity_before=quantity_before,
        quantity_after=inventory.quantity,
        note=f"Auto deducted when chef started preparing Order #{order_item.order.id}",
        performed_by=performed_by
    )

    channel_layer = get_channel_layer()

    if inventory.is_out_of_stock():
        inventory.product.is_available = False
        inventory.product.save()
        async_to_sync(channel_layer.group_send)(
            "admin_alerts",
            {
                "type": "inventory_alert",
                "data": {
                    "type": "OUT_OF_STOCK",
                    "product": inventory.product.name,
                    "quantity": inventory.quantity,
                    "message": f"❌ Out of Stock: {inventory.product.name}"
                }
            }
        )
    elif inventory.is_low_stock():
        async_to_sync(channel_layer.group_send)(
            "admin_alerts",
            {
                "type": "inventory_alert",
                "data": {
                    "type": "LOW_STOCK",
                    "product": inventory.product.name,
                    "quantity": inventory.quantity,
                    "message": f"⚠️ Low Stock: {inventory.product.name} — {inventory.quantity} remaining"
                }
            }
        )