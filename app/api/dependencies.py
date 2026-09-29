"""
Kshricash - Authentication Dependencies
FastAPI dependencies for authentication and authorization
"""

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.database import get_db
from app.core.security import decode_token, verify_token
from app.crud.auth import get_user_by_id, get_active_session
from app.models_complete import User, EntityType

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


# =====================================================
# AUTHENTICATION DEPENDENCIES
# =====================================================

async def get_token_from_header(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> str:
    """
    Extract token from Authorization header

    Args:
        credentials: HTTP Authorization credentials

    Returns:
        str: JWT token

    Raises:
        HTTPException: If token is missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Authorization header missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return credentials.credentials


async def get_current_user(
        token: str = Depends(get_token_from_header),
        db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token

    Args:
        token: JWT access token
        db: Database session

    Returns:
        User: Current authenticated user

    Raises:
        HTTPException: If token is invalid or user not found
    """
    # Verify and decode token
    try:
        payload = verify_token(token, token_type="access")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from token
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user = get_user_by_id(db, int(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Check if user is locked
    if user.is_locked:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is locked"
        )

    return user


async def get_current_active_user(
        current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (convenience dependency)

    Args:
        current_user: Current authenticated user

    Returns:
        User: Current active user
    """
    return current_user


# =====================================================
# OPTIONAL AUTHENTICATION
# =====================================================

async def get_current_user_optional(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if token is provided, otherwise return None
    Useful for endpoints that work with or without authentication

    Args:
        credentials: HTTP Authorization credentials (optional)
        db: Database session

    Returns:
        User or None
    """
    if not credentials:
        return None

    try:
        token = credentials.credentials
        payload = verify_token(token, token_type="access")
        user_id = payload.get("sub")

        if user_id:
            user = get_user_by_id(db, int(user_id))
            if user and user.is_active and not user.is_locked:
                return user

    except Exception as e:
        logger.warning(f"Optional auth failed: {str(e)}")

    return None


# =====================================================
# ROLE-BASED ACCESS CONTROL
# =====================================================

class RoleChecker:
    """
    Dependency class for role-based access control

    Usage:
        @app.get("/admin")
        def admin_route(user: User = Depends(RoleChecker(allowed_roles=["admin"]))):
            return {"message": "Admin access granted"}
    """

    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if user has required role

        Args:
            current_user: Current authenticated user

        Returns:
            User: Current user if authorized

        Raises:
            HTTPException: If user doesn't have required role
        """
        user_roles = current_user.roles or []

        if not any(role in self.allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(self.allowed_roles)}"
            )

        return current_user


class EntityTypeChecker:
    """
    Dependency class for entity type-based access control

    Usage:
        @app.get("/partner")
        def partner_route(
            user: User = Depends(EntityTypeChecker(allowed_types=["partner", "distributor"]))
        ):
            return {"message": "Partner access granted"}
    """

    def __init__(self, allowed_types: list[str]):
        self.allowed_types = [EntityType(t) for t in allowed_types]

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if user has required entity type

        Args:
            current_user: Current authenticated user

        Returns:
            User: Current user if authorized

        Raises:
            HTTPException: If user doesn't have required entity type
        """
        if current_user.entity_type not in self.allowed_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required entity types: {', '.join([t.value for t in self.allowed_types])}"
            )

        return current_user


# =====================================================
# PERMISSION CHECKER
# =====================================================

class PermissionChecker:
    """
    Dependency class for permission-based access control

    Usage:
        @app.post("/transaction")
        def create_transaction(
            user: User = Depends(PermissionChecker(required_permissions=["transaction.create"]))
        ):
            return {"message": "Transaction created"}
    """

    def __init__(self, required_permissions: list[str]):
        self.required_permissions = required_permissions

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if user has required permissions

        Args:
            current_user: Current authenticated user

        Returns:
            User: Current user if authorized

        Raises:
            HTTPException: If user doesn't have required permissions
        """
        user_permissions = current_user.permissions or []

        missing_permissions = [
            perm for perm in self.required_permissions
            if perm not in user_permissions
        ]

        if missing_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing_permissions)}"
            )

        return current_user


# =====================================================
# SUPERADMIN CHECKER
# =====================================================

def is_superadmin(current_user: User = Depends(get_current_user)) -> User:
    """
    Check if user is superadmin

    Args:
        current_user: Current authenticated user

    Returns:
        User: Current user if superadmin

    Raises:
        HTTPException: If user is not superadmin
    """
    if current_user.entity_type != EntityType.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required"
        )

    return current_user


# =====================================================
# EMAIL VERIFICATION CHECKER
# =====================================================

def require_verified_email(current_user: User = Depends(get_current_user)) -> User:
    """
    Check if user's email is verified

    Args:
        current_user: Current authenticated user

    Returns:
        User: Current user if email verified

    Raises:
        HTTPException: If email is not verified
    """
    if not current_user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )

    return current_user


# =====================================================
# KYC VERIFICATION CHECKER
# =====================================================

def require_kyc_verified(current_user: User = Depends(get_current_user)) -> User:
    """
    Check if user's KYC is verified

    Args:
        current_user: Current authenticated user

    Returns:
        User: Current user if KYC verified

    Raises:
        HTTPException: If KYC is not verified
    """
    from app.models_complete import KYCStatus

    if current_user.kyc_status != KYCStatus.VERIFIED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="KYC verification required"
        )

    return current_user


# =====================================================
# SESSION VALIDATION
# =====================================================

def validate_session(
        token: str = Depends(get_token_from_header),
        db: Session = Depends(get_db)
) -> User:
    """
    Validate session exists in database
    (More secure than just JWT validation)

    Args:
        token: JWT access token
        db: Database session

    Returns:
        User: Current user

    Raises:
        HTTPException: If session is invalid
    """
    # First get current user
    current_user = get_current_user(token, db)

    # Check if session exists and is valid
    session = get_active_session(db, token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return current_user


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    # Basic auth
    "get_token_from_header",
    "get_current_user",
    "get_current_active_user",
    "get_current_user_optional",

    # Role-based
    "RoleChecker",
    "EntityTypeChecker",
    "PermissionChecker",
    "is_superadmin",

    # Verification checkers
    "require_verified_email",
    "require_kyc_verified",

    # Session validation
    "validate_session",
]