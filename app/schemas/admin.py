"""
VasuPay - Admin Schemas
Pydantic models for admin dashboard request/response validation
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# =====================================================
# DASHBOARD
# =====================================================

class DashboardStats(BaseModel):
    total_users: int = 0
    active_users: int = 0
    inactive_users: int = 0
    suspended_users: int = 0
    users_by_entity: dict = {}
    total_wallet_balance: float = 0.0
    total_transactions: int = 0
    successful_transactions: int = 0
    failed_transactions: int = 0
    total_transaction_amount: float = 0.0
    pending_kyc: int = 0
    verified_kyc: int = 0
    rejected_kyc: int = 0
    pending_settlements: int = 0
    pending_settlement_amount: float = 0.0
    open_tickets: int = 0
    total_commission_paid: float = 0.0


# =====================================================
# USER MANAGEMENT
# =====================================================

class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    entity_type: Optional[str] = None
    is_active: Optional[bool] = None
    daily_limit: Optional[float] = None
    per_transaction_limit: Optional[float] = None
    monthly_limit: Optional[float] = None


class UserCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=10)
    email: Optional[str] = None
    password: str = Field(..., min_length=8)
    entity_type: str = Field(default="retailer")


# =====================================================
# WALLET MANAGEMENT
# =====================================================

class WalletAdjustRequest(BaseModel):
    amount: float = Field(..., description="Amount to add (positive) or deduct (negative)")
    description: str = Field(..., min_length=1, max_length=500)


# =====================================================
# KYC MANAGEMENT
# =====================================================

class KYCActionRequest(BaseModel):
    remarks: Optional[str] = None


# =====================================================
# SETTLEMENT MANAGEMENT
# =====================================================

class SettlementActionRequest(BaseModel):
    remarks: Optional[str] = None
    bank_reference: Optional[str] = None


# =====================================================
# TICKET MANAGEMENT
# =====================================================

class TicketCreateRequest(BaseModel):
    user_id: int
    subject: str = Field(..., min_length=1, max_length=500)
    message: str = Field(..., min_length=1, max_length=5000)
    category: Optional[str] = "general"
    priority: Optional[str] = "medium"


class TicketReplyRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)


class TicketStatusRequest(BaseModel):
    status: str = Field(..., description="open, in_progress, resolved, closed")
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
