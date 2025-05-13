from django.db import models
import uuid
from user_api.models import WebUser

class Assignments(models.Model):
    user = models.ForeignKey(WebUser, on_delete=models.CASCADE)
    assignment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255)
    total_marks = models.IntegerField(null=True,blank=True)
    due_date = models.DateField(null=True,blank=True)
    note = models.TextField(null=True,blank=True)
    submitted = models.BooleanField(default=False)

