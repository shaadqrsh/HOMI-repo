from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .models import DifficultyLevel, FlashCard, FlashcardQuestions, Questions,Test,TestResponse
from user_api.models import WebUser
from django.http import JsonResponse
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny
from query import clean_question_repsonse, run_query, give_explanation
import uuid
import regex as re


@api_view(['GET'])
@permission_classes([AllowAny])
def get_topics_chat(request):
    chat_id = request.GET.get('chatId')
    raw_questions = run_query("list_topics", chat_id = chat_id)
    clean_questions = raw_questions[:-1]
    
    questions_array = [match.strip() for match in re.findall(r'\{(.*?)\}', clean_questions)]

    return Response( questions_array , status = 200)

@api_view(['POST'])
def generate_questions(request):
    subject = request.data.get('topic')
    user_id = request.data.get('user')
    number = str(request.data.get('noq'))
    user = get_object_or_404(WebUser, id=user_id)

    if isinstance(subject, list):
        subject = ", ".join(subject)

    test_id = uuid.uuid4()
    test_model = Test(user_id = user,test_id = test_id, subject=subject, score = 0)
    test_model.save()

    questions = {}
    num_tries = 3
    while num_tries:
        try:
            raw_questions = run_query("mcq", query=subject, instructions=number)
            questions = clean_question_repsonse(raw_questions)
            break
        except Exception as e:
            print(f"Error occurred: {e}. Trying again.")
            num_tries -= 1
            if num_tries == 0:
                return JsonResponse({"error": "The model couldn't generate questions"}, status=408)

    for question in questions:
        question["test_id"] = str(test_id)
        q_uid = uuid.uuid4()
        question["question_id"] = str(q_uid)
        question_model = Questions(
            question_id=q_uid,
            test_id=test_model,
            question=question["question"],
            option_a=question["optionA"],
            option_b=question["optionB"],
            option_c=question["optionC"],
            option_d=question["optionD"],
            correct_ans=question["correctAnswer"]
        )
        question_model.save()

    return JsonResponse({"testId": str(test_id)}, safe=False)

@api_view(['GET'])
def get_questions(request):

    test_id = request.GET.get('testid')
    test = get_object_or_404(Test , test_id = test_id)

    questions = Questions.objects.filter(test_id = test)

    questions_json = []
    for question in questions:
        questions_json.append({
            'question_id': str(question.question_id),  
            'question': question.question,
            'optionA': question.option_a,
            'optionB': question.option_b,
            'optionC': question.option_c,
            'optionD': question.option_d,
            'correctAnswer': question.correct_ans,
        })

    return JsonResponse(questions_json , safe=False)

@api_view(['GET'])
def get_tests(request):

    user_id = request.GET.get('user')
    user = get_object_or_404(WebUser , id = user_id)

    tests = Test.objects.filter(user_id = user)

    tests_json = []
    for test in tests:
        tests_json.append({
            'test_id': str(test.test_id),  
            'subject': test.subject,
            'score': test.score,
            'test_date': test.date.strftime('%Y-%m-%d') if test.date else None,  
        })

    return JsonResponse( tests_json , safe=False)

@api_view(['PUT'])
@permission_classes([AllowAny])
def save_test(request):
    test_id = request.data.get('testId')
    test = get_object_or_404(Test, test_id = test_id)
    score = request.data.get('score')
    test_responses = request.data.get('answers')
    test.score = score
    test.save()

    for question_id, user_ans in test_responses.items():
        testResponse = TestResponse(test_id = test_id, question_id = question_id)
        question_obj = Questions.objects.filter(question_id = question_id).first()
        correct_ans = question_obj.correct_ans
        testResponse.selected_option = user_ans
        testResponse.is_correct = (correct_ans == user_ans)

        correct_ans_str = ""
        if question_obj.correct_ans == "optionA":
            correct_ans_str = question_obj.option_a
        elif question_obj.correct_ans == "optionB":
            correct_ans_str = question_obj.option_b
        elif question_obj.correct_ans == "optionC":
            correct_ans_str = question_obj.option_c
        else:
            correct_ans_str = question_obj.option_d
        
        user_ans_str = ""
        if user_ans == "optionA":
            user_ans_str = question_obj.option_a
        elif user_ans == "optionB":
            user_ans_str = question_obj.option_b
        elif user_ans == "optionC":
            user_ans_str = question_obj.option_c
        else:
            user_ans_str = question_obj.option_d

        testResponse.explanation = give_explanation(question_obj.question, correct_ans_str, user_ans_str)
        testResponse.save()

    return JsonResponse("HelloWorld" , safe=False)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_test(request):
    test_id = request.GET.get('testId')
    response_json = []
    test = get_object_or_404(Test, test_id = test_id)
    responses = TestResponse.objects.filter(test_id = test)
    for response in responses:
        question = response.question
        response_json.append({
            'question_id': str(question.question_id),  
            'question': question.question,
            'optionA': question.option_a,
            'optionB': question.option_b,
            'optionC': question.option_c,
            'optionD': question.option_d,
            'correctAnswer': question.correct_ans,
            'userAnswer':response.selected_option,
            'is_correct':response.is_correct,
            'explanation':response.explanation
        }) 
    response_json.append({'subject':test.subject})
    response_json.append({'score':test.score})
    return JsonResponse(response_json , safe=False)

def generate_flashcard(subject, difficulty , user):

    fc_id = uuid.uuid4()

    formats = {
        "easy"   : 'True/False questions. For example: \'{ "question": "Is the sky blue?", "answer": true }\'',
        "medium" : 'Fill-in-the-blank questions. For example: \'{ "question": "The capital of France is ____", "answer": "Paris" }\'',
        "hard"   : 'Open-ended questions with short answers. For example: \'{ "question": "Explain the theory of relativity.", "answer": "A detailed explanation of how time and space are relative." }\''
    }

    format = formats[difficulty.lower()]

    questions = {}
    num_tries = 3
    while num_tries:
        try:
            raw_questions = run_query("flashcard", query=subject, instructions=format)
            bad_questions = clean_question_repsonse(raw_questions)
            
            questions = bad_questions[:50] if len(bad_questions) > 50 else bad_questions
            break
        except Exception as e:
            print(f"Error occurred: {e}. Trying again.")
            num_tries -= 1
            if num_tries == 0:
                return JsonResponse({"error": "The model couldn't generate questions"}, status=408)

    flash_card = FlashCard(id = fc_id,subject = subject, user_id = user, difficulty = difficulty)
    flash_card.save()

    for que in questions:
        fcq = FlashcardQuestions(question_id = uuid.uuid4() , flashcard_id = flash_card , question = que["question"] , answer = que["answer"])
        fcq.save()

    return flash_card

@api_view(['GET'])
def gen_res_flashcard(request):

    subject = request.GET.get('topic')
    diff = request.GET.get('diff')
    difficulty = diff.lower() if diff.lower() in DifficultyLevel.values else "easy"
    userid = request.GET.get('userid')
    user = get_object_or_404(WebUser, id = userid)

    exists = FlashCard.objects.filter(subject = subject, user_id = user, difficulty = difficulty).first()

    if exists == None:
        exists  = generate_flashcard(subject , difficulty , user)


    questions = FlashcardQuestions.objects.filter(flashcard_id = exists)

    response = []

    for question in questions:
        response.append({
            "questionId" : question.question_id,
            "question" : question.question,
            "answer" : question.answer,
            "category" : question.state
        })
        
    response.append({"flashcardId":exists.id})   
    return JsonResponse( response , status = 200 , safe = False)


@api_view(['PUT'])
def update_flashcard(request):

    question = get_object_or_404(FlashcardQuestions ,question_id = request.data.get('questionId'))
    state = request.data.get('category').lower()

    question.state = state
    question.save()

    return Response(status = 204)

@api_view(['DELETE'])
def delete_flashcard(request):
    flashcard = get_object_or_404(FlashCard ,id = request.data.get('flashcardId'))
    
    flashcard.delete()

    return Response(status = 200)
