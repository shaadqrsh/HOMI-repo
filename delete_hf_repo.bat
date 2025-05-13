set HF_USERNAME=HOMITYBSCIT
set HF_SPACE=homi-bot-working
set GH_REPO=https://github.com/Hmalhotra004/AIML-Chatbot
set HF_TOKEN=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

echo Cloning Hugging Face Space...
rmdir /s /q hf-space
git clone https://%HF_USERNAME%:%HF_TOKEN%@huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE% hf-space
