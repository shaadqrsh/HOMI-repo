from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import ChatPage, WebUser, Folder

@api_view(['GET'])
def get_folders(request):

    user_id = request.GET.get('user')
    user = get_object_or_404(WebUser, id=user_id)
    
    folders = Folder.objects.filter(user=user)

    folder_data = []
    for folder in folders:

        #subfolders = [{'id': subfolder.id, 'name': subfolder.name} for subfolder in folder.subfolders.all()]
        folder_data.append({
                'id': folder.id,
                'name': folder.name,
                'parentfolderId' : folder.parent_folder.id if folder.parent_folder else 'TOP' ,
                'type': "folder"
                #'subfolders': subfolders
            })

    return JsonResponse(folder_data, status=200,safe=False)

@api_view(['GET'])
def get_files(request):
    user_id = request.GET.get('user')
    user = get_object_or_404(WebUser, id=user_id)
    
    folders = Folder.objects.filter(user=user).prefetch_related('chat_pages')

    chat_pages = []
    for folder in folders:
        chatpages = [chatpages for chatpages in folder.chat_pages.all()]
        for chatpage in chatpages:
            chat_pages.append({
                'id' : chatpage.id,
                'name' : chatpage.name,
                'parentfolderId' : folder.id,
                'type': "file",
                'title' : chatpage.chat_test_title
            })

    return JsonResponse(chat_pages, status=200,safe=False)

@api_view(['POST'])
def create_new_file_or_folder(request):

    file_or_folder = request.data.get('type')
    user = get_object_or_404(WebUser, id = request.data.get('user'))
    parent_folder = get_object_or_404(Folder, id = request.data.get('parentfolderId')) if request.data.get('parentfolderId') else None
    file_name = request.data.get('name')

    if(not verify_user_folder(user,parent_folder)):
        return JsonResponse({},status=418)

    response_data = {}

    if(file_or_folder == "file"):
        file = ChatPage(folder = parent_folder, name = file_name)
        file.save()
        response_data = {
                'id' : file.id,
                'name' : file.name,
                'parentfolderId' : parent_folder.id,
            }
    elif(file_or_folder == "folder"):
        folder = Folder(name = file_name, parent_folder = parent_folder if parent_folder else None, user = user)
        folder.save()
        response_data = {
                'id': folder.id,
                'name': folder.name,
                'parentfolderId' : folder.parent_folder.id if folder.parent_folder else 'TOP' ,
                #'subfolders': None
        }
    else:
        return JsonResponse({
            'message' : 'file or folder type not given'
        }, status = 418)

    return JsonResponse(response_data,status = 200)

@api_view(['DELETE'])
def delete_folder(request):
    try:
        user = get_object_or_404(WebUser, id = request.data.get('user'))
        folder = get_object_or_404(Folder,id = request.data.get('folder'))
        if(verify_user_folder(user,folder)):
            Folder.objects.filter(id = folder.id).delete()
        else:
            return JsonResponse({},status=418)
    except Exception as e:
        return JsonResponse({},status=418)
    else:
        return JsonResponse({
            'message' : 'Successful'
        },status=200)

@api_view(['DELETE'])
def delete_file(request):
    try:
        user = get_object_or_404(WebUser, id = request.data.get('user'))
        file = get_object_or_404(ChatPage,id = request.data.get('file'))
        if(verify_user_folder(user,file = file)):
            ChatPage.objects.filter(id = file.id).delete()
        else:
            return JsonResponse({},status=418)
    except Exception as e:
        return JsonResponse({'message':' Im a try block'},status=403)
    else:
        return JsonResponse({
            'message' : 'Successful'
        },status=200)

@api_view(['PATCH'])
def update_folder(request):
    try:
        user = get_object_or_404(WebUser, id = request.data.get('user'))
        parent_folder = get_object_or_404(Folder, id = request.data.get('parentfolderId')) if request.data.get('parentfolderId') else None
        folder = get_object_or_404(Folder,id = request.data.get('folder'))
        folder_name = request.data.get('name') if request.data.get('name') else folder.name
        if(verify_user_folder(user,folder) and verify_user_folder(user,parent_folder)):
            Folder.objects.filter(id = folder.id).update(parent_folder = parent_folder,name = folder_name)
        else:
            return JsonResponse({},status=418)
    except Exception as e:
        return JsonResponse(status=418)
    else:
        return JsonResponse({
            'message' : 'Successful'
        },status=200)

@api_view(['PATCH'])
def update_file(request):
    try:
        user = get_object_or_404(WebUser, id = request.data.get('user'))
        parent_folder = get_object_or_404(Folder, id = request.data.get('parentfolderId'))
        file = get_object_or_404(ChatPage,id = request.data.get('file'))
        file_name = request.data.get('name') if request.data.get('name') else file.name
        if(verify_user_folder(user,file = file) and verify_user_folder(user,parent_folder)):
            ChatPage.objects.filter(id = file.id).update(folder = parent_folder,name = file_name)
        else:
            return JsonResponse({},status=418)
    except Exception as e:
        return JsonResponse({},status=418)
    else:
        return JsonResponse({
            'message' : 'Successful'
        },status=200)

def verify_user_folder(user,folder = None,file = None):
    if(file):
        folder = file.folder

    if(folder == None):
        return True

    if(folder.user.id == user.id):
        return True
    
    return False