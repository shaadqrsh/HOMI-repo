from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser
import uuid

class WebUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    is_verified = models.BooleanField(default=False)
    target = models.IntegerField(default=75)

    def __str__(self):
        return self.username
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def get_target_attendance(self):
        return str(self.target)


class Folder(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    name = models.CharField(max_length=255)
    parent_folder = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subfolders')
    user = models.ForeignKey(WebUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.name


class ChatPage(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='chat_pages')
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    chat_test_title = models.CharField(max_length=255, null=True)
    # chat_summary = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Chat(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    chat_page = models.ForeignKey(ChatPage, on_delete=models.CASCADE, related_name='chats')
    by_user = models.BooleanField()
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{'User' if self.by_user else 'System'}: {self.message[:30]}"


class SubjectAttendance(models.Model):
    subject_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255)
    attended = models.IntegerField()
    total = models.IntegerField()
    user = models.ForeignKey(WebUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.subject


class LectureDates(models.Model):
    subject = models.ForeignKey(SubjectAttendance, on_delete=models.CASCADE, default=uuid.UUID('1ec09e74-f8c5-4cfe-ba5f-383a28b258da'))
    dates_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lecture_date = models.DateField()
    present = models.BooleanField()
    user = models.ForeignKey(WebUser, on_delete=models.CASCADE, default=uuid.UUID('91be538e-d11b-4534-ada4-2d1ac0e49658'))

    def __str__(self):
        return str(self.subject)