"""
VasuPay - Commission Routes
Commission structures and earnings
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, CommissionLedger

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/commissions", tags=["Commissions"])


# =====================================================
# LIST COMMISSIONS
# =====================================================

@router.get(
    "/",
    summary="List commission earnings",
)
def list_commissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List commission earnings for the authenticated user.
    """
    query = (
        db.query(CommissionLedger)
        .filter(CommissionLedger.beneficiary_id == current_user.id)
        .order_by(CommissionLedger.created_at.desc())
    )

    total = query.count()
    commissions = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [
            {
                "id": c.id,
                "amount": float(c.net_commission or 0),
                "gross_commission": float(c.gross_commission or 0),
                "commission_amount": float(c.commission_amount or 0),
                "service_type": c.service_name,
                "transaction_id": c.transaction_id,
                "is_settled": bool(c.is_settled),
                "is_credited": bool(c.is_credited),
                "created_at": str(c.created_at),
            }
            for c in commissions
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


# =====================================================
# COMMISSION SUMMARY
# =====================================================

@router.get(
    "/summary",
    summary="Get commission summary",
)
def get_commission_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get a summary of total commissions earned.
    """
    from sqlalchemy import func

    total = (
        db.query(func.coalesce(func.sum(CommissionLedger.net_commission), 0))
        .filter(CommissionLedger.beneficiary_id == current_user.id)
        .scalar()
    )
    settled = (
        db.query(func.coalesce(func.sum(CommissionLedger.net_commission), 0))
        .filter(
            CommissionLedger.beneficiary_id == current_user.id,
            CommissionLedger.is_settled.is_(True),
        )
        .scalar()
    )

    return {
        "total_earned": float(total),
        "total_settled": float(settled),
        "total_unsettled": float(total) - float(settled),
        "user_id": current_user.id,
    }
