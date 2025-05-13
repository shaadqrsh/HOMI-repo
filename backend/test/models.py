from django.db import models
from user_api.models import WebUser
import uuid
from datetime import date

class DifficultyLevel(models.TextChoices):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionState(models.TextChoices):
    MASTERED = "mastered"
    LEARNING = "learning"
    REVIEW = "review"


class Test(models.Model):
    test_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255)
    user_id = models.ForeignKey(WebUser, on_delete=models.CASCADE)
    score = models.IntegerField()
    date = models.DateField(default=date.today)

    def __str__(self):
        return f"Test {self.test_id} - {self.subject}"
    
class Questions(models.Model):
    question_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test_id = models.ForeignKey(Test, on_delete=models.CASCADE)
    question = models.CharField(max_length=255)
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_ans = models.CharField(max_length=255)

    def __str__(self):
        return self.question

class TestResponse(models.Model):
    response_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    question = models.ForeignKey(Questions, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=255,null=True)
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(null=True)

    def __str__(self):
        return f"Response {self.response_id} for Test {self.test.test_id}"
    
class FlashCard(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    subject = models.CharField(max_length=255,null=False)
    user_id = models.ForeignKey(WebUser,on_delete=models.CASCADE)
    difficulty = models.CharField(choices=DifficultyLevel.choices, default=DifficultyLevel.EASY)


class FlashcardQuestions(models.Model):
    question_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flashcard_id = models.ForeignKey(FlashCard, on_delete=models.CASCADE)
    question = models.CharField(max_length=255)
    answer = models.CharField(max_length=1023)
    state = models.CharField(choices=QuestionState.choices, default=QuestionState.LEARNING)
    
    def __str__(self):
        return self.question
    