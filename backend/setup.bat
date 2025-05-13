@echo off

py -m venv virtual_env

call virtual_env\Scripts\activate

pip install -r requirements.txt

:: pip uninstall torch torchvision torchaudio
:: pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126

echo Done.
