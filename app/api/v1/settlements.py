"""
VasuPay - Settlement Routes
Settlement requests and status tracking
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, Settlement
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settlements", tags=["Settlements"])


# =====================================================
# LIST SETTLEMENTS
# =====================================================

@router.get(
    "/",
    summary="List settlement requests",
)
def list_settlements(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List settlement requests for the authenticated user.
    """
    query = (
        db.query(Settlement)
        .filter(Settlement.user_id == current_user.id)
        .order_by(Settlement.created_at.desc())
    )

    total = query.count()
    settlements = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [
            {
                "id": s.id,
                "amount": float(s.amount),
                "status": s.status.value if hasattr(s.status, "value") else s.status,
                "bank_reference": s.bank_reference,
                "created_at": str(s.created_at),
            }
            for s in settlements
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


# =====================================================
# REQUEST SETTLEMENT
# =====================================================

@router.post(
    "/request",
    status_code=status.HTTP_201_CREATED,
    summary="Request a new settlement",
)
def request_settlement(
    amount: float,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Request a wallet settlement to bank account.
    """
    if amount < settings.MIN_SETTLEMENT_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum settlement amount is {settings.MIN_SETTLEMENT_AMOUNT}",
        )

    settlement = Settlement(
        user_id=current_user.id,
        amount=amount,
        charge=settings.SETTLEMENT_CHARGE,
        net_amount=amount - settings.SETTLEMENT_CHARGE,
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)

    return {"message": "Settlement requested", "settlement_id": settlement.id}
