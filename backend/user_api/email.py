def send_otp(email, otp):
    import resend
    from dotenv import load_dotenv
    import os

    load_dotenv()

    email_body = f"""
    Hello,

    Your one-time password (OTP) for verification is: <b>{otp}</b><br>

    This OTP is valid for 5 minutes. Do not share this code with anyone.<br>

    If you did not request this OTP, please ignore this email.<br><br>

    Thank you,<br>
    Homi and Team 😊"""
    
    resend.api_key = os.getenv("RESEND_API_KEY")

    params: resend.Emails.SendParams = {
    "from": "admin@homi-bot.in",
    "to": [email],
    "subject": "Homi Bot Verification Mail",
    "html": email_body,
    }

    email = resend.Emails.send(params)
