"""
Kshricash - Authentication CRUD Operations
Database operations for authentication (MySQL, no Redis)
"""
import uuid

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets

from app.models_complete import (
    User, UserSession, EntityType, UserStatus, KYCStatus, Wallet, WalletPurpose
)
from app.core.security import (
    get_password_hash, verify_password, create_session_token, create_device_id
)
from app.core.exceptions import (
    UserNotFoundException, InvalidCredentialsException,
    AccountLockedException, AccountInactiveException, UserAlreadyExistsException
)
from app.config import settings


# =====================================================
# PASSWORD RESET TOKEN MODEL (Database Storage)
# =====================================================

class PasswordResetTokenManager:
    """Manage password reset tokens in database (no Redis)"""

    @staticmethod
    def create_reset_token(db: Session, user_id: int) -> str:
        """Create and store password reset token"""
        from app.models_complete import OTPLog, get_india_time

        # Generate token
        token = secrets.token_urlsafe(32)

        # Store in database
        reset_record = OTPLog(
            recipient_type="EMAIL",
            recipient_value=str(user_id),
            otp_code=token,
            purpose="PASSWORD_RESET",
            expires_at=get_india_time() + timedelta(hours=1)
        )
        db.add(reset_record)
        db.commit()

        return token

    @staticmethod
    def verify_reset_token(db: Session, token: str) -> Optional[int]:
        """Verify password reset token and return user_id"""
        from app.models_complete import OTPLog, get_india_time

        # Find token
        reset_record = db.query(OTPLog).filter(
            and_(
                OTPLog.otp_code == token,
                OTPLog.purpose == "PASSWORD_RESET",
                OTPLog.is_verified == False,
                OTPLog.expires_at > get_india_time()
            )
        ).first()

        if not reset_record:
            return None

        # Mark as verified
        reset_record.is_verified = True
        reset_record.verified_at = get_india_time()
        db.commit()

        return int(reset_record.recipient_value)

    @staticmethod
    def invalidate_user_tokens(db: Session, user_id: int):
        """Invalidate all reset tokens for user"""
        from app.models_complete import OTPLog

        db.query(OTPLog).filter(
            and_(
                OTPLog.recipient_value == str(user_id),
                OTPLog.purpose == "PASSWORD_RESET",
                OTPLog.is_verified == False
            )
        ).update({"is_verified": True})
        db.commit()


# =====================================================
# USER CRUD OPERATIONS
# =====================================================

def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    """Get user by phone number"""
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: Dict[str, Any]) -> User:
    """
    Create new user with validation

    Args:
        db: Database session
        user_data: User data dictionary

    Returns:
        User: Created user object

    Raises:
        UserAlreadyExistsException: If phone/email already exists
    """
    # Check if user exists
    if get_user_by_phone(db, user_data['phone']):
        raise UserAlreadyExistsException('phone', user_data['phone'])

    if user_data.get('email') and get_user_by_email(db, user_data['email']):
        raise UserAlreadyExistsException('email', user_data['email'])

    # Hash password
    user_data['password_hash'] = get_password_hash(user_data.pop('password'))

    # Create user
    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create default wallet
    create_default_wallet(db, user.id)

    return user


def create_default_wallet(db: Session, user_id: int):
    """Create default main wallet for user"""
    wallet = Wallet(
        user_id=user_id,
        purpose=WalletPurpose.MAIN,
        name="Main Wallet",
        balance=0.00,
        locked_balance=0.00
    )
    db.add(wallet)
    db.commit()


def authenticate_user(db: Session, phone: str, password: str) -> User:
    """
    Authenticate user with phone and password

    Args:
        db: Database session
        phone: Phone number
        password: Plain password

    Returns:
        User: Authenticated user

    Raises:
        InvalidCredentialsException: If credentials invalid
        AccountLockedException: If account is locked
        AccountInactiveException: If account is inactive
    """
    user = get_user_by_phone(db, phone)

    if not user:
        raise InvalidCredentialsException()

    # Check if account is locked
    if user.is_locked:
        if user.locked_until and user.locked_until > datetime.now():
            raise AccountLockedException(user.locked_until.strftime('%Y-%m-%d %H:%M:%S'))
        else:
            # Unlock if lock period expired
            user.is_locked = False
            user.locked_until = None
            user.login_attempts = 0
            db.commit()

    # Verify password
    if not verify_password(password, user.password_hash):
        # Increment failed attempts
        user.login_attempts += 1

        # Lock account after max attempts
        if user.login_attempts >= settings.MPIN_MAX_ATTEMPTS:
            user.is_locked = True
            user.locked_until = datetime.now() + timedelta(minutes=settings.MPIN_LOCK_DURATION_MINUTES)

        db.commit()
        raise InvalidCredentialsException()

    # Check account status
    if not user.is_active or user.status != UserStatus.ACTIVE:
        raise AccountInactiveException()

    # Reset login attempts on successful login
    user.login_attempts = 0
    user.last_login = datetime.now()
    db.commit()

    return user


def gen_session_id():
    return f"session-{uuid.uuid4()}"
def create_user_session(
    db: Session,
    user_id: int,
    ip_address: str,
    user_agent: str,
    device_id: Optional[str] = None,
    device_name: Optional[str] = None
) -> UserSession:
    """Create user session"""
    session = UserSession(
        user_id=user_id,
        session_id=gen_session_id(),
        session_token=create_session_token(),
        device_id=device_id or create_device_id(user_agent, ip_address),
        device_name=device_name,
        device_type="WEB",
        ip_address=ip_address,
        user_agent=user_agent,
        expires_at=datetime.now() + timedelta(hours=settings.SESSION_EXPIRE_HOURS)
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_active_session(db: Session, session_token: str) -> Optional[UserSession]:
    """Get active session by token"""
    return db.query(UserSession).filter(
        and_(
            UserSession.session_token == session_token,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.now()
        )
    ).first()


def invalidate_session(db: Session, session_token: str):
    """Invalidate session"""
    session = db.query(UserSession).filter(UserSession.session_token == session_token).first()
    if session:
        session.is_active = False
        session.logged_out_at = datetime.now()
        db.commit()


def invalidate_all_user_sessions(db: Session, user_id: int):
    """Invalidate all sessions for user"""
    db.query(UserSession).filter(
        and_(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        )
    ).update({"is_active": False, "logged_out_at": datetime.now()})
    db.commit()


def update_password(db: Session, user_id: int, new_password: str):
    """Update user password"""
    user = get_user_by_id(db, user_id)
    if not user:
        raise UserNotFoundException(user_id)

    user.password_hash = get_password_hash(new_password)
    db.commit()

    # Invalidate all sessions
    invalidate_all_user_sessions(db, user_id)


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    "PasswordResetTokenManager",
    "get_user_by_phone",
    "get_user_by_email",
    "get_user_by_id",
    "create_user",
    "authenticate_user",
    "create_user_session",
    "get_active_session",
    "invalidate_session",
    "invalidate_all_user_sessions",
    "update_password"
    ]