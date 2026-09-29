"""
VasuPay - Admin Routes
Complete superadmin dashboard API: users, wallets, transactions,
commissions, settlements, KYC, tickets, audit logs
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.api.dependencies import is_superadmin
from app.models_complete import User
from app.schemas.admin import (
    UserUpdateRequest, UserCreateRequest,
    WalletAdjustRequest, KYCActionRequest,
    SettlementActionRequest, TicketReplyRequest, TicketStatusRequest,
)
from app.crud import admin as admin_crud

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


# =====================================================
# DASHBOARD
# =====================================================

@router.get("/dashboard", summary="Get dashboard stats")
def get_dashboard_stats(
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.get_dashboard_stats(db)


# =====================================================
# USER MANAGEMENT
# =====================================================

@router.get("/users", summary="List all users")
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    entity_type: str = Query(None),
    user_status: str = Query(None, alias="status"),
    kyc_status: str = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_users(db, page, per_page, search, entity_type, user_status, kyc_status)


@router.get("/users/{user_id}", summary="Get user detail")
def get_user_detail(
    user_id: int,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    result = admin_crud.get_user_detail(db, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.patch("/users/{user_id}", summary="Update user")
def update_user(
    user_id: int,
    data: UserUpdateRequest,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    result = admin_crud.update_user(db, user_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.post("/users", summary="Create user", status_code=201)
def create_user(
    data: UserCreateRequest,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.create_user_admin(db, {
            "full_name": data.full_name,
            "phone": data.phone,
            "email": data.email,
            "password": data.password,
            "entity_type": data.entity_type,
            "status": "active",
            "is_active": True,
        })
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.patch("/users/{user_id}/lock", summary="Lock/unlock user")
def toggle_user_lock(
    user_id: int,
    lock: bool = Body(True, embed=True),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_locked = lock
    if not lock:
        user.login_attempts = 0
        user.locked_until = None
    db.commit()
    action = "locked" if lock else "unlocked"
    return {"message": f"User {user_id} {action}"}


# =====================================================
# WALLET MANAGEMENT
# =====================================================

@router.get("/wallets", summary="List all wallets")
def list_wallets(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: int = Query(None),
    purpose: str = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_wallets(db, page, per_page, user_id, purpose)


@router.post("/wallets/{wallet_id}/adjust", summary="Adjust wallet balance")
def adjust_wallet(
    wallet_id: int,
    data: WalletAdjustRequest,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        result = admin_crud.adjust_wallet(db, wallet_id, data.amount, data.description, current_user.id)
        try:
            from app.services import audit_service
            amt = data.amount
            audit_service.record(
                channel=audit_service.CHANNEL_WALLET,
                action="WALLET_CREDIT" if (amt or 0) >= 0 else "WALLET_DEBIT",
                status=audit_service.STATUS_SUCCESS, provider="Internal (Admin)",
                user_id=current_user.id, actor_name=current_user.full_name,
                actor_phone=current_user.phone, reference_id=str(wallet_id),
                amount=abs(amt) if amt is not None else None,
                response_message=(data.description or "Admin wallet adjustment"),
            )
        except Exception:  # pragma: no cover - audit must not break the adjustment
            pass
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# TRANSACTION MANAGEMENT
# =====================================================

@router.get("/transactions", summary="List all transactions")
def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: int = Query(None),
    txn_status: str = Query(None, alias="status"),
    service_type: str = Query(None),
    search: str = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_transactions(db, page, per_page, user_id, txn_status, service_type, search)


@router.get("/transactions/{txn_id}", summary="Get transaction detail")
def get_transaction_detail(
    txn_id: int,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    result = admin_crud.get_transaction_detail(db, txn_id)
    if not result:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return result


# =====================================================
# COMMISSION MANAGEMENT
# =====================================================

@router.get("/commissions", summary="List commission ledger")
def list_commissions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: int = Query(None),
    is_credited: bool = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_commissions(db, page, per_page, user_id, is_credited)


@router.get("/commissions/summary", summary="Get commission summary")
def get_commission_summary(
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.get_commission_summary(db)


# =====================================================
# SETTLEMENT MANAGEMENT
# =====================================================

@router.get("/settlements", summary="List settlements")
def list_settlements(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    settlement_status: str = Query(None, alias="status"),
    user_id: int = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_settlements(db, page, per_page, settlement_status, user_id)


@router.post("/settlements/{settlement_id}/approve", summary="Approve settlement")
def approve_settlement(
    settlement_id: int,
    data: SettlementActionRequest = Body(default=SettlementActionRequest()),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.process_settlement(db, settlement_id, "approve", current_user.id, data.remarks, data.bank_reference)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/settlements/{settlement_id}/reject", summary="Reject settlement")
def reject_settlement(
    settlement_id: int,
    data: SettlementActionRequest = Body(default=SettlementActionRequest()),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.process_settlement(db, settlement_id, "reject", current_user.id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/settlements/{settlement_id}/complete", summary="Mark settlement complete")
def complete_settlement(
    settlement_id: int,
    data: SettlementActionRequest = Body(default=SettlementActionRequest()),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.process_settlement(db, settlement_id, "complete", current_user.id, data.remarks, data.bank_reference)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# KYC MANAGEMENT
# =====================================================

@router.get("/kyc", summary="List KYC submissions")
def list_kyc(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    kyc_status: str = Query(None, alias="status"),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_kyc_submissions(db, page, per_page, kyc_status)


@router.get("/kyc/{kyc_id}", summary="Get KYC detail with all documents")
def get_kyc_detail(
    kyc_id: int,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    detail = admin_crud.get_kyc_detail(db, kyc_id)
    if not detail:
        raise HTTPException(status_code=404, detail="KYC submission not found")
    return detail


@router.post("/kyc/{kyc_id}/approve", summary="Approve KYC")
def approve_kyc(
    kyc_id: int,
    data: KYCActionRequest = Body(default=KYCActionRequest()),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.process_kyc(db, kyc_id, "approve", current_user.id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/kyc/{kyc_id}/reject", summary="Reject KYC")
def reject_kyc(
    kyc_id: int,
    data: KYCActionRequest = Body(default=KYCActionRequest()),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.process_kyc(db, kyc_id, "reject", current_user.id, data.remarks)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# SUPPORT TICKETS
# =====================================================

@router.get("/tickets", summary="List support tickets")
def list_tickets(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    ticket_status: str = Query(None, alias="status"),
    priority: str = Query(None),
    user_id: int = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_tickets(db, page, per_page, ticket_status, priority, user_id)


@router.get("/tickets/{ticket_id}", summary="Get ticket detail")
def get_ticket_detail(
    ticket_id: int,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    result = admin_crud.get_ticket_detail(db, ticket_id)
    if not result:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return result


@router.post("/tickets/{ticket_id}/reply", summary="Reply to ticket")
def reply_to_ticket(
    ticket_id: int,
    data: TicketReplyRequest,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.reply_to_ticket(db, ticket_id, current_user.id, data.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/tickets/{ticket_id}/status", summary="Update ticket status")
def update_ticket_status(
    ticket_id: int,
    data: TicketStatusRequest,
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    try:
        return admin_crud.update_ticket_status(db, ticket_id, data.status, data.priority, data.assigned_to)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# =====================================================
# AUDIT LOGS
# =====================================================

@router.get("/logs", summary="List audit logs")
def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    user_id: int = Query(None),
    action: str = Query(None),
    resource_type: str = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    return admin_crud.list_audit_logs(db, page, per_page, user_id, action, resource_type)
