import os
import django

# Ensure Django settings are loaded before anything else
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ChatBotBackend.settings")
django.setup()

from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer

import asyncio
import json
import jwt
from asgiref.sync import sync_to_async
from django.test import RequestFactory
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings

from .chatpages import save_chat
from .views import query_ai  # Ensure this function is working correctly


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        """
        Handles WebSocket connection and authentication.
        """
        query_string = self.scope["query_string"].decode()
        params = dict(x.split("=") for x in query_string.split("&") if "=" in x)

        self.token = params.get("token", None)
        self.user_id = params.get("userid", None)

        #if await self.is_authenticated(self.token, self.user_id):
        await self.accept()
        #else:
           # await self.close()

    async def receive(self, text_data):
        """
        Handles WebSocket messages:
        - Saves user question
        - Fetches AI response
        - Saves AI response
        - Sends responses separately in required format
        """
        data = json.loads(text_data)
        user_id = data.get("user", "")
        chat_id = data.get("chatpage", "")
        message = data.get("message", "")
    
        # Create an asyncio task to process the message separately
        asyncio.create_task(self.process_message(user_id, chat_id, message))
    
    async def process_message(self, user_id, chat_id, message):
        """
        Processes the message and sends responses separately.
        """
        try:
            # Step 1: Save User's Question
            user_question = await self.call_wsgi_function(user_id, chat_id, message, "question")
    
            # Step 2: Send User's Question Response in Required Format
            question_response = {
                "by_user": "question",
                "chat": chat_id,
                "message": message
            }
            await self.send(text_data=json.dumps(question_response))
    
            await asyncio.sleep(0.2)  # Small delay to maintain order
    
            # Step 3: Fetch AI Response
            ai_response = await self.call_wsgi_get_request(query=message, chat_id=chat_id)
    
            # Ensure AI response is a dictionary and extract the "answer" key
            if isinstance(ai_response, dict) and "answer" in ai_response:
                ai_response_text = ai_response["answer"]
            else:
                ai_response_text = "No response from AI"  # Fallback
    
            # Step 4: Save AI's Answer
            wsgi_response = await self.call_wsgi_function(user_id, chat_id, ai_response_text, "answer")  # Saving only
    
            # Step 5: Send AI Response as **Only a String**
            await self.send(text_data=json.dumps(wsgi_response))
    
        except Exception as e:
            # Handle unexpected errors
            await self.send(text_data=json.dumps({"error": str(e)}))


    async def disconnect(self, close_code):
        """
        Handles WebSocket disconnection.
        """
        print(f"WebSocket disconnected with code {close_code}")

    async def is_authenticated(self, token, user):
        """
        Validates JWT authentication.
        """
        if not token or not user:
            return False
        try:
            decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            return decoded == user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return False

    @sync_to_async
    def call_wsgi_get_request(self, query, chat_id):
        """
        Calls the Django API function using a GET request.
        """
        factory = RequestFactory()
        request = factory.get(
            "/api/query/",
            data={"query": query, "chatId": chat_id}
        )
        request.META["HTTP_AUTHORIZATION"] = "Bearer " + self.token
        response = query_ai(request)  # Call Django API function
        return json.loads(response.content)

    @sync_to_async
    def call_wsgi_function(self, user_id, chat_id, message, typ):
        """
        Calls the Django API function using a POST request.
        """
        factory = RequestFactory()
        request = factory.post(
            "/api/chat/save/",
            data=json.dumps({
                "user": user_id,
                "chatpage": chat_id,
                "type": typ,
                "message": message,
            }),
            content_type="application/json",
        )
        request.META["HTTP_AUTHORIZATION"] = "Bearer " + self.token
        response = save_chat(request)  # Call Django API function
        return json.loads(response.content)
