"""
VasuPay - Transaction Routes
Service transactions (BBPS, AEPS, DMT, Recharge)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, Transaction, SupportTicket, Wallet, WalletTransaction

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


class ComplaintRequest(BaseModel):
    subject: str = Field(default="Transaction complaint", max_length=255)
    description: str = Field(..., min_length=3, max_length=2000)


def _gen_ticket_id() -> str:
    return "CMP" + datetime.now().strftime("%y%m%d%H%M%S") + uuid.uuid4().hex[:5].upper()


# =====================================================
# COMPLAINTS (raised from a transaction; visible to admin as a ticket)
# =====================================================

@router.get("/complaints", summary="List my transaction complaints")
def my_complaints(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    q = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == current_user.id, SupportTicket.type == "COMPLAINT")
        .order_by(SupportTicket.created_at.desc())
    )
    return {
        "items": [
            {
                "id": t.id,
                "ticket_id": t.ticket_id,
                "subject": t.subject,
                "description": t.description,
                "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                "related_transaction_id": t.related_transaction_id,
                "created_at": str(t.created_at),
            }
            for t in q.all()
        ]
    }


@router.post("/{transaction_id}/complaint", summary="Raise a complaint for a transaction")
def raise_complaint(
    transaction_id: int,
    payload: ComplaintRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    # Best-effort link to a real service Transaction; complaints from wallet-ledger
    # rows (fallback history) still succeed with the reference noted in the body.
    txn = None
    try:
        txn = (
            db.query(Transaction)
            .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
            .first()
        )
    except Exception:
        db.rollback()

    description = payload.description
    if txn is None:
        description = f"{payload.description}\n\n[Ref: transaction/ledger #{transaction_id}]"

    ticket = SupportTicket(
        user_id=current_user.id,
        ticket_id=_gen_ticket_id(),
        subject=payload.subject[:255],
        description=description,
        category="TRANSACTION",
        type="COMPLAINT",
        related_transaction_id=txn.id if txn is not None else None,
        customer_phone=current_user.phone,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {
        "ticket_id": ticket.ticket_id,
        "status": ticket.status.value if hasattr(ticket.status, "value") else str(ticket.status),
        "message": "Complaint submitted. Our team will review it shortly.",
    }


# =====================================================
# LIST TRANSACTIONS
# =====================================================

@router.get(
    "/",
    summary="List user transactions",
)
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    service_type: str = None,
    status_filter: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List transactions for the authenticated user.

    Primary source is the service `Transaction` table. If that has no rows (e.g.
    the service transaction could not be recorded), we fall back to the reliably
    persisted Bharat Connect wallet debits so history is always visible.
    """
    def _service_label(t):
        if isinstance(t.additional_data, dict) and t.additional_data.get("service"):
            return t.additional_data["service"]
        return t.transaction_type.value if hasattr(t.transaction_type, "value") else str(t.transaction_type)

    items = []
    try:
        query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
        if status_filter:
            query = query.filter(Transaction.status == status_filter)
        query = query.order_by(Transaction.created_at.desc())
        for t in query.offset((page - 1) * per_page).limit(per_page).all():
            if service_type and _service_label(t) != service_type:
                continue
            items.append({
                "id": t.id,
                "transaction_id": t.transaction_id,
                "service_type": _service_label(t),
                "amount": float(t.amount),
                "status": t.status.value if hasattr(t.status, "value") else str(t.status),
                "created_at": str(t.created_at),
                "source": "transaction",
            })
    except Exception as e:  # schema drift on the transactions table must not break history
        logger.warning("Transaction table query failed, falling back to wallet ledger: %s", e)
        db.rollback()

    if not items:
        # Fallback: Bharat Connect payments recorded on the wallet ledger.
        wq = (
            db.query(WalletTransaction)
            .join(Wallet, WalletTransaction.wallet_id == Wallet.id)
            .filter(Wallet.user_id == current_user.id, WalletTransaction.reference_type.like("BBPS%"))
            .order_by(WalletTransaction.created_at.desc())
        )
        for w in wq.offset((page - 1) * per_page).limit(per_page).all():
            desc = w.description or "Bharat Connect"
            label = desc.split("·")[0].replace("BBPS payment", "").strip() or "Bharat Connect"
            refunded = (w.reference_type or "").upper().endswith("REFUND")
            items.append({
                "id": w.id,
                "transaction_id": w.reference_id or f"WT{w.id}",
                "service_type": label,
                "amount": float(w.amount),
                "status": "refunded" if refunded else (w.status or "success").lower(),
                "created_at": str(w.created_at),
                "source": "wallet",
            })

    return {"items": items, "total": len(items), "page": page, "per_page": per_page}


# =====================================================
# GET TRANSACTION DETAIL
# =====================================================

@router.get(
    "/{transaction_id}",
    summary="Get transaction details",
)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get detailed information about a specific transaction.
    """
    txn = (
        db.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    add = txn.additional_data if isinstance(txn.additional_data, dict) else {}
    return {
        "id": txn.id,
        "transaction_id": txn.transaction_id,
        "service_type": add.get("service") or (txn.transaction_type.value if hasattr(txn.transaction_type, "value") else str(txn.transaction_type)),
        "amount": float(txn.amount),
        "status": txn.status.value if hasattr(txn.status, "value") else str(txn.status),
        "bbps_txn_id": txn.external_transaction_id,
        "biller_id": add.get("biller_id"),
        "customer_number": txn.customer_number,
        "provider_ref": txn.external_transaction_id,
        "description": txn.remarks,
        "created_at": str(txn.created_at),
        "updated_at": str(txn.updated_at) if txn.updated_at else None,
    }
