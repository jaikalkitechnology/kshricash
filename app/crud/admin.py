"""
VasuPay - Admin CRUD Operations
Database operations for superadmin dashboard
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_, or_, desc
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import logging

from app.models_complete import (
    User, UserStatus, EntityType, KYCStatus,
    Wallet, WalletPurpose, WalletTransaction, TransactionType,
    Transaction, TransactionStatus,
    Settlement, SettlementStatus,
    CommissionLedger,
    UserKYC,
    SupportTicket, TicketReply,
    AuditLog,
    get_india_time,
)
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


# =====================================================
# DASHBOARD STATS
# =====================================================

def get_dashboard_stats(db: Session) -> dict:
    """Get comprehensive platform statistics."""
    # User stats
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    suspended_users = db.query(func.count(User.id)).filter(User.status == UserStatus.SUSPENDED).scalar() or 0

    # Users by entity type
    entity_counts = (
        db.query(User.entity_type, func.count(User.id))
        .group_by(User.entity_type)
        .all()
    )
    users_by_entity = {
        (e.value if hasattr(e, "value") else str(e)): c
        for e, c in entity_counts
    }

    # Wallet totals
    total_wallet = db.query(func.coalesce(func.sum(Wallet.balance), 0)).scalar() or 0

    # Transaction stats
    total_txns = db.query(func.count(Transaction.id)).scalar() or 0
    success_txns = db.query(func.count(Transaction.id)).filter(
        Transaction.status == TransactionStatus.SUCCESS
    ).scalar() or 0
    failed_txns = db.query(func.count(Transaction.id)).filter(
        Transaction.status == TransactionStatus.FAILED
    ).scalar() or 0
    total_txn_amount = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(Transaction.status == TransactionStatus.SUCCESS).scalar() or 0

    # KYC stats
    pending_kyc = db.query(func.count(User.id)).filter(
        User.kyc_status == KYCStatus.PENDING
    ).scalar() or 0
    verified_kyc = db.query(func.count(User.id)).filter(
        User.kyc_status == KYCStatus.VERIFIED
    ).scalar() or 0
    rejected_kyc = db.query(func.count(User.id)).filter(
        User.kyc_status == KYCStatus.REJECTED
    ).scalar() or 0

    # Settlement stats
    pending_settlements = db.query(func.count(Settlement.id)).filter(
        Settlement.status == SettlementStatus.PENDING
    ).scalar() or 0
    pending_settlement_amt = db.query(
        func.coalesce(func.sum(Settlement.gross_amount), 0)
    ).filter(Settlement.status == SettlementStatus.PENDING).scalar() or 0

    # Ticket stats
    open_tickets = db.query(func.count(SupportTicket.id)).filter(
        SupportTicket.status.in_(["open", "in_progress"])
    ).scalar() or 0

    # Commission stats
    total_commission = db.query(
        func.coalesce(func.sum(CommissionLedger.commission_amount), 0)
    ).filter(CommissionLedger.is_credited == True).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "suspended_users": suspended_users,
        "users_by_entity": users_by_entity,
        "total_wallet_balance": float(total_wallet),
        "total_transactions": total_txns,
        "successful_transactions": success_txns,
        "failed_transactions": failed_txns,
        "total_transaction_amount": float(total_txn_amount),
        "pending_kyc": pending_kyc,
        "verified_kyc": verified_kyc,
        "rejected_kyc": rejected_kyc,
        "pending_settlements": pending_settlements,
        "pending_settlement_amount": float(pending_settlement_amt),
        "open_tickets": open_tickets,
        "total_commission_paid": float(total_commission),
    }


# =====================================================
# USER MANAGEMENT
# =====================================================

def list_users(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    entity_type: Optional[str] = None,
    status: Optional[str] = None,
    kyc_status: Optional[str] = None,
) -> dict:
    """List users with filters and pagination."""
    query = db.query(User)

    if search:
        query = query.filter(
            or_(
                User.phone.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )
    if entity_type:
        query = query.filter(User.entity_type == entity_type)
    if status:
        query = query.filter(User.status == status)
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for u in users:
        # Get main wallet balance
        wallet = db.query(Wallet).filter(
            Wallet.user_id == u.id, Wallet.purpose == WalletPurpose.MAIN
        ).first()
        balance = float(wallet.balance) if wallet else 0.0

        items.append({
            "id": u.id,
            "uuid": u.uuid,
            "phone": u.phone,
            "email": u.email,
            "full_name": u.full_name,
            "entity_type": u.entity_type.value if hasattr(u.entity_type, "value") else str(u.entity_type),
            "status": u.status.value if hasattr(u.status, "value") else str(u.status),
            "kyc_status": u.kyc_status.value if hasattr(u.kyc_status, "value") else str(u.kyc_status),
            "is_active": u.is_active,
            "wallet_balance": balance,
            "created_at": str(u.created_at) if u.created_at else None,
            "last_login": str(u.last_login) if u.last_login else None,
        })

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def get_user_detail(db: Session, user_id: int) -> Optional[dict]:
    """Get detailed user info with wallets, recent transactions, sessions."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    # Wallets
    wallets = db.query(Wallet).filter(Wallet.user_id == user_id).all()
    wallet_list = [
        {
            "id": w.id,
            "purpose": w.purpose.value if hasattr(w.purpose, "value") else str(w.purpose),
            "balance": float(w.balance),
            "is_active": w.is_active,
        }
        for w in wallets
    ]

    # Recent transactions (last 20)
    txns = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.created_at.desc())
        .limit(20)
        .all()
    )
    txn_list = [
        {
            "id": t.id,
            "transaction_id": t.transaction_id,
            "service_type": t.service_type.value if hasattr(t.service_type, "value") else str(t.service_type) if t.service_type else None,
            "amount": float(t.amount) if t.amount else 0,
            "status": t.status.value if hasattr(t.status, "value") else str(t.status),
            "created_at": str(t.created_at) if t.created_at else None,
        }
        for t in txns
    ]

    return {
        "id": user.id,
        "uuid": user.uuid,
        "phone": user.phone,
        "email": user.email,
        "full_name": user.full_name,
        "entity_type": user.entity_type.value if hasattr(user.entity_type, "value") else str(user.entity_type),
        "status": user.status.value if hasattr(user.status, "value") else str(user.status),
        "kyc_status": user.kyc_status.value if hasattr(user.kyc_status, "value") else str(user.kyc_status),
        "is_active": user.is_active,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "is_locked": user.is_locked,
        "login_attempts": user.login_attempts,
        "daily_limit": float(user.daily_transaction_limit) if user.daily_transaction_limit else None,
        "per_transaction_limit": float(user.per_transaction_limit) if user.per_transaction_limit else None,
        "monthly_limit": float(user.monthly_transaction_limit) if user.monthly_transaction_limit else None,
        "referral_code": user.referral_code,
        "created_at": str(user.created_at) if user.created_at else None,
        "last_login": str(user.last_login) if user.last_login else None,
        "wallets": wallet_list,
        "recent_transactions": txn_list,
    }


def update_user(db: Session, user_id: int, data: dict) -> Optional[dict]:
    """Update user fields."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None

    for key, value in data.items():
        if value is not None and hasattr(user, key):
            setattr(user, key, value)

    if "status" in data and data["status"]:
        user.is_active = data["status"] == "active"

    db.commit()
    db.refresh(user)
    return {"message": f"User {user_id} updated successfully"}


def create_user_admin(db: Session, data: dict) -> dict:
    """Create a new user as admin."""
    from app.crud.auth import get_user_by_phone, create_user
    existing = get_user_by_phone(db, data["phone"])
    if existing:
        raise ValueError(f"User with phone {data['phone']} already exists")
    user = create_user(db, data)
    return {"message": "User created", "user_id": user.id}


# =====================================================
# WALLET MANAGEMENT
# =====================================================

def list_wallets(
    db: Session, page: int = 1, per_page: int = 20,
    user_id: Optional[int] = None, purpose: Optional[str] = None,
) -> dict:
    """List all wallets with filters."""
    query = db.query(Wallet).join(User, Wallet.user_id == User.id)
    if user_id:
        query = query.filter(Wallet.user_id == user_id)
    if purpose:
        query = query.filter(Wallet.purpose == purpose)

    total = query.count()
    wallets = query.order_by(Wallet.balance.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for w in wallets:
        user = db.query(User).filter(User.id == w.user_id).first()
        items.append({
            "id": w.id,
            "user_id": w.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "purpose": w.purpose.value if hasattr(w.purpose, "value") else str(w.purpose),
            "balance": float(w.balance),
            "is_active": w.is_active,
            "created_at": str(w.created_at) if w.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def adjust_wallet(db: Session, wallet_id: int, amount: float, description: str, admin_id: int) -> dict:
    """Add or deduct funds from a wallet."""
    wallet = db.query(Wallet).filter(Wallet.id == wallet_id).first()
    if not wallet:
        raise ValueError("Wallet not found")

    old_balance = float(wallet.balance)
    new_balance = old_balance + amount

    if new_balance < 0:
        raise ValueError("Insufficient balance for this adjustment")

    wallet.balance = new_balance

    # Create wallet transaction record
    txn_type = TransactionType.CREDIT if amount > 0 else TransactionType.DEBIT
    wt = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type=txn_type,
        amount=abs(amount),
        balance_before=old_balance,
        balance_after=new_balance,
        description=f"[Admin Adjustment] {description}",
        reference_type="admin_adjustment",
    )
    db.add(wt)
    db.commit()

    return {
        "message": f"Wallet adjusted by {amount}",
        "old_balance": old_balance,
        "new_balance": new_balance,
    }


# =====================================================
# TRANSACTION MANAGEMENT
# =====================================================

def list_transactions(
    db: Session, page: int = 1, per_page: int = 20,
    user_id: Optional[int] = None, status: Optional[str] = None,
    service_type: Optional[str] = None, search: Optional[str] = None,
) -> dict:
    """List all transactions with filters."""
    query = db.query(Transaction)
    if user_id:
        query = query.filter(Transaction.user_id == user_id)
    if status:
        query = query.filter(Transaction.status == status)
    if service_type:
        query = query.filter(Transaction.service_type == service_type)
    if search:
        query = query.filter(
            or_(
                Transaction.transaction_id.ilike(f"%{search}%"),
                Transaction.description.ilike(f"%{search}%"),
            )
        )

    total = query.count()
    txns = query.order_by(Transaction.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for t in txns:
        user = db.query(User).filter(User.id == t.user_id).first()
        items.append({
            "id": t.id,
            "transaction_id": t.transaction_id,
            "user_id": t.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "service_type": t.service_type.value if hasattr(t.service_type, "value") else str(t.service_type) if t.service_type else None,
            "amount": float(t.amount) if t.amount else 0,
            "charge_amount": float(t.charge_amount) if t.charge_amount else 0,
            "commission_amount": float(t.commission_amount) if t.commission_amount else 0,
            "status": t.status.value if hasattr(t.status, "value") else str(t.status),
            "description": t.description,
            "provider_reference": t.provider_reference,
            "created_at": str(t.created_at) if t.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def get_transaction_detail(db: Session, txn_id: int) -> Optional[dict]:
    """Get full transaction detail."""
    t = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not t:
        return None

    user = db.query(User).filter(User.id == t.user_id).first()

    return {
        "id": t.id,
        "transaction_id": t.transaction_id,
        "user_id": t.user_id,
        "user_name": user.full_name if user else "Unknown",
        "service_type": t.service_type.value if hasattr(t.service_type, "value") else str(t.service_type) if t.service_type else None,
        "transaction_type": t.transaction_type.value if hasattr(t.transaction_type, "value") else str(t.transaction_type) if t.transaction_type else None,
        "amount": float(t.amount) if t.amount else 0,
        "charge_amount": float(t.charge_amount) if t.charge_amount else 0,
        "commission_amount": float(t.commission_amount) if t.commission_amount else 0,
        "gst_amount": float(t.gst_amount) if t.gst_amount else 0,
        "total_amount": float(t.total_amount) if t.total_amount else 0,
        "status": t.status.value if hasattr(t.status, "value") else str(t.status),
        "description": t.description,
        "provider_reference": t.provider_reference,
        "customer_name": t.customer_name,
        "customer_number": t.customer_number,
        "is_reversed": t.is_reversed,
        "is_refunded": t.is_refunded,
        "created_at": str(t.created_at) if t.created_at else None,
        "updated_at": str(t.updated_at) if t.updated_at else None,
    }


# =====================================================
# COMMISSION MANAGEMENT
# =====================================================

def list_commissions(
    db: Session, page: int = 1, per_page: int = 20,
    user_id: Optional[int] = None, is_credited: Optional[bool] = None,
) -> dict:
    """List commission ledger entries."""
    query = db.query(CommissionLedger)
    if user_id:
        query = query.filter(CommissionLedger.entity_id == user_id)
    if is_credited is not None:
        query = query.filter(CommissionLedger.is_credited == is_credited)

    total = query.count()
    entries = query.order_by(CommissionLedger.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for c in entries:
        items.append({
            "id": c.id,
            "transaction_id": c.transaction_id,
            "entity_type": c.entity_type,
            "entity_id": c.entity_id,
            "beneficiary_name": c.beneficiary_name,
            "commission_type": c.commission_type,
            "commission_rate": float(c.commission_rate) if c.commission_rate else 0,
            "commission_amount": float(c.commission_amount) if c.commission_amount else 0,
            "gst_amount": float(c.gst_amount) if c.gst_amount else 0,
            "tds_amount": float(c.tds_amount) if c.tds_amount else 0,
            "net_amount": float(c.net_amount) if c.net_amount else 0,
            "is_credited": c.is_credited,
            "is_reversed": c.is_reversed,
            "created_at": str(c.created_at) if c.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def get_commission_summary(db: Session) -> dict:
    """Get commission summary."""
    total = db.query(func.coalesce(func.sum(CommissionLedger.commission_amount), 0)).scalar() or 0
    credited = db.query(func.coalesce(func.sum(CommissionLedger.commission_amount), 0)).filter(
        CommissionLedger.is_credited == True
    ).scalar() or 0
    pending = db.query(func.coalesce(func.sum(CommissionLedger.commission_amount), 0)).filter(
        CommissionLedger.is_credited == False
    ).scalar() or 0
    total_gst = db.query(func.coalesce(func.sum(CommissionLedger.gst_amount), 0)).scalar() or 0
    total_tds = db.query(func.coalesce(func.sum(CommissionLedger.tds_amount), 0)).scalar() or 0

    return {
        "total_commission": float(total),
        "credited_commission": float(credited),
        "pending_commission": float(pending),
        "total_gst": float(total_gst),
        "total_tds": float(total_tds),
    }


# =====================================================
# SETTLEMENT MANAGEMENT
# =====================================================

def list_settlements(
    db: Session, page: int = 1, per_page: int = 20,
    status: Optional[str] = None, user_id: Optional[int] = None,
) -> dict:
    """List all settlements with filters."""
    query = db.query(Settlement)
    if status:
        query = query.filter(Settlement.status == status)
    if user_id:
        query = query.filter(Settlement.user_id == user_id)

    total = query.count()
    settlements = query.order_by(Settlement.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for s in settlements:
        user = db.query(User).filter(User.id == s.user_id).first()
        items.append({
            "id": s.id,
            "user_id": s.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "settlement_type": s.settlement_type if s.settlement_type else None,
            "gross_amount": float(s.gross_amount) if s.gross_amount else 0,
            "charge_amount": float(s.charge_amount) if s.charge_amount else 0,
            "net_amount": float(s.net_amount) if s.net_amount else 0,
            "status": s.status.value if hasattr(s.status, "value") else str(s.status),
            "bank_name": s.bank_name,
            "account_number": s.account_number,
            "utr_number": s.utr_number,
            "created_at": str(s.created_at) if s.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def process_settlement(db: Session, settlement_id: int, action: str, admin_id: int, remarks: str = None, bank_reference: str = None) -> dict:
    """Approve or reject a settlement."""
    settlement = db.query(Settlement).filter(Settlement.id == settlement_id).first()
    if not settlement:
        raise ValueError("Settlement not found")

    if action == "approve":
        settlement.status = SettlementStatus.PROCESSING
        settlement.approved_by = admin_id
        settlement.approved_at = get_india_time()
        if bank_reference:
            settlement.utr_number = bank_reference
        if remarks:
            settlement.remarks = remarks
    elif action == "reject":
        settlement.status = SettlementStatus.CANCELLED
        settlement.rejected_by = admin_id
        settlement.rejected_at = get_india_time()
        if remarks:
            settlement.remarks = remarks
    elif action == "complete":
        settlement.status = SettlementStatus.COMPLETED
        settlement.completed_at = get_india_time()
        if bank_reference:
            settlement.utr_number = bank_reference
    else:
        raise ValueError(f"Invalid action: {action}")

    db.commit()
    return {"message": f"Settlement {settlement_id} {action}d successfully"}


# =====================================================
# KYC MANAGEMENT
# =====================================================

def list_kyc_submissions(
    db: Session, page: int = 1, per_page: int = 20,
    status: Optional[str] = None,
) -> dict:
    """List KYC submissions."""
    query = db.query(UserKYC)
    if status:
        query = query.filter(UserKYC.status == status)

    total = query.count()
    kycs = query.order_by(UserKYC.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for k in kycs:
        user = db.query(User).filter(User.id == k.user_id).first()
        entity_type_val = user.entity_type.value if user and hasattr(user.entity_type, 'value') else (str(user.entity_type) if user else None)
        items.append({
            "id": k.id,
            "user_id": k.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "entity_type": entity_type_val,
            "status": k.status.value if hasattr(k.status, "value") else str(k.status),
            "aadhaar_number": k.aadhaar_number_masked,
            "pan_number": k.pan_number,
            "verification_level": k.verification_level,
            "resubmission_count": k.resubmission_count or 0,
            "submitted_at": str(k.created_at) if k.created_at else None,
            "verified_at": str(k.verified_at) if k.verified_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def get_kyc_detail(db: Session, kyc_id: int) -> Optional[dict]:
    """Get full KYC detail with all document URLs for admin review."""
    kyc = db.query(UserKYC).filter(UserKYC.id == kyc_id).first()
    if not kyc:
        return None

    user = db.query(User).filter(User.id == kyc.user_id).first()
    entity_type_val = user.entity_type.value if user and hasattr(user.entity_type, 'value') else (str(user.entity_type) if user else None)

    return {
        "id": kyc.id,
        "user_id": kyc.user_id,
        "user_name": user.full_name if user else "Unknown",
        "user_phone": user.phone if user else "",
        "user_email": user.email if user else "",
        "entity_type": entity_type_val,
        "status": kyc.status.value if hasattr(kyc.status, "value") else str(kyc.status),
        "verification_level": kyc.verification_level,
        # Primary docs
        "aadhaar_number": kyc.aadhaar_number_masked,
        "aadhaar_front_url": kyc.aadhaar_front_url,
        "aadhaar_back_url": kyc.aadhaar_back_url,
        "pan_number": kyc.pan_number,
        "pan_card_url": kyc.pan_card_url,
        "photo_url": kyc.photo_url,
        "selfie_url": kyc.selfie_url,
        "signature_url": kyc.signature_url,
        # Address proof
        "address_proof_type": kyc.address_proof_type.value if kyc.address_proof_type and hasattr(kyc.address_proof_type, 'value') else str(kyc.address_proof_type) if kyc.address_proof_type else None,
        "address_proof_url": kyc.address_proof_url,
        "address_proof_number": kyc.address_proof_number,
        # Business docs
        "gst_certificate_url": kyc.gst_certificate_url,
        "shop_act_url": kyc.shop_act_url,
        "trade_license_url": kyc.trade_license_url,
        "cancelled_cheque_url": kyc.cancelled_cheque_url,
        "bank_statement_url": kyc.bank_statement_url,
        "rental_agreement_url": kyc.rental_agreement_url,
        "electricity_bill_url": kyc.electricity_bill_url,
        # General document
        "document_type": kyc.document_type.value if kyc.document_type and hasattr(kyc.document_type, 'value') else str(kyc.document_type) if kyc.document_type else None,
        "document_number": kyc.document_number,
        "document_front_url": kyc.document_front_url,
        "document_back_url": kyc.document_back_url,
        # Meta
        "rejection_reason": kyc.rejection_reason,
        "rejection_category": kyc.rejection_category,
        "resubmission_count": kyc.resubmission_count or 0,
        "verification_notes": kyc.verification_notes,
        "verified_at": str(kyc.verified_at) if kyc.verified_at else None,
        "verified_by": kyc.verified_by,
        "submitted_at": str(kyc.created_at) if kyc.created_at else None,
        "updated_at": str(kyc.updated_at) if kyc.updated_at else None,
    }


def process_kyc(db: Session, kyc_id: int, action: str, admin_id: int, remarks: str = None) -> dict:
    """Approve or reject KYC."""
    kyc = db.query(UserKYC).filter(UserKYC.id == kyc_id).first()
    if not kyc:
        raise ValueError("KYC submission not found")

    if action == "approve":
        kyc.status = KYCStatus.VERIFIED
        kyc.verified_at = get_india_time()
        kyc.verified_by = admin_id
        # Update user KYC status
        user = db.query(User).filter(User.id == kyc.user_id).first()
        if user:
            user.kyc_status = KYCStatus.VERIFIED
    elif action == "reject":
        kyc.status = KYCStatus.REJECTED
        kyc.rejected_at = get_india_time()
        kyc.rejected_by = admin_id
        user = db.query(User).filter(User.id == kyc.user_id).first()
        if user:
            user.kyc_status = KYCStatus.REJECTED
    else:
        raise ValueError(f"Invalid action: {action}")

    if remarks:
        kyc.rejection_reason = remarks

    db.commit()
    return {"message": f"KYC {kyc_id} {action}d successfully"}


# =====================================================
# SUPPORT TICKET MANAGEMENT
# =====================================================

def list_tickets(
    db: Session, page: int = 1, per_page: int = 20,
    status: Optional[str] = None, priority: Optional[str] = None,
    user_id: Optional[int] = None,
) -> dict:
    """List support tickets."""
    query = db.query(SupportTicket)
    if status:
        query = query.filter(SupportTicket.status == status)
    if priority:
        query = query.filter(SupportTicket.priority == priority)
    if user_id:
        query = query.filter(SupportTicket.user_id == user_id)

    total = query.count()
    tickets = query.order_by(SupportTicket.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for t in tickets:
        user = db.query(User).filter(User.id == t.user_id).first()
        reply_count = db.query(func.count(TicketReply.id)).filter(TicketReply.ticket_id == t.id).scalar() or 0
        items.append({
            "id": t.id,
            "ticket_number": t.ticket_number,
            "user_id": t.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "subject": t.subject,
            "category": t.category,
            "priority": t.priority.value if hasattr(t.priority, "value") else str(t.priority) if t.priority else "medium",
            "status": t.status.value if hasattr(t.status, "value") else str(t.status) if t.status else "open",
            "assigned_to": t.assigned_to,
            "reply_count": reply_count,
            "is_escalated": t.is_escalated,
            "created_at": str(t.created_at) if t.created_at else None,
            "updated_at": str(t.updated_at) if t.updated_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def get_ticket_detail(db: Session, ticket_id: int) -> Optional[dict]:
    """Get ticket detail with replies."""
    t = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not t:
        return None

    user = db.query(User).filter(User.id == t.user_id).first()
    replies = db.query(TicketReply).filter(TicketReply.ticket_id == t.id).order_by(TicketReply.created_at.asc()).all()

    reply_list = []
    for r in replies:
        reply_user = db.query(User).filter(User.id == r.user_id).first() if r.user_id else None
        reply_list.append({
            "id": r.id,
            "user_id": r.user_id,
            "user_name": reply_user.full_name if reply_user else "System",
            "message": r.message,
            "is_admin_reply": r.is_admin_reply if hasattr(r, "is_admin_reply") else False,
            "created_at": str(r.created_at) if r.created_at else None,
        })

    return {
        "id": t.id,
        "ticket_number": t.ticket_number,
        "user_id": t.user_id,
        "user_name": user.full_name if user else "Unknown",
        "user_phone": user.phone if user else "",
        "subject": t.subject,
        "description": t.description,
        "category": t.category,
        "priority": t.priority.value if hasattr(t.priority, "value") else str(t.priority) if t.priority else "medium",
        "status": t.status.value if hasattr(t.status, "value") else str(t.status) if t.status else "open",
        "assigned_to": t.assigned_to,
        "is_escalated": t.is_escalated,
        "resolution": t.resolution,
        "rating": t.rating,
        "created_at": str(t.created_at) if t.created_at else None,
        "updated_at": str(t.updated_at) if t.updated_at else None,
        "replies": reply_list,
    }


def reply_to_ticket(db: Session, ticket_id: int, admin_id: int, message: str) -> dict:
    """Add admin reply to ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise ValueError("Ticket not found")

    reply = TicketReply(
        ticket_id=ticket_id,
        user_id=admin_id,
        message=message,
        is_admin_reply=True,
    )
    db.add(reply)

    if ticket.status == "open":
        ticket.status = "in_progress"
    ticket.updated_at = get_india_time()

    db.commit()
    return {"message": "Reply added successfully", "reply_id": reply.id}


def update_ticket_status(db: Session, ticket_id: int, status: str, priority: str = None, assigned_to: int = None) -> dict:
    """Update ticket status/priority/assignment."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise ValueError("Ticket not found")

    ticket.status = status
    if priority:
        ticket.priority = priority
    if assigned_to is not None:
        ticket.assigned_to = assigned_to
    ticket.updated_at = get_india_time()

    db.commit()
    return {"message": f"Ticket {ticket_id} updated"}


# =====================================================
# AUDIT LOG MANAGEMENT
# =====================================================

def list_audit_logs(
    db: Session, page: int = 1, per_page: int = 20,
    user_id: Optional[int] = None, action: Optional[str] = None,
    resource_type: Optional[str] = None,
) -> dict:
    """List audit logs with filters."""
    query = db.query(AuditLog)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if action:
        query = query.filter(AuditLog.action == action)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for log in logs:
        items.append({
            "id": log.id,
            "user_id": log.user_id,
            "actor_name": log.actor_name,
            "action": log.action.value if hasattr(log.action, "value") else str(log.action) if log.action else None,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "resource_name": log.resource_name,
            "ip_address": log.ip_address,
            "severity": log.severity,
            "is_suspicious": log.is_suspicious,
            "response_message": log.response_message,
            "created_at": str(log.created_at) if log.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }
