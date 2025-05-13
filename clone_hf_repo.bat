@echo off
setlocal

:: Set your variables
set HF_USERNAME=HOMITYBSCIT
set HF_SPACE=homi-bot
set GH_REPO=https://github.com/Hmalhotra004/AIML-Chatbot
set GH_BRANCH=main
set HF_TOKEN=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

echo Cloning Hugging Face Space...
rmdir /s /q hf-space
git clone https://%HF_USERNAME%:%HF_TOKEN%@huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE% hf-space

echo Cloning GitHub repo (branch: %GH_BRANCH%)...
rmdir /s /q temp-repo
git clone --branch %GH_BRANCH% %GH_REPO% temp-repo

echo Syncing backend folder contents...
xcopy /E /Y /I temp-repo\backend\* hf-space\

echo Pushing to Hugging Face...
cd hf-space
git add .
git commit -m "Auto-sync from GitHub branch %GH_BRANCH%" || echo "No changes to commit"
git push

echo Cleaning up...
cd ..
rmdir /s /q temp-repo
rmdir /s /q hf-space

echo Sync complete! 🚀
pause