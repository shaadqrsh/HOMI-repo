from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db import models
from rest_framework.decorators import api_view
import uuid
from query import run_query

from .models import WebUser, Folder, ChatPage, SubjectAttendance, LectureDates

from datetime import date

@api_view(['GET'])
def user_details(request):
    user = get_object_or_404(WebUser,id = request.GET.get('user-id'))

    return JsonResponse({
        'username' : user.username,
        'email' : user.email
    },status = 200)

@api_view(['GET'])
def query_ai(request):
    query = request.GET.get('query')
    chat_id = request.GET.get('chatId')
    answer = run_query("chat", query=query, chat_id=chat_id)
    return JsonResponse({
        'answer': answer
    }, status=200)

def get_folders_and_chatpages(request):
    user_id = request.GET.get('user')
    user = get_object_or_404(WebUser, id=user_id)
    folders = Folder.objects.filter(user=user).prefetch_related('chat_pages')
    folder_data = []
    for folder in folders:
        chat_pages = [{'id': chat_page.id, 'name': chat_page.name} for chat_page in folder.chat_pages.all()]
        folder_data.append({
            'id': folder.id,
            'name': folder.name,
            'chat_pages': chat_pages
        })
    return JsonResponse(folder_data, safe=False)


def get_chatpage(request):
    user_id = request.GET.get('user')
    chatpage_id = request.GET.get('chatpage')
    if not user_id or not chatpage_id:
        return JsonResponse({'error': 'User ID and ChatPage ID are required.'}, status=400)
    user = get_object_or_404(WebUser, id=user_id)
    chat_page = get_object_or_404(ChatPage, id=chatpage_id)
    if chat_page.folder.user != user:
        return JsonResponse({'error': 'Access denied: You do not own this chat page.'}, status=403)
    response_data = {
        'chatpage_id': chat_page.id,
        'chatpage_name': chat_page.name,
        'folder_id': chat_page.folder.id,
        'folder_name': chat_page.folder.name,
        'messages': [
            {
                'chat_id': chat.id,
                'by_user': chat.by_user,
                'message': chat.message,
                'sent_at': chat.sent_at
            }
            for chat in chat_page.chats.all()
        ]
    }

    return JsonResponse(response_data, safe=False)#

def get_user_attendance(request):
    user_id = request.GET.get('user')

    if not user_id:
        return JsonResponse({'error': 'User ID is required.'},status = 400)
    
    user = get_object_or_404(WebUser, id=user_id)
    
    attendance = SubjectAttendance.objects.filter(user=user)

    attendance_data = []
    for lectures in attendance:
        attendance_data.append(
            {
                'id': str(lectures.subject_id),
                'subject': lectures.subject,
                'attended': lectures.attended,
                'total': lectures.total
            }
        )

    return JsonResponse(attendance_data, safe=False)


def get_subject_dates(request):
    user_id = request.GET.get('user')
    subject_id = request.GET.get('subject')
    user = get_object_or_404(WebUser, id=user_id)
    subject = get_object_or_404(SubjectAttendance, user=user, subject_id=subject_id)
    dates = LectureDates.objects.filter(subject=subject,user=user)
    response_data = []
    for d in dates:
        response_data.append(
            {
            'id': d.dates_id,
            'date': d.lecture_date,
            'present': d.present
            }
        )
    
    return JsonResponse(response_data, safe=False)


def get_user_target_attendance(request):
    user = request.GET.get('user')
    user_id = get_object_or_404(WebUser, id = user)
    target = user_id.target
    response = {}
    response = {
        'target': target
    }
    
    return JsonResponse(response,safe=False)
                        

@api_view(['PATCH'])
def increment_attendance(request):
    user_id = request.data.get('user')
    subject_id = request.data.get('subject_id')
    uuid_subject_id = uuid.UUID(subject_id)

    user = get_object_or_404(WebUser, id = user_id)

    subject = get_object_or_404(SubjectAttendance, user=user, subject_id=uuid_subject_id)
    attendance = SubjectAttendance.objects.filter(user=user_id)

    present_date = date.today()
    
    new_date = LectureDates.objects.create(subject=subject, lecture_date=present_date, present=True, user=user)
    new_date.save()
    
    for a in attendance:
        if (a.subject_id == uuid_subject_id):
            a.attended += 1
            a.total += 1
            response_data = {
                'id': a.subject_id,
                'subject': a.subject,
                'attended': a.attended,
                'total': a.total
                }
            a.save()
            
    return JsonResponse(response_data, safe=False)


@api_view(['PATCH'])   
def decrement_attendance(request):
    user_id = request.data.get('user')
    subject_id = request.data.get('subject_id')
    
    user = get_object_or_404(WebUser, id = user_id)
    uuid_subject_id = uuid.UUID(subject_id)
    subject = get_object_or_404(SubjectAttendance, user=user, subject_id=uuid_subject_id)
    
    present_date = date.today()
    
    new_date = LectureDates.objects.create(subject=subject, lecture_date=present_date, present=False, user=user)
    new_date.save()

    attendance = SubjectAttendance.objects.filter(user=user_id)
    for a in attendance:
        if (a.subject_id == uuid_subject_id):
            a.total += 1
            response_data = {
                'id': a.subject_id,
                'subject': a.subject,
                'attended': a.attended,
                'total': a.total
                }
            a.save()

    return JsonResponse(response_data, safe=False)


@api_view(['POST'])
def add_subject_attendance(request):
    subject = request.data.get('subject')
    attended = request.data.get('attended')
    total = request.data.get('total')
    user_id = request.data.get('user')
    
    subject = str(subject).title()

    user = get_object_or_404(WebUser, id = user_id)
    attendance = SubjectAttendance.objects.filter(user=user_id)
    for a in attendance:
        if(subject == a.subject):
            return JsonResponse({'Error':'Subject name already exists!'}, status = 409, safe=False)
                    
    new_subject = SubjectAttendance.objects.create(subject=subject, attended=attended, total=total, user=user)
    new_subject.save()

    attendance_data = []
    attendance_data.append(
        {
            'id': new_subject.subject_id,
            'subject': new_subject.subject,
            'attended': new_subject.attended,
            'total': new_subject.total
        }
    )

    return JsonResponse(attendance_data, safe=False)


@api_view(['DELETE'])
def delete_subject(request):
    subject_id = request.data.get('subject_id')
    user_id = request.data.get('user')

    uuid_subject_id = uuid.UUID(subject_id)
    response = {}

    subject = SubjectAttendance.objects.filter(user=user_id)
    for s in subject:
        if(s.subject_id == uuid_subject_id):
            response = {
                'id': s.subject_id,
                'subject': s.subject,
                'attended': s.attended,
                'total': s.total
            }
            s.delete()

    return JsonResponse(response, safe=False)

@api_view(['PUT'])
def target_set(request):
    target = request.data.get('target')
    user_id = request.data.get('user')
    user = get_object_or_404(WebUser, id = user_id)
    user.target = target
    user.save()
    return JsonResponse("Successfull", safe=False)
  
  
@api_view(['PUT'])
def edit_subject(request):
    subject_id = request.data.get('subject_id')
    subject = request.data.get('subject')
    attended = request.data.get('attended')
    total = request.data.get('total')
    user = request.data.get('user')
    user_id = get_object_or_404(WebUser, id = user)
    subject = str(subject).title()
    uuid_subject_id = uuid.UUID(subject_id)
    response_data = {}
    attendance = SubjectAttendance.objects.filter(user=user_id)
    for a in attendance:
        if (a.subject_id == uuid_subject_id):
            a.subject = subject
            a.attended = attended
            a.total = total
                
            response_data = {
                'id': a.subject_id,
                'subject': a.subject,
                'attended': a.attended,
                'total': a.total
                }
            a.save()
            
    return JsonResponse(response_data, safe=False)
