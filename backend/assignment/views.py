from django.shortcuts import render,get_object_or_404
from django.http import JsonResponse
from django.db import models
import uuid
from datetime import date
from rest_framework.decorators import api_view
from datetime import datetime

from .models import Assignments
from user_api.models import WebUser

def frontend_date(original_date):  
    if(original_date):
      date_obj = datetime.strptime(str(original_date), "%Y-%m-%d")
      new_date_format = date_obj.strftime("%d-%m-%Y")
      return new_date_format
    return None

def database_date(original_date):
    if(original_date):
      date_obj = datetime.strptime(original_date, "%d-%m-%Y")
      new_date_format = date_obj.strftime("%Y-%m-%d")
      return new_date_format
    return None

def sort_assignment_by_date(tasks):
    return sorted(tasks, key=lambda x: datetime.strptime(str(x.due_date), "%Y-%m-%d")if x.due_date else datetime.max)

def get_assignments(request):
    user_id = request.GET.get('user')

    if not user_id:
        return JsonResponse({'error': 'User ID is required.'},status = 400)
    
    user = get_object_or_404(WebUser,id=user_id)
    
    assignments = Assignments.objects.filter(user=user)
    assignments = sort_assignment_by_date(assignments)

    assignment_data = []
    for assignment in assignments:
        assignment_data.append(
            {
                'id': str(assignment.assignment_id),
                'subject': assignment.subject,
                'total_marks': assignment.total_marks,
                'due_date':frontend_date(assignment.due_date),
                'note':assignment.note,
                'submitted':assignment.submitted,
            }
        )
    return JsonResponse(assignment_data, safe=False)


@api_view(['POST'])
def add_assignment(request):
    subject = request.data.get('subject')
    total_marks = int(request.data.get('total_marks'))
    due_date = database_date(request.data.get('due_date'))
    note = request.data.get('note')
    submitted = request.data.get('submitted')
    user_id = request.data.get('user')

    subject = str(subject).title()

    user = get_object_or_404(WebUser,id=user_id)
    assignments = Assignments.objects.filter(user=user)
    
    for a in assignments:
        if a.subject.lower() == subject.lower():
            return JsonResponse({'Error':'Assignment already exists!'}, status = 409, safe=False)
    
    new_assignment = Assignments.objects.create(
        user = user,
        subject = subject,
        total_marks = total_marks,
        due_date = due_date,
        note = note,
        submitted = submitted
    )
    new_assignment.save()
    assignment_data = []
    assignment_data.append(
        {
            'id': str(new_assignment.assignment_id),
            'subject': new_assignment.subject,
            'total_marks': new_assignment.total_marks,
            'due_date': frontend_date(new_assignment.due_date),
            'note': new_assignment.note,
            'submitted': new_assignment.submitted,            
        }
    )
    return JsonResponse(assignment_data, safe=False)


@api_view(['DELETE'])
def delete_assignment(request):
    assignment_id = request.data.get('assignment_id')
    user_id = request.data.get('user')

    uuid_assignment_id = uuid.UUID(assignment_id)
    response = {}

    assignments = Assignments.objects.filter(user=user_id)
    assignments = sort_assignment_by_date(assignments)
    for a in assignments:
        if(a.assignment_id == uuid_assignment_id):
            response = {
                'id': str(a.assignment_id),
                'subject': a.subject,
                'total_marks': a.total_marks,
                'due_date': frontend_date(a.due_date),
                'note': a.note,
                'submitted': a.submitted, 
            }
            a.delete()

    return JsonResponse(response, safe=False)


@api_view(['PATCH']) 
def edit_assignment(request):
    total_marks = request.data.get('total_marks')
    due_date = database_date(request.data.get('due_date'))
    note = request.data.get('note')
    assignment_id = request.data.get('assignment_id')
    user_id = request.data.get('user')

    uuid_assignment_id = uuid.UUID(assignment_id)
    response = {}

    assignments = Assignments.objects.filter(user=user_id)
    assignments = sort_assignment_by_date(assignments)
    for a in assignments:
        if(a.assignment_id == uuid_assignment_id):
            a.total_marks = total_marks
            a.due_date = due_date
            a.note = note
            response = {
                'id': str(a.assignment_id),
                'subject': a.subject,
                'total_marks': a.total_marks,
                'due_date': frontend_date(a.due_date),
                'note': a.note,
                'submitted': a.submitted, 
            }
            a.save()

    return JsonResponse(response, safe=False)


@api_view(['PUT']) 
def on_submitChange(request):
    assignment_id = request.data.get('assignment_id')
    submitted = bool(request.data.get('submitted'))
    user_id = request.data.get('user')

    uuid_assignment_id = uuid.UUID(assignment_id)
    response = {}

    assignments = Assignments.objects.filter(user=user_id)
    assignments = sort_assignment_by_date(assignments)
    for a in assignments:
        if(a.assignment_id == uuid_assignment_id):
            a.submitted = submitted
            response = {
                'id': str(a.assignment_id),
                'subject': a.subject,
                'total_marks': a.total_marks,
                'due_date': frontend_date(a.due_date),
                'note': a.note,
                'submitted': a.submitted, 
            }
            a.save()

    return JsonResponse(response, safe=False)