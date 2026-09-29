"""
VasuPay - Service Routes
BBPS, AEPS, DMT, Recharge service operations
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, Service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/services", tags=["Services"])


# =====================================================
# LIST AVAILABLE SERVICES
# =====================================================

@router.get(
    "/",
    summary="List available services",
)
def list_services(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List all available payment services.
    """
    providers = db.query(Service).filter(Service.is_active == True).all()

    return {
        "services": [
            {
                "id": p.id,
                "name": p.name,
                "service_type": p.service_type,
                "is_active": p.is_active,
            }
            for p in providers
        ],
    }


# =====================================================
# SERVICE CATEGORIES
# =====================================================

@router.get(
    "/categories",
    summary="List service categories",
)
def list_service_categories(
    current_user: User = Depends(get_current_active_user),
):
    """
    List available service categories.
    """
    return {
        "categories": [
            {"code": "bbps", "name": "BBPS - Bill Payments"},
            {"code": "aeps", "name": "AEPS - Cash Withdrawal"},
            {"code": "dmt", "name": "DMT - Money Transfer"},
            {"code": "recharge", "name": "Mobile/DTH Recharge"},
            {"code": "utility", "name": "Utility Payments"},
        ]
    }
