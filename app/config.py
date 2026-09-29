
"""
VasuPay - Configuration Management
Centralized configuration using Pydantic Settings
"""

from pydantic import field_validator, Field
from pydantic_settings import BaseSettings
from typing import Optional, List
from functools import lru_cache
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings with environment variable support

    Environment variables override defaults
    Example: DB_HOST=localhost DB_PORT=5432 python main.py
    """

    # =====================================================
    # APPLICATION SETTINGS
    # =====================================================

    APP_NAME: str = "VasuPay API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Multi-Tenant Financial Services Platform"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)

    # API Configuration
    API_PREFIX: str = "/api/v1"
    API_HOST: str = Field(default="127.0.0.1")
    API_PORT: int = Field(default=5021)
    API_WORKERS: int = Field(default=4)

    # CORS Configuration
    CORS_ORIGINS: tuple[str, ...] = (
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8080"
    )

    CORS_ALLOW_CREDENTIALS: bool = True

    CORS_ALLOW_METHODS: tuple[str, ...] = ("*",)
    CORS_ALLOW_HEADERS: tuple[str, ...] = ("*",)

    # =====================================================
    # DATABASE SETTINGS
    # =====================================================

    DB_TYPE: str = Field(default="mysql")  # postgresql, mysql, sqlite
    DB_HOST: str = Field(default="localhost")
    DB_PORT: int = Field(default=3306)
    DB_NAME: str = Field(default="vasupay_schemas")
    DB_USER: str = Field(default="vasudev1008")
    DB_PASSWORD: str = Field(default="vasu#1008#369")

    # Connection Pool Settings
    DB_POOL_SIZE: int = Field(default=20)
    DB_MAX_OVERFLOW: int = Field(default=40)
    DB_POOL_TIMEOUT: int = Field(default=30)
    DB_POOL_RECYCLE: int = Field(default=3600)

    # Query Logging
    DB_ECHO: bool = Field(default=False)
    DB_ECHO_POOL: bool = Field(default=False)

    # =====================================================
    # SECURITY SETTINGS
    # =====================================================

    # JWT Configuration
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Password Hashing
    BCRYPT_ROUNDS: int = 12

    # MPIN Configuration
    MPIN_LENGTH: int = 4
    MPIN_MAX_ATTEMPTS: int = 3
    MPIN_LOCK_DURATION_MINUTES: int = 30

    # Session Configuration
    SESSION_EXPIRE_HOURS: int = 24
    MAX_SESSIONS_PER_USER: int = 5

    # =====================================================
    # OTP SETTINGS
    # =====================================================

    OTP_LENGTH: int = 6
    OTP_EXPIRE_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 3
    OTP_RESEND_COOLDOWN_SECONDS: int = 60

    # =====================================================
    # RATE LIMITING
    # =====================================================

    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    RATE_LIMIT_PER_DAY: int = 10000

    # API Key Rate Limits
    API_KEY_RATE_LIMIT_PER_MINUTE: int = 120
    API_KEY_RATE_LIMIT_PER_HOUR: int = 5000

    # =====================================================
    # REDIS SETTINGS (for caching & rate limiting)
    # =====================================================

    REDIS_ENABLED: bool = Field(default=False)
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_DB: int = Field(default=0)
    REDIS_PASSWORD: Optional[str] = Field(default=None)
    REDIS_EXPIRE_SECONDS: int = 3600

    # =====================================================
    # CELERY SETTINGS (for async tasks)
    # =====================================================

    CELERY_BROKER_URL: str = Field(
        default="redis://localhost:6379/1"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://localhost:6379/2"
    )

    # =====================================================
    # LOGGING SETTINGS
    # =====================================================

    LOG_LEVEL: str = Field(default="INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = Field(default="logs/vasupay.log")
    LOG_FILE_MAX_BYTES: int = 10 * 1024 * 1024  # 10MB
    LOG_FILE_BACKUP_COUNT: int = 5

    # Request Logging
    LOG_REQUESTS: bool = True
    LOG_RESPONSES: bool = False  # Can be verbose
    LOG_SQL_QUERIES: bool = False  # Only in development

    # =====================================================
    # SMS GATEWAY SETTINGS
    # =====================================================

    SMS_PROVIDER: str = Field(default="msg91")  # twilio, msg91, textlocal

    # Twilio
    TWILIO_ACCOUNT_SID: Optional[str] = Field(default=None)
    TWILIO_AUTH_TOKEN: Optional[str] = Field(default=None)
    TWILIO_PHONE_NUMBER: Optional[str] = Field(default=None)

    # MSG91
    MSG91_AUTH_KEY: Optional[str] = Field(default=None)
    MSG91_SENDER_ID: Optional[str] = Field(default=None)
    MSG91_ROUTE: str = "4"  # 4 for transactional

    # =====================================================
    # EMAIL SETTINGS
    # =====================================================

    EMAIL_ENABLED: bool = Field(default=False)
    EMAIL_PROVIDER: str = Field(default="smtp")  # smtp, sendgrid, ses

    # SMTP Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: Optional[str] = Field(default=None)
    SMTP_PASSWORD: Optional[str] = Field(default=None)
    SMTP_FROM_EMAIL: str = Field(default="noreply@vasupay.com")
    SMTP_FROM_NAME: str = "VasuPay"
    SMTP_TLS: bool = True

    # SendGrid
    SENDGRID_API_KEY: Optional[str] = Field(default=None)

    # =====================================================
    # FILE STORAGE SETTINGS
    # =====================================================

    STORAGE_PROVIDER: str = Field(default="local")  # local, s3, cloudinary

    # Local Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: tuple[str, ...] = (
        "jpg", "jpeg", "png", "pdf", "doc", "docx"
    )

    # AWS S3
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None)
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None)
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: Optional[str] = Field(default=None)

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(default=None)
    CLOUDINARY_API_KEY: Optional[str] = Field(default=None)
    CLOUDINARY_API_SECRET: Optional[str] = Field(default=None)

    # =====================================================
    # PAYMENT GATEWAY SETTINGS
    # =====================================================

    # Razorpay
    RAZORPAY_KEY_ID: Optional[str] = Field(default=None)
    RAZORPAY_KEY_SECRET: Optional[str] = Field(default=None)

    # PayU
    PAYU_MERCHANT_KEY: Optional[str] = Field(default=None)
    PAYU_MERCHANT_SALT: Optional[str] = Field(default=None)

    # =====================================================
    # SERVICE PROVIDER APIs
    # =====================================================

    # BBPS Provider
    BBPS_PROVIDER: str = "airtel"
    BBPS_API_KEY: Optional[str] = Field(default=None)
    BBPS_API_SECRET: Optional[str] = Field(default=None)
    BBPS_API_URL: Optional[str] = Field(default=None)

    # BBPS — Airtel Payments Bank (APBL) Open Banking / Bharat Connect
    # NOTE: UAT defaults below match the validated test suite; override via
    # environment variables (and use a secrets vault) for production.
    BBPS_BASE_URL: str = "https://apbsit.airtelpaymentsuat.bank.in/cuc/apb/bbps/v1"
    # v2 base (bill-fetch / bill-payment-inquiry). Configure independently of v1.
    BBPS_BASE_URL_V2: str = "https://apbsit.airtelpaymentsuat.bank.in/cuc/apb/bbps/v2"
    # Default API version for versioned endpoints (bill-fetch / bill-payment-inquiry
    # / balance-check). Admin can override this at runtime (stored in system_configs).
    BBPS_API_VERSION: str = "v2"
    BBPS_PARTNER_ID: str = "1000014811"
    BBPS_X_KEY_ID: str = "55779941"
    BBPS_SECRET_KEY: str = "VasupayDD4N63G5gQl0kTcJGMK5xuSwoSVPTi8K"
    BBPS_CHANNEL: str = "MOBB"
    BBPS_DEVICE_DETAILS: str = "10.241.242.76!F1EDA71A-A82C-40FF-AA68-283AC768EB0C!UNIX!MyAirtel"
    BBPS_TIMEOUT_SECONDS: int = 30
    # 4096-bit RSA public key provided by Airtel (PEM). Override via BBPS_BANK_PUBLIC_KEY.
    BBPS_BANK_PUBLIC_KEY: str = (
        "-----BEGIN PUBLIC KEY-----\n"
        "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA8P3nzzAev3rSjpXniwlH\n"
        "aJoy8RM1JRiptQbQNZvfRY17XgLGNXGhM3BNBSMQ51Ddmy9d6CQbT59JYUEdtvBw\n"
        "An1Htlm3FqrNmtq+0xtwy3evJGEDTBgRF3gSjvrw64J1+3mLfOruVGSa2FMPMJ3r\n"
        "putqro06r3RXfMR5pkS+AyyM+yp4QL2k/Jf2+vbthKIER0treV70F8rYKR3GMYq3\n"
        "kthvrgu/g+DHNgqLgEuipTwYyAibj1wxHc/PduiYtZeV6rOSFtcJ6nqxErjn2lxX\n"
        "TVh/bgF0u1sAG6h653mvaFg6t9sMEQzPFJ2B0tDHNESh28G6v4JIuXFmULUzOdGD\n"
        "1eE+7tz9AZRMlie6+NXaghwqvQm90axrrd1snynM5cilbg0O5lyDD//a6K/oMgjf\n"
        "Mor1VfQfOYmx886wBGwVKIXpbR1AkYR8gHPzfkGPhq04m+PEticPrPTW3/1cFlmt\n"
        "bg0FsFpWww3djP9Unu9bVLM+ez+Urdldt7K1JPJ8EylRFs7tIPCSRXQ596BVVgg2\n"
        "yDXEMc2wqAsYAKo6s9Is0woVzVWNGKuGKo0YQ9+gKrZ2rfBldDfBJ7H4AYSJB9Sp\n"
        "sVZoDsV4bZ8M5cyLd/1N8X8dWPWMuPyZ8t/eDk1B4p/vufv1OFUpoS+HxQRt/IyC\n"
        "BZz1oC89B6TrgYv1rneTnKkCAwEAAQ==\n"
        "-----END PUBLIC KEY-----"
    )


    # =====================================================
    # SMS Provider (transactional / DLT)
    # =====================================================
    SMS_ENABLED: bool = True
    SMS_API_URL: str = "https://kutility.org/app/smsapi/index.php"
    SMS_API_KEY: str = "268D61FED2C714"
    SMS_CAMPAIGN: str = "14908"
    SMS_ROUTE_ID: str = "7"
    SMS_TYPE: str = "text"
    SMS_SENDER_ID: str = "VASPAY"
    SMS_PE_ID: str = "1201178610819123427"
    SMS_TIMEOUT_SECONDS: int = 10
    # DLT-approved template for a successful bill payment. Placeholders:
    #   {amount} -> Rs value, {biller} -> biller/agent id, {txn_id} -> transaction id
    SMS_PAYMENT_TEMPLATE_ID: str = "1277178705053646680"
    SMS_PAYMENT_TEMPLATE: str = (
        "Dear User, Your payment of Rs. {amount} to {biller} was successful. "
        "Transaction ID: {txn_id} - VasuPay"
    )

    # DMT Provider
    DMT_PROVIDER: str = "fino"
    DMT_API_KEY: Optional[str] = Field(default=None)
    DMT_API_SECRET: Optional[str] = Field(default=None)
    DMT_API_URL: Optional[str] = Field(default=None)

    # AEPS Provider
    AEPS_PROVIDER: str = "fino"
    AEPS_API_KEY: Optional[str] = Field(default=None)
    AEPS_API_SECRET: Optional[str] = Field(default=None)
    AEPS_API_URL: Optional[str] = Field(default=None)

    # =====================================================
    # BUSINESS RULES
    # =====================================================

    # Transaction Limits (Default)
    DEFAULT_DAILY_LIMIT: float = 50000.00
    DEFAULT_PER_TXN_LIMIT: float = 10000.00
    DEFAULT_MONTHLY_LIMIT: float = 200000.00

    # Wallet Limits
    DEFAULT_WALLET_LIMIT: float = 500000.00
    MIN_WALLET_BALANCE: float = 0.00

    # Commission
    DEFAULT_COMMISSION_RATE: float = 1.0  # 1%
    MIN_COMMISSION: float = 0.00
    MAX_COMMISSION: float = 100.00

    # Settlement
    MIN_SETTLEMENT_AMOUNT: float = 1000.00
    SETTLEMENT_CHARGE: float = 10.00
    AUTO_SETTLEMENT_ENABLED: bool = False

    # GST
    DEFAULT_GST_RATE: float = 18.00

    # KYC
    KYC_REQUIRED_FOR_TRANSACTION: bool = True
    KYC_MAX_RESUBMISSIONS: int = 3

    # =====================================================
    # NOTIFICATION SETTINGS
    # =====================================================

    NOTIFICATION_ENABLED: bool = True
    EMAIL_NOTIFICATIONS: bool = True
    SMS_NOTIFICATIONS: bool = True
    PUSH_NOTIFICATIONS: bool = False

    # Firebase Cloud Messaging (for push notifications)
    FCM_SERVER_KEY: Optional[str] = Field(default=None)

    # =====================================================
    # WEBHOOK SETTINGS
    # =====================================================

    WEBHOOK_ENABLED: bool = True
    WEBHOOK_TIMEOUT_SECONDS: int = 30
    WEBHOOK_MAX_RETRIES: int = 3
    WEBHOOK_RETRY_INTERVAL_SECONDS: int = 60

    # =====================================================
    # MONITORING & ANALYTICS
    # =====================================================

    # Sentry (Error Tracking)
    SENTRY_DSN: Optional[str] = Field(default=None)
    SENTRY_ENVIRONMENT: str = "development"

    # New Relic (APM)
    NEW_RELIC_LICENSE_KEY: Optional[str] = Field(default=None)

    # Google Analytics
    GA_TRACKING_ID: Optional[str] = Field(default=None)

    # =====================================================
    # TESTING SETTINGS
    # =====================================================

    TESTING: bool = Field(default=False)
    TEST_DB_NAME: str = "vasupay_test"

    # =====================================================
    # VALIDATORS
    # =====================================================

    @field_validator("DB_PORT")
    def validate_db_port(cls, v):
        if not 1 <= v <= 65535:
            raise ValueError("DB_PORT must be between 1 and 65535")
        return v

    @field_validator("API_PORT")
    def validate_api_port(cls, v):
        if not 1 <= v <= 65535:
            raise ValueError("API_PORT must be between 1 and 65535")
        return v

    @field_validator("ENVIRONMENT")
    def validate_environment(cls, v):
        allowed = ["development", "staging", "production", "testing"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v

    @field_validator("DB_TYPE")
    def validate_db_type(cls, v):
        allowed = ["postgresql", "mysql", "sqlite"]
        if v not in allowed:
            raise ValueError(f"DB_TYPE must be one of {allowed}")
        return v

    # =====================================================
    # COMPUTED PROPERTIES
    # =====================================================

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT == "testing" or self.TESTING

    @property
    def database_url(self) -> str:
        """Get formatted database URL"""
        if self.DB_TYPE == "postgresql":
            return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        elif self.DB_TYPE == "mysql":
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        else:
            return f"sqlite:///./{self.DB_NAME}.db"




# =====================================================
# SETTINGS INSTANCE
# =====================================================

@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    This ensures settings are only loaded once
    """
    return Settings()


# Create global settings instance
settings = get_settings()

# =====================================================
# EXPORT
# =====================================================

__all__ = ["Settings", "settings", "get_settings"]