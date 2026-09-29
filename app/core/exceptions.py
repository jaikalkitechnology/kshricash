"""
VasuPay - Custom Exceptions
Centralized exception definitions for better error handling
"""

from fastapi import HTTPException, status
from typing import Any, Optional


# =====================================================
# AUTHENTICATION EXCEPTIONS
# =====================================================

class AuthenticationException(HTTPException):
    """Base authentication exception"""

    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsException(AuthenticationException):
    """Invalid username or password"""

    def __init__(self):
        super().__init__(detail="Invalid phone number or password")


class AccountLockedException(AuthenticationException):
    """Account is locked"""

    def __init__(self, locked_until: Optional[str] = None):
        detail = "Account is locked"
        if locked_until:
            detail += f" until {locked_until}"
        super().__init__(detail=detail)


class AccountInactiveException(AuthenticationException):
    """Account is inactive"""

    def __init__(self):
        super().__init__(detail="Account is inactive. Please contact support")


class AccountSuspendedException(AuthenticationException):
    """Account is suspended"""

    def __init__(self):
        super().__init__(detail="Account is suspended. Please contact support")


class InvalidTokenException(AuthenticationException):
    """Invalid or expired token"""

    def __init__(self, detail: str = "Invalid or expired token"):
        super().__init__(detail=detail)


class TokenExpiredException(AuthenticationException):
    """Token has expired"""

    def __init__(self):
        super().__init__(detail="Token has expired")


# =====================================================
# AUTHORIZATION EXCEPTIONS
# =====================================================

class PermissionDeniedException(HTTPException):
    """User doesn't have required permissions"""

    def __init__(self, detail: str = "Permission denied"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )


class InsufficientPermissionsException(PermissionDeniedException):
    """User lacks required permissions"""

    def __init__(self, required_permission: str):
        super().__init__(
            detail=f"Insufficient permissions. Required: {required_permission}"
        )


# =====================================================
# VALIDATION EXCEPTIONS
# =====================================================

class ValidationException(HTTPException):
    """Base validation exception"""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
        )


class InvalidPhoneNumberException(ValidationException):
    """Invalid phone number format"""

    def __init__(self):
        super().__init__(
            detail="Invalid phone number format. Must be 10 digits starting with 6-9"
        )


class InvalidEmailException(ValidationException):
    """Invalid email format"""

    def __init__(self):
        super().__init__(detail="Invalid email format")


class WeakPasswordException(ValidationException):
    """Password doesn't meet strength requirements"""

    def __init__(self, reason: str):
        super().__init__(detail=f"Weak password: {reason}")


class InvalidMPINException(ValidationException):
    """Invalid MPIN"""

    def __init__(self, reason: str = "Invalid MPIN"):
        super().__init__(detail=reason)


# =====================================================
# RESOURCE EXCEPTIONS
# =====================================================

class ResourceNotFoundException(HTTPException):
    """Resource not found"""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with identifier '{identifier}' not found",
        )


class UserNotFoundException(ResourceNotFoundException):
    """User not found"""

    def __init__(self, identifier: Any):
        super().__init__("User", identifier)


class EntityNotFoundException(ResourceNotFoundException):
    """Entity not found"""

    def __init__(self, entity_type: str, identifier: Any):
        super().__init__(entity_type, identifier)


# =====================================================
# CONFLICT EXCEPTIONS
# =====================================================

class ConflictException(HTTPException):
    """Resource conflict"""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class UserAlreadyExistsException(ConflictException):
    """User already exists"""

    def __init__(self, field: str, value: str):
        super().__init__(detail=f"User with {field} '{value}' already exists")


class DuplicateResourceException(ConflictException):
    """Duplicate resource"""

    def __init__(self, resource: str, field: str):
        super().__init__(detail=f"{resource} with this {field} already exists")


# =====================================================
# BUSINESS LOGIC EXCEPTIONS
# =====================================================

class BusinessLogicException(HTTPException):
    """Base business logic exception"""

    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


class InsufficientBalanceException(BusinessLogicException):
    """Insufficient wallet balance"""

    def __init__(self, available: float, required: float):
        super().__init__(
            detail=f"Insufficient balance. Available: ₹{available}, Required: ₹{required}"
        )


class TransactionLimitExceededException(BusinessLogicException):
    """Transaction limit exceeded"""

    def __init__(self, limit_type: str, limit: float):
        super().__init__(
            detail=f"{limit_type} limit of ₹{limit} exceeded"
        )


class KYCNotCompletedException(BusinessLogicException):
    """KYC not completed"""

    def __init__(self):
        super().__init__(detail="KYC verification is required to perform this action")


class ServiceNotAvailableException(BusinessLogicException):
    """Service not available"""

    def __init__(self, service_name: str):
        super().__init__(detail=f"Service '{service_name}' is not available")


# =====================================================
# OTP EXCEPTIONS
# =====================================================

class OTPException(HTTPException):
    """Base OTP exception"""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )


class InvalidOTPException(OTPException):
    """Invalid OTP"""

    def __init__(self):
        super().__init__(detail="Invalid OTP")


class OTPExpiredException(OTPException):
    """OTP has expired"""

    def __init__(self):
        super().__init__(detail="OTP has expired. Please request a new one")


class OTPAttemptsExceededException(OTPException):
    """Too many OTP attempts"""

    def __init__(self):
        super().__init__(detail="Too many failed OTP attempts. Please request a new one")


class OTPCooldownException(OTPException):
    """OTP resend cooldown active"""

    def __init__(self, seconds: int):
        super().__init__(detail=f"Please wait {seconds} seconds before requesting new OTP")


# =====================================================
# RATE LIMIT EXCEPTIONS
# =====================================================

class RateLimitExceededException(HTTPException):
    """Rate limit exceeded"""

    def __init__(self, retry_after: Optional[int] = None):
        headers = {}
        if retry_after:
            headers["Retry-After"] = str(retry_after)

        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later",
            headers=headers,
        )


# =====================================================
# SERVER EXCEPTIONS
# =====================================================

class InternalServerException(HTTPException):
    """Internal server error"""

    def __init__(self, detail: str = "An internal error occurred"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
        )


class ServiceUnavailableException(HTTPException):
    """Service temporarily unavailable"""

    def __init__(self, detail: str = "Service temporarily unavailable"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail,
        )


class ExternalServiceException(HTTPException):
    """External service error"""

    def __init__(self, service: str, detail: str):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"{service} error: {detail}",
        )


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    # Authentication
    "AuthenticationException",
    "InvalidCredentialsException",
    "AccountLockedException",
    "AccountInactiveException",
    "AccountSuspendedException",
    "InvalidTokenException",
    "TokenExpiredException",

    # Authorization
    "PermissionDeniedException",
    "InsufficientPermissionsException",

    # Validation
    "ValidationException",
    "InvalidPhoneNumberException",
    "InvalidEmailException",
    "WeakPasswordException",
    "InvalidMPINException",

    # Resources
    "ResourceNotFoundException",
    "UserNotFoundException",
    "EntityNotFoundException",

    # Conflicts
    "ConflictException",
    "UserAlreadyExistsException",
    "DuplicateResourceException",

    # Business Logic
    "BusinessLogicException",
    "InsufficientBalanceException",
    "TransactionLimitExceededException",
    "KYCNotCompletedException",
    "ServiceNotAvailableException",

    # OTP
    "OTPException",
    "InvalidOTPException",
    "OTPExpiredException",
    "OTPAttemptsExceededException",
    "OTPCooldownException",

    # Rate Limiting
    "RateLimitExceededException",

    # Server
    "InternalServerException",
    "ServiceUnavailableException",
    "ExternalServiceException",
]