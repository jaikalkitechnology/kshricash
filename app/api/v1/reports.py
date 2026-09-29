"""
Kshricash - Report Routes
Transaction reports and analytics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, Transaction, CommissionStructure

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reports"])


# =====================================================
# TRANSACTION SUMMARY
# =====================================================

@router.get(
    "/transactions/summary",
    summary="Get transaction summary",
)
def get_transaction_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get a summary of the user's transactions (count, total amount by status).
    """
    results = (
        db.query(
            Transaction.status,
            func.count(Transaction.id).label("count"),
            func.coalesce(func.sum(Transaction.amount), 0).label("total_amount"),
        )
        .filter(Transaction.user_id == current_user.id)
        .group_by(Transaction.status)
        .all()
    )

    summary = {}
    for row in results:
        status_val = row.status.value if hasattr(row.status, "value") else row.status
        summary[status_val] = {
            "count": row.count,
            "total_amount": float(row.total_amount),
        }

    return {"summary": summary, "user_id": current_user.id}


# =====================================================
# EARNINGS REPORT
# =====================================================

@router.get(
    "/earnings",
    summary="Get earnings report",
)
def get_earnings_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get earnings report including commissions.
    """
    total_commissions = (
        db.query(func.coalesce(func.sum(CommissionStructure.amount), 0))
        .filter(CommissionStructure.user_id == current_user.id)
        .scalar()
    )

    return {
        "total_commissions": float(total_commissions),
        "user_id": current_user.id,
    }
