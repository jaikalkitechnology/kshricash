"""
Kshricash - Authentication Routes
Register, Login, Logout, Forgot Password, Reset Password, Change Password, Refresh Token
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    RefreshTokenRequest,
    LoginResponse,
    RegisterResponse,
    MessageResponse,
    TokenResponse,
    ErrorResponse,
)
from app.crud.auth import (
    get_user_by_phone,
    get_user_by_email,
    get_user_by_id,
    create_user,
    authenticate_user,
    create_user_session,
    invalidate_session,
    invalidate_all_user_sessions,
    update_password,
    PasswordResetTokenManager,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_token,
    generate_otp,
)
from app.api.dependencies import get_current_user, get_current_active_user
from app.models_complete import User, UserStatus
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# =====================================================
# REGISTER
# =====================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    responses={409: {"model": ErrorResponse}},
    summary="Register a new user",
)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.

    - Validates phone (Indian 10-digit) and password strength
    - Creates user with hashed password
    - Creates default main wallet
    - Returns user ID and confirmation message
    """
    user_data = {
        "full_name": request.full_name,
        "phone": request.phone,
        "password": request.password,
        "entity_type": request.entity_type,
        "status": UserStatus.ACTIVE,
        "is_active": True,
    }

    if request.email:
        user_data["email"] = request.email
    if request.parent_id:
        user_data["parent_id"] = request.parent_id
    if request.white_label_id:
        user_data["white_label_id"] = request.white_label_id
    if request.agency_id:
        user_data["agency_id"] = request.agency_id
    if request.distributor_id:
        user_data["distributor_id"] = request.distributor_id
    if request.partner_id:
        user_data["partner_id"] = request.partner_id
    if request.retailer_id:
        user_data["retailer_id"] = request.retailer_id

    user = create_user(db, user_data)

    return RegisterResponse(
        message="Registration successful. Please verify your email.",
        user_id=user.id,
        phone=user.phone,
        email=user.email,
    )


# =====================================================
# LOGIN
# =====================================================

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={401: {"model": ErrorResponse}, 403: {"model": ErrorResponse}},
    summary="Login with phone and password",
)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """
    Authenticate user with phone number and password.

    - Validates credentials
    - Tracks failed login attempts (locks account after max attempts)
    - Creates session with device tracking
    - Returns JWT access + refresh tokens
    """
    user = authenticate_user(db, request.phone, request.password)

    # Create session
    ip_address = req.client.host if req.client else "unknown"
    user_agent = req.headers.get("user-agent", "unknown")

    session = create_user_session(
        db=db,
        user_id=user.id,
        ip_address=ip_address,
        user_agent=user_agent,
        device_id=request.device_id,
        device_name=request.device_name,
    )

    # Generate tokens
    token_data = {
        "sub": str(user.id),
        "entity_type": user.entity_type.value if hasattr(user.entity_type, "value") else user.entity_type,
        "session_token": session.session_token,
    }

    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user={
            "id": user.id,
            "phone": user.phone,
            "full_name": user.full_name,
            "email": user.email,
            "entity_type": user.entity_type.value if hasattr(user.entity_type, "value") else user.entity_type,
            "status": user.status.value if hasattr(user.status, "value") else user.status,
        },
    )


# =====================================================
# LOGOUT
# =====================================================

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current session",
)
def logout(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Logout and invalidate the current session.
    """
    invalidate_all_user_sessions(db, current_user.id)

    return MessageResponse(message="Logged out successfully")


# =====================================================
# FORGOT PASSWORD
# =====================================================

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    responses={404: {"model": ErrorResponse}},
    summary="Request password reset",
)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset token.

    - Accepts phone or email to identify the user
    - Generates a secure reset token (stored in DB, valid for 1 hour)
    - In production, the token would be sent via SMS/email
    - Returns a generic success message (does not reveal if user exists)
    """
    user = None

    if request.phone:
        user = get_user_by_phone(db, request.phone)
    elif request.email:
        user = get_user_by_email(db, request.email)

    if not user:
        # Return generic message to prevent user enumeration
        return MessageResponse(
            message="If an account with that information exists, a password reset link has been sent."
        )

    # Check account status
    if not user.is_active:
        return MessageResponse(
            message="If an account with that information exists, a password reset link has been sent."
        )

    # Invalidate any existing reset tokens for this user
    PasswordResetTokenManager.invalidate_user_tokens(db, user.id)

    # Generate new reset token
    reset_token = PasswordResetTokenManager.create_reset_token(db, user.id)

    # Generate OTP for SMS-based recovery
    otp = generate_otp(length=settings.OTP_LENGTH)

    # Audit the OTP generation (the code itself is never stored).
    try:
        from app.services import audit_service
        audit_service.record(
            channel=audit_service.CHANNEL_OTP, action="OTP_GENERATE",
            status=audit_service.STATUS_SUCCESS, provider="Internal",
            user_id=user.id, actor_name=user.full_name, actor_phone=user.phone,
            mobile_number=user.phone, response_message="Password-reset OTP generated",
        )
    except Exception:  # pragma: no cover - auditing must never break the flow
        pass

    # TODO: Send reset token via email and/or OTP via SMS
    # In production, integrate with SMS/email providers:
    #   - Email: send_email(user.email, "Password Reset", f"Your reset token: {reset_token}")
    #   - SMS: send_sms(user.phone, f"Your Kshricash OTP is {otp}")

    logger.info(f"Password reset requested for user_id={user.id}")

    # In development, log the token for testing
    if settings.is_development:
        logger.info(f"[DEV] Reset token for user {user.id}: {reset_token}")

    return MessageResponse(
        message="If an account with that information exists, a password reset link has been sent."
    )


# =====================================================
# RESET PASSWORD (using token from forgot-password)
# =====================================================

@router.post(
    "/reset-password",
    response_model=MessageResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Reset password with token",
)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using the token received from forgot-password.

    - Validates the reset token (must be valid and not expired)
    - Validates new password strength
    - Updates password and invalidates all existing sessions
    - Invalidates the used reset token
    """
    # Verify token and get user_id
    user_id = PasswordResetTokenManager.verify_reset_token(db, request.token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Verify user exists
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    # Update password (also invalidates all sessions)
    update_password(db, user_id, request.new_password)

    # Invalidate remaining reset tokens for this user
    PasswordResetTokenManager.invalidate_user_tokens(db, user_id)

    logger.info(f"Password reset completed for user_id={user_id}")

    return MessageResponse(message="Password has been reset successfully. Please login with your new password.")


# =====================================================
# CHANGE PASSWORD (when logged in)
# =====================================================

@router.post(
    "/change-password",
    response_model=MessageResponse,
    responses={400: {"model": ErrorResponse}, 401: {"model": ErrorResponse}},
    summary="Change password (authenticated)",
)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Change password for the currently authenticated user.

    - Verifies current password
    - Validates new password strength
    - Updates password and invalidates all other sessions
    """
    from app.core.security import verify_password

    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Update password (also invalidates all sessions)
    update_password(db, current_user.id, request.new_password)

    logger.info(f"Password changed for user_id={current_user.id}")

    return MessageResponse(message="Password changed successfully. Please login again.")


# =====================================================
# REFRESH TOKEN
# =====================================================

@router.post(
    "/refresh-token",
    response_model=TokenResponse,
    responses={401: {"model": ErrorResponse}},
    summary="Refresh access token",
)
def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Get a new access token using a valid refresh token.

    - Validates the refresh token
    - Issues a new access token (same expiration)
    - Returns new token pair
    """
    try:
        payload = verify_token(request.refresh_token, token_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Verify user still exists and is active
    user = get_user_by_id(db, int(user_id))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Generate new tokens
    token_data = {
        "sub": str(user.id),
        "entity_type": user.entity_type.value if hasattr(user.entity_type, "value") else user.entity_type,
    }

    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# =====================================================
# GET CURRENT USER PROFILE
# =====================================================

@router.get(
    "/me",
    summary="Get current user profile",
)
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Get the profile of the currently authenticated user.
    """
    return {
        "id": current_user.id,
        "uuid": current_user.uuid,
        "phone": current_user.phone,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "entity_type": current_user.entity_type.value if hasattr(current_user.entity_type, "value") else current_user.entity_type,
        "status": current_user.status.value if hasattr(current_user.status, "value") else current_user.status,
        "kyc_status": current_user.kyc_status.value if hasattr(current_user.kyc_status, "value") else current_user.kyc_status,
        "is_active": current_user.is_active,
        "email_verified": current_user.email_verified,
        "phone_verified": current_user.phone_verified,
        "created_at": str(current_user.created_at),
        "last_login": str(current_user.last_login) if current_user.last_login else None,
    }
