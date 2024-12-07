__all__ = ["SMTPRepository", "smtp_repository"]

import contextlib
import smtplib
from collections.abc import Generator
from email.header import Header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from email_validator import EmailNotValidError, validate_email

from src.config import settings

VERIFICATION_CODE_TEMPLATE = (Path(__file__).parent / "templates/verification-code.html").read_text()
NOTIFY_TEMPLATE = (Path(__file__).parent / "templates/notify.html").read_text()
RESET_PASSWORD_TEMPLATE = (Path(__file__).parent / "templates/reset-password.html").read_text()


# noinspection PyMethodMayBeStatic
class SMTPRepository:
    _server: smtplib.SMTP

    def __init__(self) -> None:
        self._server = smtplib.SMTP(settings.smtp.host, settings.smtp.port)

    @contextlib.contextmanager
    def _context(self) -> Generator[None, None, None]:
        self._server.connect(settings.smtp.host, settings.smtp.port)
        self._server.starttls()
        self._server.login(settings.smtp.username, settings.smtp.password.get_secret_value())
        yield
        self._server.quit()

    def render_verification_message(self, target_email: str, code: str) -> str:
        mail = MIMEMultipart("alternative")
        html = VERIFICATION_CODE_TEMPLATE.replace("${{code}}", code)
        msg_html = MIMEText(html, "html")
        mail.attach(msg_html)

        mail["Subject"] = Header("Код подтверждения")
        mail["From"] = Header(f"FSP Link <{settings.smtp.username}>")
        mail["To"] = target_email

        return mail.as_string()

    def render_reset_password_message(self, target_email: str, url: str) -> str:
        mail = MIMEMultipart("alternative")
        html = RESET_PASSWORD_TEMPLATE.replace("${{url}}", url)
        msg_html = MIMEText(html, "html")
        mail.attach(msg_html)

        mail["Subject"] = Header("Сброс пароля")
        mail["From"] = Header(f"FSP Link <{settings.smtp.username}>")
        mail["To"] = target_email

        return mail.as_string()

    def render_notify_message(self, message: str) -> str:
        mail = MIMEMultipart("related")
        html = NOTIFY_TEMPLATE.replace("${{message}}", message)
        msg_html = MIMEText(html, "html")
        mail.attach(msg_html)

        mail["Subject"] = "Уведомление"
        mail["From"] = f"FSP Link <{settings.smtp.username}>"
        # mail["To"] = target_emails

        return mail.as_string()

    def send(self, message: str, to: str | list[str]):
        try:
            to = to if isinstance(to, list) else [to]
            new_to = []
            for email in to:
                valid = validate_email(email)
                new_to.append(valid.normalized)
        except EmailNotValidError as e:
            raise ValueError from e
        with SMTPRepository._context(self):
            self._server.sendmail(settings.smtp.username, new_to, message)


if settings.smtp:
    smtp_repository: SMTPRepository = SMTPRepository()
else:
    import warnings

    warnings.warn("SMTP settings are not configured, SMTPRepository will not be available", RuntimeWarning)
    smtp_repository: None = None
