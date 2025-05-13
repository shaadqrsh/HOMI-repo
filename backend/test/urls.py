from django.urls import path
from . import views

urlpatterns=[
    path('testtopic/', views.get_topics_chat),
    path('generate/', views.generate_questions),
    path('getquestions/', views.get_questions),
    path('gettests/', views.get_tests),
    path('savetest/',views.save_test),
    path('gettest/',views.get_test),
    path('getflash/',views.gen_res_flashcard),
    path('saveflash/',views.update_flashcard),
    path('deleteflash/',views.delete_flashcard),
]