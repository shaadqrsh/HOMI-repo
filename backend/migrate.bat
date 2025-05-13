@echo off

python -m venv virtual_env

call virtual_env\Scripts\activate

python manage.py makemigrations

python manage.py migrate
