"""
Kshricash - Email Service
Email sending functionality for authentication and notifications
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from datetime import datetime
import logging

from app.config import settings

logger = logging.getLogger(__name__)


# =====================================================
# EMAIL TEMPLATES
# =====================================================

def get_password_reset_email_template(user_name: str, reset_link: str) -> str:
    """
    Generate HTML template for password reset email

    Args:
        user_name: User's full name
        reset_link: Password reset link

    Returns:
        str: HTML email content
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #1976D2;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
                background-color: #f9f9f9;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                margin: 20px 0;
                background-color: #1976D2;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello {user_name},</p>
                <p>We received a request to reset your password for your Kshricash account.</p>
                <p>Click the button below to reset your password:</p>
                <a href="{reset_link}" class="button">Reset Password</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{reset_link}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                <p>Thank you,<br>Kshricash Team</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Kshricash. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_email_verification_template(user_name: str, verification_link: str) -> str:
    """
    Generate HTML template for email verification

    Args:
        user_name: User's full name
        verification_link: Email verification link

    Returns:
        str: HTML email content
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #1976D2;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
                background-color: #f9f9f9;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                margin: 20px 0;
                background-color: #1976D2;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p>Hello {user_name},</p>
                <p>Welcome to Kshricash! Please verify your email address to complete your registration.</p>
                <p>Click the button below to verify your email:</p>
                <a href="{verification_link}" class="button">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;">{verification_link}</p>
                <p><strong>This link will expire in 7 days.</strong></p>
                <p>If you didn't create an account with Kshricash, please ignore this email.</p>
                <p>Thank you,<br>Kshricash Team</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Kshricash. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_password_changed_template(user_name: str) -> str:
    """
    Generate HTML template for password changed notification

    Args:
        user_name: User's full name

    Returns:
        str: HTML email content
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #4CAF50;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
                background-color: #f9f9f9;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Changed Successfully</h1>
            </div>
            <div class="content">
                <p>Hello {user_name},</p>
                <p>Your password has been successfully changed.</p>
                <p><strong>If you did not make this change, please contact our support team immediately.</strong></p>
                <p>Thank you,<br>Kshricash Team</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Kshricash. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """


def get_welcome_email_template(user_name: str, login_link: str) -> str:
    """
    Generate HTML template for welcome email

    Args:
        user_name: User's full name
        login_link: Login page link

    Returns:
        str: HTML email content
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background-color: #1976D2;
                color: white;
                padding: 20px;
                text-align: center;
            }}
            .content {{
                padding: 20px;
                background-color: #f9f9f9;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                margin: 20px 0;
                background-color: #1976D2;
                color: white;
                text-decoration: none;
                border-radius: 4px;
            }}
            .footer {{
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to Kshricash!</h1>
            </div>
            <div class="content">
                <p>Hello {user_name},</p>
                <p>Your account has been successfully created and verified!</p>
                <p>You can now access all the features of Kshricash:</p>
                <ul>
                    <li>BBPS Bill Payments</li>
                    <li>AEPS Services</li>
                    <li>DMT Money Transfer</li>
                    <li>Mobile & DTH Recharge</li>
                    <li>And much more!</li>
                </ul>
                <p>Click the button below to login:</p>
                <a href="{login_link}" class="button">Login Now</a>
                <p>Thank you for choosing Kshricash!</p>
                <p>Best regards,<br>Kshricash Team</p>
            </div>
            <div class="footer">
                <p>&copy; {datetime.now().year} Kshricash. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """


# =====================================================
# EMAIL SENDING FUNCTIONS
# =====================================================

class EmailService:
    """Email service class for sending emails via SMTP"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from_email = settings.SMTP_FROM_EMAIL
        self.smtp_from_name = settings.SMTP_FROM_NAME

    def send_email(
            self,
            to_email: str,
            subject: str,
            html_content: str,
            text_content: Optional[str] = None
    ) -> bool:
        """
        Send email via SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text content (optional)

        Returns:
            bool: True if email sent successfully
        """
        if not settings.EMAIL_ENABLED:
            logger.warning("Email sending is disabled in settings")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.smtp_from_name} <{self.smtp_from_email}>"
            message["To"] = to_email
            message["Subject"] = subject

            # Add plain text part if provided
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            # Add HTML part
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                if settings.SMTP_TLS:
                    server.starttls()

                if self.smtp_user and self.smtp_password:
                    server.login(self.smtp_user, self.smtp_password)

                server.send_message(message)

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def send_password_reset_email(
            self,
            to_email: str,
            user_name: str,
            reset_token: str,
            base_url: str = "http://localhost:3000"
    ) -> bool:
        """
        Send password reset email

        Args:
            to_email: User's email
            user_name: User's full name
            reset_token: Password reset token
            base_url: Base URL of frontend application

        Returns:
            bool: True if sent successfully
        """
        reset_link = f"{base_url}/reset-password?token={reset_token}"
        html_content = get_password_reset_email_template(user_name, reset_link)

        return self.send_email(
            to_email=to_email,
            subject="Reset Your Kshricash Password",
            html_content=html_content
        )

    def send_email_verification(
            self,
            to_email: str,
            user_name: str,
            verification_token: str,
            base_url: str = "http://localhost:3000"
    ) -> bool:
        """
        Send email verification

        Args:
            to_email: User's email
            user_name: User's full name
            verification_token: Email verification token
            base_url: Base URL of frontend application

        Returns:
            bool: True if sent successfully
        """
        verification_link = f"{base_url}/verify-email?token={verification_token}"
        html_content = get_email_verification_template(user_name, verification_link)

        return self.send_email(
            to_email=to_email,
            subject="Verify Your Kshricash Email",
            html_content=html_content
        )

    def send_password_changed_notification(
            self,
            to_email: str,
            user_name: str
    ) -> bool:
        """
        Send password changed notification

        Args:
            to_email: User's email
            user_name: User's full name

        Returns:
            bool: True if sent successfully
        """
        html_content = get_password_changed_template(user_name)

        return self.send_email(
            to_email=to_email,
            subject="Your Kshricash Password Was Changed",
            html_content=html_content
        )

    def send_welcome_email(
            self,
            to_email: str,
            user_name: str,
            base_url: str = "http://localhost:3000"
    ) -> bool:
        """
        Send welcome email

        Args:
            to_email: User's email
            user_name: User's full name
            base_url: Base URL of frontend application

        Returns:
            bool: True if sent successfully
        """
        login_link = f"{base_url}/login"
        html_content = get_welcome_email_template(user_name, login_link)

        return self.send_email(
            to_email=to_email,
            subject="Welcome to Kshricash!",
            html_content=html_content
        )


# =====================================================
# SINGLETON INSTANCE
# =====================================================

email_service = EmailService()

# =====================================================
# EXPORT
# =====================================================

__all__ = [
    "EmailService",
    "email_service",
    "get_password_reset_email_template",
    "get_email_verification_template",
    "get_password_changed_template",
    "get_welcome_email_template",
]