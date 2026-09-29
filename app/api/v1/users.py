"""
VasuPay - User Routes
User profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


# =====================================================
# PROFILE
# =====================================================

@router.get(
    "/profile",
    summary="Get current user profile",
)
def get_profile(
    current_user: User = Depends(get_current_active_user),
):
    """
    Get the authenticated user's full profile.
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


@router.put(
    "/profile",
    summary="Update current user profile",
)
def update_profile(
    full_name: str = None,
    email: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update the authenticated user's profile fields.
    """
    if full_name:
        current_user.full_name = full_name
    if email:
        current_user.email = email
        current_user.email_verified = False

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}
