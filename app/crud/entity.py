"""
VasuPay - Entity Hierarchy CRUD Operations
Hierarchy-aware operations: create children, list children, dashboard stats,
KYC approval per hierarchy, service enablement.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import Optional, List
from decimal import Decimal
import logging

from app.models_complete import (
    User, UserStatus, EntityType, KYCStatus,
    Wallet, WalletPurpose, WalletTransaction, TransactionType,
    Transaction, TransactionStatus,
    Settlement, SettlementStatus,
    CommissionLedger,
    UserKYC,
    SupportTicket,
    get_india_time,
)
from app.core.security import get_password_hash
from app.schemas.entity import (
    HIERARCHY_CREATION_RULES, HIERARCHY_LEVEL, KYC_APPROVAL_RULES,
)

logger = logging.getLogger(__name__)


# =====================================================
# HELPERS
# =====================================================

def get_all_descendant_ids(db: Session, parent_id: int) -> list[int]:
    """Recursively get all descendant user IDs under a parent."""
    direct_children = db.query(User.id).filter(User.parent_id == parent_id).all()
    child_ids = [c[0] for c in direct_children]
    all_ids = list(child_ids)
    for cid in child_ids:
        all_ids.extend(get_all_descendant_ids(db, cid))
    return all_ids


def get_direct_child_ids(db: Session, parent_id: int) -> list[int]:
    """Get direct children IDs."""
    rows = db.query(User.id).filter(User.parent_id == parent_id).all()
    return [r[0] for r in rows]


def can_manage_entity(manager: User, target: User) -> bool:
    """Check if manager can manage target based on hierarchy."""
    m_level = HIERARCHY_LEVEL.get(
        manager.entity_type.value if hasattr(manager.entity_type, 'value') else manager.entity_type, 99
    )
    t_level = HIERARCHY_LEVEL.get(
        target.entity_type.value if hasattr(target.entity_type, 'value') else target.entity_type, 99
    )
    return m_level < t_level


def _enum_val(obj, attr):
    """Safely get enum value."""
    val = getattr(obj, attr, None)
    if val is None:
        return None
    return val.value if hasattr(val, 'value') else str(val)


# =====================================================
# ENTITY DASHBOARD STATS (hierarchy-scoped)
# =====================================================

def get_entity_dashboard(db: Session, user: User) -> dict:
    """Get dashboard stats scoped to the current entity's hierarchy."""
    user_id = user.id
    entity_type = _enum_val(user, 'entity_type')

    # Get all descendant IDs
    descendant_ids = get_all_descendant_ids(db, user_id)

    # Children counts
    direct_children = db.query(User).filter(User.parent_id == user_id).all()
    total_children = len(descendant_ids)
    active_children = db.query(func.count(User.id)).filter(
        User.id.in_(descendant_ids), User.is_active == True
    ).scalar() if descendant_ids else 0

    # Children by entity type
    if descendant_ids:
        type_counts = (
            db.query(User.entity_type, func.count(User.id))
            .filter(User.id.in_(descendant_ids))
            .group_by(User.entity_type)
            .all()
        )
        children_by_type = {
            (e.value if hasattr(e, 'value') else str(e)): c for e, c in type_counts
        }
    else:
        children_by_type = {}

    # Pending KYC approvals (from direct children + descendants based on rules)
    creatable = HIERARCHY_CREATION_RULES.get(entity_type, [])
    if descendant_ids and creatable:
        pending_kyc = db.query(func.count(UserKYC.id)).join(User, UserKYC.user_id == User.id).filter(
            User.id.in_(descendant_ids),
            UserKYC.status == KYCStatus.PENDING,
        ).scalar() or 0
    else:
        pending_kyc = 0

    # Own wallet balance
    own_wallet = db.query(Wallet).filter(
        Wallet.user_id == user_id, Wallet.purpose == WalletPurpose.MAIN
    ).first()
    wallet_balance = float(own_wallet.balance) if own_wallet else 0.0

    # Transaction stats (own + children)
    all_user_ids = [user_id] + descendant_ids
    total_txns = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id.in_(all_user_ids)
    ).scalar() or 0
    total_txn_amount = db.query(
        func.coalesce(func.sum(Transaction.amount), 0)
    ).filter(
        Transaction.user_id.in_(all_user_ids),
        Transaction.status == TransactionStatus.SUCCESS,
    ).scalar() or 0

    # Commission earned (own)
    total_commission = db.query(
        func.coalesce(func.sum(CommissionLedger.commission_amount), 0)
    ).filter(
        CommissionLedger.entity_id == user_id,
        CommissionLedger.is_credited == True,
    ).scalar() or 0

    # Open tickets (own + children)
    open_tickets = db.query(func.count(SupportTicket.id)).filter(
        SupportTicket.user_id.in_(all_user_ids),
        SupportTicket.status.in_(["open", "in_progress"]),
    ).scalar() or 0

    return {
        "entity_type": entity_type,
        "entity_name": user.full_name,
        "total_children": total_children,
        "active_children": active_children,
        "children_by_type": children_by_type,
        "pending_kyc_approvals": pending_kyc,
        "wallet_balance": wallet_balance,
        "total_transactions": total_txns,
        "total_transaction_amount": float(total_txn_amount),
        "total_commission_earned": float(total_commission),
        "open_tickets": open_tickets,
    }


# =====================================================
# CREATE CHILD ENTITY
# =====================================================

def create_child_entity(db: Session, parent: User, data: dict) -> dict:
    """Create a child entity under the current parent, respecting hierarchy rules."""
    parent_type = _enum_val(parent, 'entity_type')
    child_type = data["entity_type"]

    # Validate hierarchy rules
    allowed = HIERARCHY_CREATION_RULES.get(parent_type, [])
    if child_type not in allowed:
        raise ValueError(
            f"{parent_type} cannot create {child_type}. "
            f"Allowed types: {', '.join(allowed) if allowed else 'none'}"
        )

    # Check phone uniqueness
    existing = db.query(User).filter(User.phone == data["phone"]).first()
    if existing:
        raise ValueError(f"User with phone {data['phone']} already exists")

    # Check email uniqueness
    if data.get("email"):
        existing_email = db.query(User).filter(User.email == data["email"]).first()
        if existing_email:
            raise ValueError(f"User with email {data['email']} already exists")

    # Create the user
    user = User(
        full_name=data["full_name"],
        phone=data["phone"],
        email=data.get("email"),
        password_hash=get_password_hash(data["password"]),
        entity_type=child_type,
        parent_id=parent.id,
        created_by=parent.id,
        status=UserStatus.ACTIVE,
        is_active=True,
        address=data.get("address"),
        city=data.get("city"),
        state=data.get("state"),
        pincode=data.get("pincode"),
    )
    db.add(user)
    db.flush()

    # Create main wallet for the new entity
    wallet = Wallet(
        user_id=user.id,
        purpose=WalletPurpose.MAIN,
        balance=Decimal('0.00'),
        is_active=True,
    )
    db.add(wallet)

    # Create commission wallet
    commission_wallet = Wallet(
        user_id=user.id,
        purpose=WalletPurpose.COMMISSION,
        balance=Decimal('0.00'),
        is_active=True,
    )
    db.add(commission_wallet)

    db.commit()

    return {
        "message": f"{child_type} created successfully",
        "user_id": user.id,
        "full_name": user.full_name,
        "phone": user.phone,
        "entity_type": child_type,
    }


# =====================================================
# LIST CHILDREN (hierarchy-scoped)
# =====================================================

def list_children(
    db: Session,
    parent: User,
    page: int = 1,
    per_page: int = 20,
    entity_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    direct_only: bool = False,
) -> dict:
    """List child entities under the current entity."""
    if direct_only:
        query = db.query(User).filter(User.parent_id == parent.id)
    else:
        descendant_ids = get_all_descendant_ids(db, parent.id)
        if not descendant_ids:
            return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}
        query = db.query(User).filter(User.id.in_(descendant_ids))

    if entity_type:
        query = query.filter(User.entity_type == entity_type)
    if status:
        query = query.filter(User.status == status)
    if search:
        query = query.filter(or_(
            User.phone.ilike(f"%{search}%"),
            User.full_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
        ))

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for u in users:
        wallet = db.query(Wallet).filter(
            Wallet.user_id == u.id, Wallet.purpose == WalletPurpose.MAIN
        ).first()
        balance = float(wallet.balance) if wallet else 0.0
        child_count = db.query(func.count(User.id)).filter(User.parent_id == u.id).scalar() or 0

        items.append({
            "id": u.id,
            "uuid": u.uuid,
            "phone": u.phone,
            "email": u.email,
            "full_name": u.full_name,
            "entity_type": _enum_val(u, 'entity_type'),
            "status": _enum_val(u, 'status'),
            "kyc_status": _enum_val(u, 'kyc_status'),
            "is_active": u.is_active,
            "wallet_balance": balance,
            "child_count": child_count,
            "city": u.city,
            "state": u.state,
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


# =====================================================
# GET CHILD DETAIL
# =====================================================

def get_child_detail(db: Session, parent: User, child_id: int) -> Optional[dict]:
    """Get detailed info for a child entity, only if it's in the hierarchy."""
    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        return None

    # Verify hierarchy access
    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        return None

    # Wallets
    wallets = db.query(Wallet).filter(Wallet.user_id == child_id).all()
    wallet_list = [{
        "id": w.id,
        "purpose": _enum_val(w, 'purpose'),
        "balance": float(w.balance),
        "is_active": w.is_active,
    } for w in wallets]

    # Recent transactions
    txns = (
        db.query(Transaction).filter(Transaction.user_id == child_id)
        .order_by(Transaction.created_at.desc()).limit(20).all()
    )
    txn_list = [{
        "id": t.id,
        "service_type": _enum_val(t, 'service_type'),
        "amount": float(t.amount) if t.amount else 0,
        "status": _enum_val(t, 'status'),
        "created_at": str(t.created_at) if t.created_at else None,
    } for t in txns]

    # Direct children count
    child_count = db.query(func.count(User.id)).filter(User.parent_id == child_id).scalar() or 0

    return {
        "id": child.id,
        "uuid": child.uuid,
        "phone": child.phone,
        "email": child.email,
        "full_name": child.full_name,
        "entity_type": _enum_val(child, 'entity_type'),
        "status": _enum_val(child, 'status'),
        "kyc_status": _enum_val(child, 'kyc_status'),
        "is_active": child.is_active,
        "is_locked": child.is_locked,
        "address": child.address,
        "city": child.city,
        "state": child.state,
        "pincode": child.pincode,
        "allowed_services": child.allowed_services or [],
        "blocked_services": child.blocked_services or [],
        "daily_transaction_limit": float(child.daily_transaction_limit) if child.daily_transaction_limit else None,
        "per_transaction_limit": float(child.per_transaction_limit) if child.per_transaction_limit else None,
        "monthly_transaction_limit": float(child.monthly_transaction_limit) if child.monthly_transaction_limit else None,
        "child_count": child_count,
        "created_at": str(child.created_at) if child.created_at else None,
        "last_login": str(child.last_login) if child.last_login else None,
        "wallets": wallet_list,
        "recent_transactions": txn_list,
    }


# =====================================================
# UPDATE CHILD ENTITY
# =====================================================

def update_child_entity(db: Session, parent: User, child_id: int, data: dict) -> Optional[dict]:
    """Update a child entity within the hierarchy."""
    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        return None

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        return None

    for key, value in data.items():
        if value is not None and hasattr(child, key):
            setattr(child, key, value)

    if "status" in data and data["status"]:
        child.is_active = data["status"] == "active"

    child.updated_by = parent.id
    db.commit()
    db.refresh(child)
    return {"message": f"Entity {child_id} updated successfully"}


# =====================================================
# TOGGLE CHILD LOCK
# =====================================================

def toggle_child_lock(db: Session, parent: User, child_id: int, lock: bool) -> Optional[dict]:
    """Lock or unlock a child entity."""
    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        return None

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        return None

    child.is_locked = lock
    if lock:
        child.locked_until = None
        child.locked_reason = f"Locked by {_enum_val(parent, 'entity_type')} #{parent.id}"
    else:
        child.locked_until = None
        child.locked_reason = None

    db.commit()
    return {"message": f"Entity {child_id} {'locked' if lock else 'unlocked'}"}


# =====================================================
# HIERARCHY KYC APPROVAL
# =====================================================

def list_pending_kyc(db: Session, parent: User, page: int = 1, per_page: int = 20, status_filter: Optional[str] = None) -> dict:
    """List KYC submissions from entities within the hierarchy."""
    descendant_ids = get_all_descendant_ids(db, parent.id)
    if not descendant_ids:
        return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}

    query = db.query(UserKYC).join(User, UserKYC.user_id == User.id).filter(
        User.id.in_(descendant_ids)
    )
    if status_filter:
        query = query.filter(UserKYC.status == status_filter)

    total = query.count()
    kycs = query.order_by(UserKYC.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    items = []
    for k in kycs:
        user = db.query(User).filter(User.id == k.user_id).first()
        items.append({
            "id": k.id,
            "user_id": k.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_phone": user.phone if user else "",
            "entity_type": _enum_val(user, 'entity_type') if user else None,
            "status": _enum_val(k, 'status'),
            "aadhaar_number": k.aadhaar_number_masked,
            "pan_number": k.pan_number,
            "verification_level": k.verification_level,
            "resubmission_count": k.resubmission_count or 0,
            # Document URLs for review
            "aadhaar_front_url": k.aadhaar_front_url,
            "aadhaar_back_url": k.aadhaar_back_url,
            "pan_card_url": k.pan_card_url,
            "photo_url": k.photo_url,
            "selfie_url": k.selfie_url,
            "gst_certificate_url": k.gst_certificate_url,
            "submitted_at": str(k.created_at) if k.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


def approve_child_kyc(db: Session, parent: User, kyc_id: int, remarks: Optional[str] = None) -> dict:
    """Approve KYC for a child entity."""
    kyc = db.query(UserKYC).filter(UserKYC.id == kyc_id).first()
    if not kyc:
        raise ValueError("KYC submission not found")

    # Verify hierarchy access
    descendant_ids = get_all_descendant_ids(db, parent.id)
    if kyc.user_id not in descendant_ids:
        raise ValueError("Not authorized to approve this KYC")

    # Verify KYC approval rules
    parent_type = _enum_val(parent, 'entity_type')
    child = db.query(User).filter(User.id == kyc.user_id).first()
    child_type = _enum_val(child, 'entity_type') if child else None
    allowed = KYC_APPROVAL_RULES.get(parent_type, [])
    if child_type not in allowed:
        raise ValueError(f"{parent_type} cannot approve KYC for {child_type}")

    kyc.status = KYCStatus.VERIFIED
    kyc.verified_at = get_india_time()
    kyc.verified_by = parent.id
    if remarks and hasattr(kyc, 'rejection_reason'):
        kyc.rejection_reason = remarks

    # Update user KYC status
    if child:
        child.kyc_status = KYCStatus.VERIFIED

    db.commit()
    return {"message": f"KYC {kyc_id} approved"}


def reject_child_kyc(db: Session, parent: User, kyc_id: int, remarks: Optional[str] = None) -> dict:
    """Reject KYC for a child entity."""
    kyc = db.query(UserKYC).filter(UserKYC.id == kyc_id).first()
    if not kyc:
        raise ValueError("KYC submission not found")

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if kyc.user_id not in descendant_ids:
        raise ValueError("Not authorized to reject this KYC")

    kyc.status = KYCStatus.REJECTED
    kyc.rejected_at = get_india_time()
    kyc.rejected_by = parent.id
    if remarks and hasattr(kyc, 'rejection_reason'):
        kyc.rejection_reason = remarks

    child = db.query(User).filter(User.id == kyc.user_id).first()
    if child:
        child.kyc_status = KYCStatus.REJECTED

    db.commit()
    return {"message": f"KYC {kyc_id} rejected"}


# =====================================================
# SERVICE ENABLEMENT
# =====================================================

def toggle_child_service(db: Session, parent: User, child_id: int, service_code: str, enabled: bool) -> dict:
    """Enable or disable a service for a child entity."""
    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        raise ValueError("Entity not found")

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        raise ValueError("Not authorized to manage this entity's services")

    allowed = child.allowed_services or []
    blocked = child.blocked_services or []

    if enabled:
        if service_code not in allowed:
            allowed.append(service_code)
        if service_code in blocked:
            blocked.remove(service_code)
    else:
        if service_code in allowed:
            allowed.remove(service_code)
        if service_code not in blocked:
            blocked.append(service_code)

    child.allowed_services = allowed
    child.blocked_services = blocked
    db.commit()

    return {
        "message": f"Service {service_code} {'enabled' if enabled else 'disabled'} for entity {child_id}",
        "allowed_services": allowed,
        "blocked_services": blocked,
    }


def get_child_services(db: Session, parent: User, child_id: int) -> Optional[dict]:
    """Get service configuration for a child entity."""
    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        return None

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        return None

    return {
        "user_id": child_id,
        "entity_type": _enum_val(child, 'entity_type'),
        "allowed_services": child.allowed_services or [],
        "blocked_services": child.blocked_services or [],
    }


# =====================================================
# WALLET LOAD (parent loads child wallet)
# =====================================================

def load_child_wallet(db: Session, parent: User, child_id: int, amount: float, description: str) -> dict:
    """Load funds into a child entity's main wallet."""
    if amount <= 0:
        raise ValueError("Amount must be positive")

    child = db.query(User).filter(User.id == child_id).first()
    if not child:
        raise ValueError("Entity not found")

    descendant_ids = get_all_descendant_ids(db, parent.id)
    if child_id not in descendant_ids:
        raise ValueError("Not authorized to load this entity's wallet")

    # Debit parent wallet
    parent_wallet = db.query(Wallet).filter(
        Wallet.user_id == parent.id, Wallet.purpose == WalletPurpose.MAIN
    ).first()
    if not parent_wallet:
        raise ValueError("Parent wallet not found")
    if float(parent_wallet.balance) < amount:
        raise ValueError("Insufficient balance in your wallet")

    # Credit child wallet
    child_wallet = db.query(Wallet).filter(
        Wallet.user_id == child_id, Wallet.purpose == WalletPurpose.MAIN
    ).first()
    if not child_wallet:
        raise ValueError("Child wallet not found")

    parent_old = float(parent_wallet.balance)
    child_old = float(child_wallet.balance)

    parent_wallet.balance = Decimal(str(parent_old - amount))
    child_wallet.balance = Decimal(str(child_old + amount))

    # Record transactions
    db.add(WalletTransaction(
        wallet_id=parent_wallet.id,
        transaction_type=TransactionType.DEBIT,
        amount=amount,
        balance_before=parent_old,
        balance_after=parent_old - amount,
        description=f"[Wallet Load] Transfer to {child.full_name}: {description}",
        reference_type="wallet_transfer",
    ))
    db.add(WalletTransaction(
        wallet_id=child_wallet.id,
        transaction_type=TransactionType.CREDIT,
        amount=amount,
        balance_before=child_old,
        balance_after=child_old + amount,
        description=f"[Wallet Load] Received from {parent.full_name}: {description}",
        reference_type="wallet_transfer",
    ))

    db.commit()

    return {
        "message": f"₹{amount} loaded to {child.full_name}'s wallet",
        "parent_new_balance": parent_old - amount,
        "child_new_balance": child_old + amount,
    }


# =====================================================
# LIST HIERARCHY TRANSACTIONS
# =====================================================

def list_hierarchy_transactions(
    db: Session,
    parent: User,
    page: int = 1,
    per_page: int = 20,
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    service_type: Optional[str] = None,
) -> dict:
    """List transactions across the hierarchy."""
    descendant_ids = get_all_descendant_ids(db, parent.id)
    all_ids = [parent.id] + descendant_ids

    if user_id:
        if user_id not in all_ids:
            return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}
        all_ids = [user_id]

    query = db.query(Transaction).filter(Transaction.user_id.in_(all_ids))
    if status:
        query = query.filter(Transaction.status == status)
    if service_type:
        query = query.filter(Transaction.service_type == service_type)

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
            "entity_type": _enum_val(user, 'entity_type') if user else None,
            "service_type": _enum_val(t, 'service_type'),
            "amount": float(t.amount) if t.amount else 0,
            "commission_amount": float(t.commission_amount) if t.commission_amount else 0,
            "status": _enum_val(t, 'status'),
            "created_at": str(t.created_at) if t.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


# =====================================================
# LIST HIERARCHY COMMISSIONS
# =====================================================

def list_hierarchy_commissions(
    db: Session, parent: User,
    page: int = 1, per_page: int = 20,
) -> dict:
    """List commission ledger for the entity and its hierarchy."""
    descendant_ids = get_all_descendant_ids(db, parent.id)
    all_ids = [parent.id] + descendant_ids

    query = db.query(CommissionLedger).filter(CommissionLedger.entity_id.in_(all_ids))

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
            "commission_amount": float(c.commission_amount) if c.commission_amount else 0,
            "net_amount": float(c.net_amount) if c.net_amount else 0,
            "is_credited": c.is_credited,
            "created_at": str(c.created_at) if c.created_at else None,
        })

    return {
        "items": items, "total": total, "page": page, "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total > 0 else 0,
    }


# =====================================================
# HIERARCHY ALLOWED CREATION TYPES
# =====================================================

def get_creatable_types(entity_type: str) -> list[str]:
    """Return what entity types this entity can create."""
    return HIERARCHY_CREATION_RULES.get(entity_type, [])
