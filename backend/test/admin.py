from django.contrib import admin
from .models import Questions,Test,TestResponse

admin.site.register(Questions),
admin.site.register(Test),
admin.site.register(TestResponse)