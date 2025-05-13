

from django.contrib import admin
from .models import WebUser, Folder, ChatPage, Chat, SubjectAttendance, LectureDates


admin.site.register(WebUser)
admin.site.register(Folder)
admin.site.register(ChatPage)
admin.site.register(Chat)
admin.site.register(SubjectAttendance)
admin.site.register(LectureDates)