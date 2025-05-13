import uuid
from django.http import JsonResponse
from .models import Chat, ChatPage, WebUser
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from query import run_query

def get_chats(request):

    user = get_object_or_404(WebUser,id = request.GET.get('user'))
    chatpage = get_object_or_404(ChatPage,id = request.GET.get('chat'))

    if(not verify_user_file(user,chatpage)):
        return JsonResponse({},status=403)
    
    chats = Chat.objects.filter(chat_page = chatpage)

    chat_response = []

    for chat in chats:
        chat_response.append({
            'message' : chat.message, 
            'by_user' : 'question' if chat.by_user else 'answer',
            'chat' : chat.id,
            'time_stamp' : chat.sent_at,
        })
    return JsonResponse(
        chat_response
        ,status=200,safe=False)

@api_view(['POST'])
def save_chat(request):
    user = get_object_or_404(WebUser, id = request.data.get('user'))
    chatpage = get_object_or_404(ChatPage, id = request.data.get('chatpage'))
    websock = request.data.get('ws') if request.data.get('ws') else None
    qna = request.data.get('type')

    if(not verify_user_file(user,chatpage)):
        return JsonResponse({},status=403)
    
    chat = Chat(
                id = uuid.uuid4(),
                message = request.data.get('message'), 
                by_user = True if qna == 'question' else False,
                chat_page = chatpage
                )

    chat.save()
    if not qna == 'question':
        chat_summ = run_query("extract_topic", chat_id=request.data.get('chatpage'))
        chatpage.chat_test_title = chat_summ.strip()
        chatpage.save()
    return JsonResponse(
        {
            "chat":chat.id,
            "message" : request.data.get('message'),
            "by_user" : qna,
            "time_stamp" : chat.sent_at,
        }, status=200
    )

def verify_user_file(user,file):
    if(user.id == file.folder.user.id):
        return True
    
    return False