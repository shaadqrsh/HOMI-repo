base_prompt_style = """Below is an instruction that describes a task, paired with an input that provides further context.

### Conversation History/Summary:
{}

### Instructions:
You are an IT expert. {}
"""

def chat_prompt(query, instructions="", chat_history=""):
    real_instructions = "Answer the question below clearly and concisely."
    real_instructions += instructions
    content = """\n\n### Question:
{}

### Answer:
"""
    return base_prompt_style.format(chat_history, real_instructions) + content.format(query)

def thinking_chat_prompt(query, instructions="", chat_history=""):
    real_instructions = "First, think step-by-step about the question and write your chain-of-thought enclosed in <think> and </think> tags. Then provide your final answer."
    real_instructions += instructions
    content = """\n\n### Question:
{}

### Answer:
"""
    return base_prompt_style.format(chat_history, real_instructions) + content.format(query)

def mcq_prompt(topic, number, chat_history):
    topic_str = f"the topic {topic}, and" if topic else ""
    real_instructions = (
        f"Create {number} MCQ questions based on {topic_str} the chat summary above, in this format:\n"
        '{"question_id": "", "question": "", "optionA": "", "optionB": "", "optionC": "", "optionD": "", "correctAnswer": "optionX"}\n'
        "Ensure the output is a valid JSON array which adheres to the mentioned format."
    )
    content = "\n\n### Output (JSON):\n"
    return base_prompt_style.format(chat_history, real_instructions) + content.format(topic)

def flashcard_prompt(topic, json_format, chat_history):
    real_instructions = (
        f"Create 50 flashcard questions based on the topic '{topic}' and the chat summary provided below.\n\n"
        "Each flashcard must strictly adhere to one of the following formats. Replace any placeholder text with appropriate, actual content related to the topic.\n\n"
        f'{json_format}\n'
        "Ensure that the output is a valid JSON array containing exactly 50 flashcards."
    )
    content = "\n\n### Output (JSON):\n"
    return base_prompt_style.format(chat_history, real_instructions) + content.format(topic)

def summarization_prompt(chat_history, instructions=""):
    real_instructions = "Above is a conversation history. Your task is to summarize the following content in a clear, concise summary that captures all key points."
    real_instructions += instructions
    content = "\n\n### Summary:"
    return base_prompt_style.format(chat_history, real_instructions) + content

def extract_topic_prompt(chat_history, instructions=""):
    real_instructions = "Above is a conversation history. Your task is to identify the central topic in this conversation in no more than 5 words. Please output only the topic summary."
    real_instructions += instructions
    content = "\n\n### Topic (≤ 5 words):"
    return base_prompt_style.format(chat_history, real_instructions) + content

def list_topics_prompt(chat_history, instructions=""):
    real_instructions = (
        "Above is a conversation history. Your task is to identify the main topics within this conversation."
        "The topics should be generalized and not very specific, so that they can be used as topics for a test."
        "The names of the topics should be no longer than 5 words." 
        "Please output a list of the topics in the format with n number of topics \"{ topic1 }{ topic2 }...{ topicn }\"."
    )
    real_instructions += instructions
    content = "\n\n### Topics:"
    return base_prompt_style.format(chat_history, real_instructions) + content

prompt_functions = {
    "chat": chat_prompt,
    "thinking": thinking_chat_prompt,
    "mcq": mcq_prompt,
    "flashcard": flashcard_prompt,
    "summarization": summarization_prompt,
    "extract_topic": extract_topic_prompt,
    "list_topics": list_topics_prompt
}

def get_prompt(prompt_type, query=None, instructions="", chat_history=""):
    func = prompt_functions.get(prompt_type)
    if func is None:
        raise ValueError(f"Invalid prompt type: {prompt_type}")
    if prompt_type in ["summarization", "extract_topic","list_topics"]:
        return func(chat_history, instructions)
    return func(query, instructions, chat_history)