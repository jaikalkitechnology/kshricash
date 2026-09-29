"""
Kshricash - Authentication Schemas
Pydantic models for authentication request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import re

from pydantic.v1 import validator


# =====================================================
# REQUEST SCHEMAS
# =====================================================

class RegisterRequest(BaseModel):
    """User registration request"""
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name")
    phone: str = Field(..., min_length=10, max_length=10, description="10-digit phone number")
    email: Optional[EmailStr] = Field(None, description="Email address (optional)")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    entity_type: str = Field(..., description="Entity type (retailer, partner, distributor, etc.)")

    # Optional fields for hierarchy
    parent_id: Optional[int] = Field(None, description="Parent user ID (for hierarchy)")
    white_label_id: Optional[int] = None
    agency_id: Optional[int] = None
    distributor_id: Optional[int] = None
    partner_id: Optional[int] = None
    retailer_id: Optional[int] = None

    @validator('phone')
    def validate_phone(cls, v):
        """Validate Indian phone number"""
        if not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Phone must be 10 digits starting with 6-9')
        return v

    @validator('password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe",
                "phone": "9876543210",
                "email": "john@example.com",
                "password": "SecurePass@123",
                "entity_type": "retailer",
                "partner_id": 1
            }
        }


class LoginRequest(BaseModel):
    """User login request"""
    phone: str = Field(..., description="Phone number")
    password: str = Field(..., description="Password")
    device_id: Optional[str] = Field(None, description="Device ID for session tracking")
    device_name: Optional[str] = Field(None, description="Device name")

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number"""
        if not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid phone number format')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "phone": "9876543210",
                "password": "SecurePass@123",
                "device_name": "Chrome on Windows"
            }
        }


class ForgotPasswordRequest(BaseModel):
    """Forgot password request"""
    phone: Optional[str] = Field(None, description="Phone number")
    email: Optional[EmailStr] = Field(None, description="Email address")

    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^[6-9]\d{9}$', v):
            raise ValueError('Invalid phone number format')
        return v

    @validator('email')
    def validate_email_or_phone(cls, v, values):
        """Ensure either phone or email is provided"""
        if not v and not values.get('phone'):
            raise ValueError('Either phone or email must be provided')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com"
            }
        }


class ResetPasswordRequest(BaseModel):
    """Reset password with token"""
    token: str = Field(..., description="Password reset token from email")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @validator('new_password')
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Validate passwords match"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123xyz789",
                "new_password": "NewSecure@123",
                "confirm_password": "NewSecure@123"
            }
        }


class ChangePasswordRequest(BaseModel):
    """Change password (when logged in)"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")
    confirm_password: str = Field(..., description="Confirm new password")

    @validator('new_password')
    def validate_password(cls, v, values):
        """Validate new password"""
        if 'current_password' in values and v == values['current_password']:
            raise ValueError('New password must be different from current password')

        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        """Validate passwords match"""
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "OldPass@123",
                "new_password": "NewSecure@123",
                "confirm_password": "NewSecure@123"
            }
        }


class RefreshTokenRequest(BaseModel):
    """Refresh access token"""
    refresh_token: str = Field(..., description="Refresh token")

    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }


class VerifyEmailRequest(BaseModel):
    """Email verification request"""
    token: str = Field(..., description="Email verification token")

    class Config:
        json_schema_extra = {
            "example": {
                "token": "abc123xyz789"
            }
        }


class ResendVerificationRequest(BaseModel):
    """Resend verification email"""
    email: EmailStr = Field(..., description="Email address")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john@example.com"
            }
        }


# =====================================================
# RESPONSE SCHEMAS
# =====================================================

class TokenResponse(BaseModel):
    """Token response"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }


class LoginResponse(BaseModel):
    """Login response with tokens and user info"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800,
                "user": {
                    "id": 1,
                    "phone": "9876543210",
                    "full_name": "John Doe",
                    "email": "john@example.com",
                    "entity_type": "retailer",
                    "status": "active"
                }
            }
        }


class RegisterResponse(BaseModel):
    """Registration response"""
    message: str = Field(..., description="Success message")
    user_id: int = Field(..., description="Created user ID")
    phone: str = Field(..., description="User phone number")
    email: Optional[str] = Field(None, description="User email")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Registration successful. Please verify your email",
                "user_id": 1,
                "phone": "9876543210",
                "email": "john@example.com"
            }
        }


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str = Field(..., description="Response message")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Operation completed successfully"
            }
        }


class UserInfoResponse(BaseModel):
    """User information response"""
    id: int
    uuid: str
    phone: str
    email: Optional[str]
    full_name: str
    entity_type: str
    status: str
    kyc_status: str
    is_active: bool
    email_verified: bool
    phone_verified: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True
        json_json_schema_extra = {
            "example": {
                "id": 1,
                "uuid": "123e4567-e89b-12d3-a456-426614174000",
                "phone": "9876543210",
                "email": "john@example.com",
                "full_name": "John Doe",
                "entity_type": "retailer",
                "status": "active",
                "kyc_status": "pending",
                "is_active": True,
                "email_verified": True,
                "phone_verified": True,
                "created_at": "2024-02-05T10:30:00",
                "last_login": "2024-02-05T10:30:00"
            }
        }


# =====================================================
# ERROR RESPONSE
# =====================================================

class ErrorResponse(BaseModel):
    """Error response"""
    detail: str = Field(..., description="Error detail message")
    error_code: Optional[str] = Field(None, description="Error code")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid credentials",
                "error_code": "AUTH_001"
            }
        }


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    # Request schemas
    "RegisterRequest",
    "LoginRequest",
    "ForgotPasswordRequest",
    "ResetPasswordRequest",
    "ChangePasswordRequest",
    "RefreshTokenRequest",
    "VerifyEmailRequest",
    "ResendVerificationRequest",

    # Response schemas
    "TokenResponse",
    "LoginResponse",
    "RegisterResponse",
    "MessageResponse",
    "UserInfoResponse",
    "ErrorResponse",
]