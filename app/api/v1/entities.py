"""
Kshricash - Entity Hierarchy Routes
Hierarchy-aware API: dashboard, create/manage children, KYC, services, wallet, transactions.
Works for ALL non-retailer entity types (superadmin uses /admin routes instead).
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
import logging

from app.database import get_db
from app.api.dependencies import get_current_active_user, EntityTypeChecker
from app.models_complete import User, EntityType
from app.schemas.entity import (
    CreateEntityRequest, UpdateEntityRequest,
    ServiceToggleRequest, KYCApprovalRequest, WalletLoadRequest,
    HIERARCHY_CREATION_RULES,
)
from app.crud.entity import (
    get_entity_dashboard,
    create_child_entity,
    list_children,
    get_child_detail,
    update_child_entity,
    toggle_child_lock,
    list_pending_kyc,
    approve_child_kyc,
    reject_child_kyc,
    toggle_child_service,
    get_child_services,
    load_child_wallet,
    list_hierarchy_transactions,
    list_hierarchy_commissions,
    get_creatable_types,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/entity", tags=["Entity Hierarchy"])

# Dependency: any authenticated entity (not just superadmin)
MANAGEMENT_ENTITIES = ["superadmin", "white_label", "agency", "distributor", "partner"]


def _enum_val(user, attr):
    val = getattr(user, attr, None)
    return val.value if hasattr(val, 'value') else str(val) if val else None


# =====================================================
# DASHBOARD (hierarchy-scoped)
# =====================================================

@router.get("/dashboard", summary="Get entity dashboard stats")
def entity_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get dashboard stats scoped to the current entity's hierarchy."""
    stats = get_entity_dashboard(db, current_user)
    entity_type = _enum_val(current_user, 'entity_type')
    stats["creatable_types"] = get_creatable_types(entity_type)
    return stats


# =====================================================
# LIST CHILDREN
# =====================================================

@router.get("/children", summary="List child entities")
def list_child_entities(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    entity_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    direct_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List entities under the current entity's hierarchy."""
    return list_children(db, current_user, page, per_page, entity_type, status, search, direct_only)


# =====================================================
# CREATE CHILD
# =====================================================

@router.post("/children", summary="Create a child entity", status_code=status.HTTP_201_CREATED)
def create_entity(
    data: CreateEntityRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Create a new child entity under the current entity."""
    try:
        result = create_child_entity(db, current_user, data.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# =====================================================
# GET CHILD DETAIL
# =====================================================

@router.get("/children/{child_id}", summary="Get child entity detail")
def get_entity_detail(
    child_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get detailed info for a child entity."""
    detail = get_child_detail(db, current_user, child_id)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found or not in your hierarchy")
    return detail


# =====================================================
# UPDATE CHILD
# =====================================================

@router.patch("/children/{child_id}", summary="Update a child entity")
def update_entity(
    child_id: int,
    data: UpdateEntityRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update a child entity's profile."""
    result = update_child_entity(db, current_user, child_id, data.model_dump(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found or not in your hierarchy")
    return result


# =====================================================
# LOCK / UNLOCK CHILD
# =====================================================

@router.patch("/children/{child_id}/lock", summary="Lock or unlock a child entity")
def lock_entity(
    child_id: int,
    lock: bool = True,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Lock or unlock a child entity."""
    result = toggle_child_lock(db, current_user, child_id, lock)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found or not in your hierarchy")
    return result


# =====================================================
# KYC MANAGEMENT (hierarchy-scoped)
# =====================================================

@router.get("/kyc", summary="List KYC submissions in hierarchy")
def list_kyc(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List KYC submissions from entities within your hierarchy."""
    return list_pending_kyc(db, current_user, page, per_page, status)


@router.post("/kyc/{kyc_id}/approve", summary="Approve KYC")
def approve_kyc(
    kyc_id: int,
    data: KYCApprovalRequest = KYCApprovalRequest(),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Approve KYC for a child entity."""
    try:
        return approve_child_kyc(db, current_user, kyc_id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/kyc/{kyc_id}/reject", summary="Reject KYC")
def reject_kyc(
    kyc_id: int,
    data: KYCApprovalRequest = KYCApprovalRequest(),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Reject KYC for a child entity."""
    try:
        return reject_child_kyc(db, current_user, kyc_id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# =====================================================
# SERVICE MANAGEMENT
# =====================================================

@router.get("/children/{child_id}/services", summary="Get child services")
def get_services(
    child_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get service configuration for a child entity."""
    result = get_child_services(db, current_user, child_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found or not in your hierarchy")
    return result


@router.post("/children/{child_id}/services", summary="Toggle service for child")
def toggle_service(
    child_id: int,
    data: ServiceToggleRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Enable or disable a service for a child entity."""
    try:
        return toggle_child_service(db, current_user, child_id, data.service_code, data.enabled)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# =====================================================
# WALLET LOAD (parent -> child)
# =====================================================

@router.post("/children/{child_id}/wallet/load", summary="Load child wallet")
def load_wallet(
    child_id: int,
    data: WalletLoadRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Transfer funds from your wallet to a child entity's wallet."""
    try:
        return load_child_wallet(db, current_user, child_id, data.amount, data.description)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# =====================================================
# TRANSACTIONS (hierarchy-scoped)
# =====================================================

@router.get("/transactions", summary="List hierarchy transactions")
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List transactions across your hierarchy."""
    return list_hierarchy_transactions(db, current_user, page, per_page, user_id, status, service_type)


# =====================================================
# COMMISSIONS (hierarchy-scoped)
# =====================================================

@router.get("/commissions", summary="List hierarchy commissions")
def list_commissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List commission ledger for your hierarchy."""
    return list_hierarchy_commissions(db, current_user, page, per_page)


# =====================================================
# MY PROFILE (convenience for entity dashboards)
# =====================================================

@router.get("/profile", summary="Get my entity profile")
def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get full profile including wallet, services, and limits."""
    from app.models_complete import Wallet as WalletModel
    wallets = db.query(WalletModel).filter(WalletModel.user_id == current_user.id).all()

    wallet_list = [{
        "id": w.id,
        "purpose": w.purpose.value if hasattr(w.purpose, 'value') else str(w.purpose),
        "balance": float(w.balance),
        "is_active": w.is_active,
    } for w in wallets]

    entity_type = _enum_val(current_user, 'entity_type')

    return {
        "id": current_user.id,
        "uuid": current_user.uuid,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "entity_type": entity_type,
        "status": _enum_val(current_user, 'status'),
        "kyc_status": _enum_val(current_user, 'kyc_status'),
        "is_active": current_user.is_active,
        "allowed_services": current_user.allowed_services or [],
        "blocked_services": current_user.blocked_services or [],
        "daily_transaction_limit": float(current_user.daily_transaction_limit) if current_user.daily_transaction_limit else None,
        "per_transaction_limit": float(current_user.per_transaction_limit) if current_user.per_transaction_limit else None,
        "monthly_transaction_limit": float(current_user.monthly_transaction_limit) if current_user.monthly_transaction_limit else None,
        "creatable_types": get_creatable_types(entity_type),
        "wallets": wallet_list,
        "created_at": str(current_user.created_at) if current_user.created_at else None,
        "last_login": str(current_user.last_login) if current_user.last_login else None,
    }
