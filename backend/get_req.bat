@echo off
if exist requirements.txt del requirements.txt

for /f "tokens=1 delims==" %%i in ('pip freeze') do (
    echo %%i >> requirements.txt
)

echo Requirements saved to requirements.txt.
pause
