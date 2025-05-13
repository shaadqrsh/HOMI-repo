import os
import google.generativeai as genai
from user_api.models import Chat, ChatPage
from prompts import get_prompt
from dotenv import load_dotenv
import torch
import json
import re

load_dotenv()

backend_model_dir = "./models"

homi_model_name = "HOMITYBSCIT/DeepSeek-R1-Distill-HOMI-8B-trained"

hf_token = os.getenv('HF_API_KEY')

is_hf_spaces = os.getenv("SPACE_ID") is not None

model = None
tokenizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"

try:
    if is_hf_spaces:
        from unsloth import FastLanguageModel

        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name=homi_model_name,
            max_seq_length=2048,
            dtype=None,
            token=hf_token
        )
        FastLanguageModel.for_inference(model)
    else:
        from transformers import AutoModelForCausalLM, AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained(homi_model_name, token=hf_token)
        model = AutoModelForCausalLM.from_pretrained(
            homi_model_name,
            torch_dtype=torch.float16,
            token=hf_token
        )

    model.to(device)
    torch.backends.cudnn.benchmark = True
    torch.backends.cuda.matmul.allow_tf32 = True
except Exception as e:
    print(f"Error: {str(e)}. Gemini will be used for all queries.")
    
    
def get_chat_history(chatpage_id, max_length=0):
    chatpage = ChatPage.objects.get(id=chatpage_id)
    chats = Chat.objects.filter(chat_page=chatpage).order_by('sent_at')

    if max_length > 0:
        total_msgs = chats.count()
        if total_msgs % 2 != 0:
            total_msgs -= 1  
        pairs_to_show = min(total_msgs // 2, max_length)
        chats = chats[(total_msgs - pairs_to_show * 2): total_msgs]
    
    chat_str = ""
    for chat in chats:
        chat_str += f"{'User' if chat.by_user else 'Bot'}: {chat.message}\n"
    return chat_str

def clean_response(response):
    triggers = ["</think>", "<think>", "### Response:"]
    formatted_resp = response
    for trigger in triggers:
        if trigger in formatted_resp:
            formatted_resp = formatted_resp.split(trigger)[-1]
            break
    return formatted_resp.strip()

def clean_question_repsonse(response):
    cleaned = response.strip("`").replace("json", "", 1).strip()
    json_objects = re.findall(r'\{.*?\}', cleaned, flags=re.DOTALL)
    questions = [json.loads(obj) for obj in json_objects]
    return questions

def stream_homi_query(query, max_total_tokens=None):
    chunk_size = 20
    inputs = tokenizer([query], return_tensors="pt").to(device)
    generated_ids = inputs.input_ids
    attention_mask = inputs.attention_mask
    if max_total_tokens is None:
        max_total_tokens = generated_ids.shape[1] + 5000

    finished = False
    while not finished:
        with torch.no_grad():
            with torch.amp.autocast('cuda'):
                outputs = model.generate(
                    input_ids=generated_ids,
                    attention_mask=attention_mask,
                    max_new_tokens=chunk_size,
                    use_cache=True
                )

        new_tokens = outputs[0][generated_ids.shape[1]:]
        decoded_chunk = tokenizer.decode(new_tokens, skip_special_tokens=True)
        yield decoded_chunk

        generated_ids = outputs
        attention_mask = torch.ones(generated_ids.shape, device=generated_ids.device)

        if (tokenizer.eos_token_id in new_tokens) or (generated_ids.shape[1] >= max_total_tokens):
            finished = True

def run_homi_query(query, max_total_tokens=None):
    full_response = ""
    for chunk in stream_homi_query(query, max_total_tokens):
        full_response += chunk
    return clean_response(full_response)

gemini_model_name = "gemini-2.0-flash"

gemini_api_key = os.getenv("GEMINI_API_KEY")

genai.configure(api_key=gemini_api_key)

def give_explanation(question, correct_ans, user_ans):
    query = f"The user was given a question {question} to solve in a test. The correct answer was \"{correct_ans}\" and the user answered \"{user_ans}\". Explain why the user was "
    query += "correct" if correct_ans == user_ans else "incorrect"
    query += ". Do not provide any fancy formatting. Provide your answer in one paragraph in plaintext."
    return run_gemini_query("chat", query=query)

def run_gemini_query(query):
    try:
        model = genai.GenerativeModel(gemini_model_name)
        answer = model.generate_content(query)
        return answer.text
    except Exception as e:
        print(f"Error encountered during API call: {e}")
        return None

def run_query(prompt_type, query=None, instructions="", chat_id=None):
    chat_history = ""
    if chat_id and chat_id != "":
        chat_length = (3 if prompt_type in ["chat", "thinking"] else 0) * 2
        chat_history = get_chat_history(chat_id, chat_length)
    formatted_query = get_prompt(prompt_type, query=query, instructions=instructions, chat_history=chat_history)
    if not model or prompt_type in ["list_topics"] or (query and "/gemini" in query):
        print("Running query through Gemini")
        return run_gemini_query(formatted_query)
    try:
        return run_homi_query(formatted_query)
    except Exception as e:
        print(f"Error occurred: {e}. Running query through Gemini.")
        return run_gemini_query(formatted_query)