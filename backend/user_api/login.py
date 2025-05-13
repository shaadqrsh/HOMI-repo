import uuid

from django.shortcuts import get_object_or_404
from .models import Folder, WebUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.test import APIRequestFactory
from django.contrib.auth.hashers import make_password,check_password
from django.http import JsonResponse
from .email import send_otp
from django.core.cache import cache
import random as rand

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, _username = None, _password = None, *args, **kwargs):
        username = request.data.get('username') if request.data.get('username') else _username
        password = request.data.get('password') if request.data.get('password') else _password

        
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return JsonResponse({
                    'field':'password',
                    'message':'Password entered is incorrect',
            }, status=401 )
        except User.DoesNotExist:
            return JsonResponse({
                'field':'username',
                'message':'Username does not exist',
            }, status=401 )

        
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        
        custom_data = {
            'refresh': str(refresh),
            'access': access,
            'username': user.username,
            'id': str(user.id),
        }

        return Response(custom_data, status=status.HTTP_200_OK)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    try:
        username = request.data["username"]
        email = request.data["email"] 
        users = WebUser.objects.filter()
        for user in users:
            if(username == user.username):
                return JsonResponse({
                    'field':'username',
                    'message':'Username already exists'
                },status=409)
            if(email == user.email):
                return JsonResponse({
                    'field':'email',
                    'message':'Email already exists'
                },status=409)

        otp = str(rand.randint(100000, 999999))
        password = request.data["password"]
        cache.set(email, {"username": username, "password": password, "otp": otp, "signup": True}, timeout=300)
        send_otp(email, otp)

    except Exception as e:
        print(e)
        return Response(status=400)
    else:
        return Response(status=200)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):

    email = request.data.get("email")
    users = WebUser.objects.filter()
    for user in users:
        if email == user.email:
            otp = rand.randint(100000,999999)
            cache.set(email, {"user":user.id,"otp": otp}, timeout=300)
            send_otp(email,otp)
            return JsonResponse({'message':'email sent'},status=200)
    return JsonResponse({'error':'No Email Found'},status=404)

@api_view(['POST'])
def change_email(request):

    email = request.data["email"]
    user_id = request.data["user-id"]

    users = WebUser.objects.filter()
    for user in users:
        if(email == user.email):
                return JsonResponse({
                    'field':'email',
                    'message':'Email already exists'
                },status=409)
        
    otp = str(rand.randint(100000, 999999))
    cache.set(email, {"user":user_id,"otp": otp, "signup": False}, timeout=300)
    send_otp(email,otp)

    return JsonResponse({'message':'OTP send'},status=200)

@api_view(['POST'])
def change_password(request):

    if request.data.get('token'):
        cachedata = cache.get(request.data.get('token'))

        user = get_object_or_404(WebUser, id = cachedata['user'])
        user.set_password(request.data.get('password'))
        user.save()

        return JsonResponse({'message':'changed successfully'},status=200)

    old_pass = request.data["old-password"]
    new_pass = request.data["new-password"]
    user = get_object_or_404(WebUser, id = request.data.get('user-id'))

    if check_password(old_pass, user.password):
        
        user.set_password(new_pass)
        user.save()

        return JsonResponse({'message': 'Password Reset'},status = 200)
    else:
        return JsonResponse({'error':'Incorrect Password'},status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request):

    email = request.GET.get("email")
    otp = request.GET.get("otp")

    block_check = cache.get(f"block_{email}")
    if block_check is not None:
        return JsonResponse({'error':'You have been Blocked'},status=429)

    user_data = cache.get(email)
    attempts_key = f"otp_attempts_{email}"
    attempts = cache.get(attempts_key, 0)

    if user_data is None:
        return JsonResponse({'error':'Expired or Invalid OTP'}, status = 408)

    if str(user_data['otp']) == str(otp):

        if 'signup' not in user_data:

            user_id = user_data['user']
            user = WebUser.objects.get(id = user_id)
            cache.delete(email)
            cache.delete(attempts_key)

            token = uuid.uuid4()

            cache.set(token, {"user":user_id}, timeout=300)

            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)
        
            custom_data = {
            'refresh': str(refresh),
            'access': access,
            'username': user.username,
            'id': str(user.id),
            'token': token,
            }

            return JsonResponse(custom_data,status=200)

        elif user_data['signup']:

            username = user_data["username"]
            password = user_data["password"]

            enc_password = make_password(password)
            id = uuid.uuid4()

            user = WebUser(username = username,password = enc_password,email = email,id=id)
            user.save()
            unsaved_folder = Folder(id=id,name = "Unsaved Chats",user = user)
            unsaved_folder.save()

            cache.delete(email)
            cache.delete(attempts_key)

            token = CustomTokenObtainPairView()
            token_response =  token.post(request=request,_username = username, _password = password)

            return token_response
        
        else:
            user = WebUser.objects.get(id = user_data['user'])
            user.email = email
            user.save()

            cache.delete(email)
            cache.delete(attempts_key)

            refresh = RefreshToken.for_user(user)
            access = str(refresh.access_token)

        
            custom_data = {
            'refresh': str(refresh),
            'access': access,
            'username': user.username,
            'id': str(user.id),
            }

            return JsonResponse(custom_data,status=200)

    else:
        attempts += 1
        cache.set(attempts_key, attempts, timeout=900)

        if attempts >= 5:
            cache.set(f"block_{email}", True, timeout=900)
            return JsonResponse({'error': '🚫 Too many failed attempts. Try again in 15 minutes.'}, status=429)
    return JsonResponse( {'error':'Incorrect OTP Entered'} , status = 401 )


@api_view(['POST'])
def logout_view(request):
    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()  
        return Response({
            'message':"Succesfully Logged Out",
            },status=204)
    except Exception as e:
        print(e)
        return Response(status=400)
    
    