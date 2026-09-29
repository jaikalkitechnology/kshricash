"""
VasuPay - Core Security Module
Password hashing, JWT tokens, and security utilities
No Redis dependency - uses database for token management
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import hashlib
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from app.config import settings

# =====================================================
# PASSWORD HASHING
# =====================================================

# Password context for bcrypt hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Args:
        plain_password: Plain text password
        hashed_password: Hashed password from database

    Returns:
        bool: True if password matches
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt

    Args:
        password: Plain text password

    Returns:
        str: Hashed password
    """
    return pwd_context.hash(password)


def verify_mpin(plain_mpin: str, hashed_mpin: str) -> bool:
    """
    Verify MPIN (4-digit PIN)

    Args:
        plain_mpin: Plain text MPIN
        hashed_mpin: Hashed MPIN from database

    Returns:
        bool: True if MPIN matches
    """
    return pwd_context.verify(plain_mpin, hashed_mpin)


def get_mpin_hash(mpin: str) -> str:
    """
    Hash MPIN using bcrypt

    Args:
        mpin: Plain text MPIN (4 digits)

    Returns:
        str: Hashed MPIN
    """
    return pwd_context.hash(mpin)


# =====================================================
# JWT TOKEN MANAGEMENT
# =====================================================

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token

    Args:
        data: Data to encode in token (typically user_id, entity_type)
        expires_delta: Optional custom expiration time

    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create JWT refresh token (longer expiration)

    Args:
        data: Data to encode in token

    Returns:
        str: Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode JWT token

    Args:
        token: JWT token string
        token_type: Type of token (access or refresh)

    Returns:
        dict: Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Check token type
        if payload.get("type") != token_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {token_type}",
            )

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode token without verification (for inspection)

    Args:
        token: JWT token string

    Returns:
        dict: Decoded payload or None if invalid
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}  # Don't verify expiration
        )
        return payload
    except JWTError:
        return None


# =====================================================
# PASSWORD RESET TOKEN (Database-based, no Redis)
# =====================================================

def create_password_reset_token(user_id: int) -> str:
    """
    Create a secure token for password reset
    This will be stored in database with expiration

    Args:
        user_id: User ID

    Returns:
        str: Secure random token
    """
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    return token


def create_email_verification_token(user_id: int, email: str) -> str:
    """
    Create token for email verification

    Args:
        user_id: User ID
        email: Email to verify

    Returns:
        str: Secure token
    """
    token = secrets.token_urlsafe(32)
    return token


# =====================================================
# OTP GENERATION (Database-based)
# =====================================================

def generate_otp(length: int = 6) -> str:
    """
    Generate numeric OTP

    Args:
        length: Length of OTP (default 6)

    Returns:
        str: Numeric OTP
    """
    # Generate secure random OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(length)])
    return otp


def hash_otp(otp: str) -> str:
    """
    Hash OTP for secure storage

    Args:
        otp: Plain OTP

    Returns:
        str: Hashed OTP
    """
    return hashlib.sha256(otp.encode()).hexdigest()


def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """
    Verify OTP against hash

    Args:
        plain_otp: Plain OTP from user
        hashed_otp: Hashed OTP from database

    Returns:
        bool: True if OTP matches
    """
    return hash_otp(plain_otp) == hashed_otp


# =====================================================
# SESSION TOKEN MANAGEMENT
# =====================================================

def create_session_token() -> str:
    """
    Create a unique session token

    Returns:
        str: Session token
    """
    return secrets.token_urlsafe(32)


def create_device_id(user_agent: str, ip_address: str) -> str:
    """
    Create a device fingerprint

    Args:
        user_agent: Browser user agent
        ip_address: IP address

    Returns:
        str: Device ID hash
    """
    data = f"{user_agent}:{ip_address}"
    return hashlib.sha256(data.encode()).hexdigest()


# =====================================================
# API KEY MANAGEMENT
# =====================================================

def generate_api_key() -> str:
    """
    Generate secure API key

    Returns:
        str: API key
    """
    return f"vp_{secrets.token_urlsafe(32)}"


def generate_api_secret() -> str:
    """
    Generate API secret

    Returns:
        str: API secret
    """
    return secrets.token_urlsafe(48)


# =====================================================
# PASSWORD VALIDATION
# =====================================================

def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength

    Rules:
    - Minimum 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character

    Args:
        password: Password to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"

    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"

    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"

    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"

    special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    if not any(c in special_chars for c in password):
        return False, "Password must contain at least one special character"

    return True, "Password is valid"


def validate_mpin(mpin: str) -> tuple[bool, str]:
    """
    Validate MPIN

    Args:
        mpin: MPIN to validate

    Returns:
        tuple: (is_valid, error_message)
    """
    if not mpin.isdigit():
        return False, "MPIN must contain only digits"

    if len(mpin) != settings.MPIN_LENGTH:
        return False, f"MPIN must be exactly {settings.MPIN_LENGTH} digits"

    # Check for sequential numbers
    if mpin in ["0123", "1234", "2345", "3456", "4567", "5678", "6789"]:
        return False, "MPIN cannot be sequential numbers"

    # Check for repeated digits
    if len(set(mpin)) == 1:
        return False, "MPIN cannot be all same digits"

    return True, "MPIN is valid"


# =====================================================
# UTILITY FUNCTIONS
# =====================================================

def get_token_from_header(authorization: str) -> str:
    """
    Extract token from Authorization header

    Args:
        authorization: Authorization header value (e.g., "Bearer token123")

    Returns:
        str: Token

    Raises:
        HTTPException: If header format is invalid
    """
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError("Invalid authentication scheme")
        return token
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_credentials_exception(detail: str = "Could not validate credentials") -> HTTPException:
    """
    Create standard credentials exception

    Args:
        detail: Error detail message

    Returns:
        HTTPException: Credentials exception
    """
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    # Password hashing
    "verify_password",
    "get_password_hash",
    "verify_mpin",
    "get_mpin_hash",

    # JWT tokens
    "create_access_token",
    "create_refresh_token",
    "verify_token",
    "decode_token",

    # Password reset
    "create_password_reset_token",
    "create_email_verification_token",

    # OTP
    "generate_otp",
    "hash_otp",
    "verify_otp_hash",

    # Session management
    "create_session_token",
    "create_device_id",

    # API keys
    "generate_api_key",
    "generate_api_secret",

    # Validation
    "validate_password_strength",
    "validate_mpin",

    # Utilities
    "get_token_from_header",
    "create_credentials_exception",
]