from django.urls import path

from .chatpages import get_chats, save_chat

from .views import user_details, get_chatpage, get_folders_and_chatpages, query_ai, get_user_attendance, get_user_target_attendance, get_subject_dates, increment_attendance, decrement_attendance, add_subject_attendance, delete_subject, target_set, edit_subject

from .login import CustomTokenObtainPairView, change_email, change_password, forgot_password, logout_view, register_user,verify_email
from .folders_files import create_new_file_or_folder, delete_file, delete_folder, get_folders, get_files, update_file, update_folder

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)


urlpatterns = [
    #path('folders/', get_folders_and_chatpages, name='get_folders_and_chatpages'),
    path('chat/',get_chats,name='get_chatpage'),
    path('details/',user_details,name='user_details'),
    path('query/',query_ai,name='query_ai'),
    path('attendance/', get_user_attendance, name='get_user_attendance'),
    path('targetattendance/',get_user_target_attendance, name='get_user_target_attendance'),
    path('targetset',target_set, name='target_set'),
    path('getsubjectdates/',get_subject_dates, name='get_subject_dates'),
    path('incrementattendance/',increment_attendance, name='increment_attendance'),
    path('decrementattendance/',decrement_attendance, name='decrement_attendance'),
    path('addsubjectattendance/',add_subject_attendance, name='add_subject_attendance'),
    path('editsubject/',edit_subject, name='edit_subject'),
    path('deletesubject/',delete_subject, name='delete_subject'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/',logout_view,name='logout_view'),
    path('register/',register_user,name='register_user'),
    path('forgotpassword/',forgot_password,name='forgot_password'),
    path('changepass/',change_password,name='change_password'),
    path('changemail/',change_email,name='change_email'),
    path('verify/',verify_email,name='verify_email'),
    path('folders/',get_folders,name='get_folders'),
    path('files/',get_files,name='get_files'),
    path('new/folder/',create_new_file_or_folder,name='file_or_folder'),
    path('update/fnf/folder/',update_folder,name='update_folder'),
    path('update/fnf/file/',update_file,name='update_file'),
    path('delete/fnf/folder/',delete_folder,name='delete_folder'),
    path('delete/fnf/file/',delete_file,name='delete_file'),
    path('chat/save/',save_chat,name='save_chat'),

]
