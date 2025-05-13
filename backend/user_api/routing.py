from django.urls import re_path,path
from .chatsocket import ChatConsumer

websocket_urlpatterns = [
    path("ws/chat/", ChatConsumer.as_asgi()),
]
