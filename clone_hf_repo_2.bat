@echo off
setlocal

:: Set your variables
set HF_USERNAME=HOMITYBSCIT
set HF_SPACE=homi-bot-working
set GH_REPO=https://github.com/Hmalhotra004/AIML-Chatbot
set HF_TOKEN=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

echo Cloning Hugging Face Space...
rmdir /s /q hf-space
git clone https://%HF_USERNAME%:%HF_TOKEN%@huggingface.co/spaces/%HF_USERNAME%/%HF_SPACE% hf-space

echo Cloning GitHub repo...
rmdir /s /q temp-repo
git clone %GH_REPO% temp-repo

echo Deleting all files from Hugging Face Space (except .git)...
cd hf-space
:: Delete all files (non-directories)
for /f "delims=" %%i in ('dir /b /a-d') do (
  if /i not "%%i"==".git" del /q "%%i"
)
:: Delete all directories except .git
for /d %%i in (*) do (
  if /i not "%%i"==".git" rmdir /s /q "%%i"
)
cd ..

echo Copying all files from GitHub repo...
:: Create an exclusion file so that .git directory is not copied over
echo .git> exclude.txt
xcopy /E /Y /I temp-repo\backend\* hf-space\
del exclude.txt

echo Pushing to Hugging Face...
cd hf-space
git add .
git commit -m "Auto-sync from GitHub branch" || echo "No changes to commit"
git push

echo Cleaning up...
cd ..
rmdir /s /q temp-repo
rmdir /s /q hf-space

echo Sync complete! 🚀
pause
