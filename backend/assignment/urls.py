from django.urls import path
from . import views

urlpatterns=[
    path('getAssignment/',views.get_assignments),
    path('addAssignment/',views.add_assignment),
    path('deleteAssignment/',views.delete_assignment),
    path('editAssignment/',views.edit_assignment),
    path('onSubmittedChange/',views.on_submitChange),
]