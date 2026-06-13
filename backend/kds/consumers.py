import json
from channels.generic.websocket import AsyncWebsocketConsumer


class KDSConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "kds"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def kds_update(self, event):
        await self.send(text_data=json.dumps(event["data"]))


class CashierConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "cashier"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def order_ready(self, event):
        await self.send(text_data=json.dumps(event["data"]))