"""
Kshricash - Wallet Routes
Wallet balance, fund loading, and transfer operations
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, Wallet

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wallets", tags=["Wallets"])


# =====================================================
# WALLET BALANCE
# =====================================================

@router.get(
    "/balance",
    summary="Get wallet balances",
)
def get_wallet_balance(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get all wallet balances for the authenticated user.
    """
    wallets = (
        db.query(Wallet)
        .filter(Wallet.user_id == current_user.id)
        .all()
    )

    return {
        "wallets": [
            {
                "id": w.id,
                "purpose": w.purpose.value if hasattr(w.purpose, "value") else w.purpose,
                "balance": float(w.balance),
                "is_active": w.is_active,
                "created_at": str(w.created_at),
            }
            for w in wallets
        ],
    }


# =====================================================
# WALLET TRANSACTIONS HISTORY
# =====================================================

@router.get(
    "/transactions",
    summary="Get wallet transaction history",
)
def get_wallet_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get transaction history for the user's wallets.
    """
    from app.models_complete import WalletTransaction

    query = (
        db.query(WalletTransaction)
        .join(Wallet, WalletTransaction.wallet_id == Wallet.id)
        .filter(Wallet.user_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
    )

    total = query.count()
    transactions = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": [
            {
                "id": t.id,
                "type": t.transaction_type.value if hasattr(t.transaction_type, "value") else t.transaction_type,
                "amount": float(t.amount),
                "balance_after": float(t.balance_after) if t.balance_after else None,
                "description": t.description,
                "created_at": str(t.created_at),
            }
            for t in transactions
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }
