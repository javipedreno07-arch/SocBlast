from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
import os
from dotenv import load_dotenv

load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

async def enviar_email_verificacion(email: str, nombre: str, token: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    enlace = f"{frontend_url}/verificar-email?token={token}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#03030A;font-family:'Inter',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:rgba(14,26,46,0.95);border:1px solid #1A3050;border-radius:16px;overflow:hidden;">
        <div style="height:4px;background:linear-gradient(90deg,transparent,#2564F1,transparent);"></div>
        <div style="padding:40px 36px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🛡️</div>
          <h1 style="color:#FFFFFF;font-size:24px;font-weight:900;letter-spacing:-0.5px;margin-bottom:8px;">
            Bienvenido a SocBlast, {nombre}
          </h1>
          <p style="color:#5A7898;font-size:14px;margin-bottom:32px;line-height:1.6;">
            Confirma tu email para activar tu cuenta y comenzar<br/>tu carrera como analista SOC.
          </p>
          <a href="{enlace}"
             style="display:inline-block;padding:14px 32px;background:#2564F1;color:#FFFFFF;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;margin-bottom:24px;">
            Verificar mi cuenta →
          </a>
          <p style="color:#1A3050;font-size:12px;font-family:monospace;">
            Si no creaste esta cuenta, ignora este email.<br/>
            Este enlace expira en 24 horas.
          </p>
        </div>
        <div style="padding:16px;text-align:center;border-top:1px solid #1A3050;">
          <p style="color:#1A3050;font-size:11px;font-family:monospace;">SocBlast · Powered by Zorion</p>
        </div>
      </div>
    </body>
    </html>
    """

    message = MessageSchema(
        subject="Verifica tu cuenta — SocBlast",
        recipients=[email],
        body=html,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)