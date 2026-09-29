"""
Kshricash - Entity Hierarchy Schemas
Pydantic models for entity management, hierarchy operations, KYC, and services
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# =====================================================
# HIERARCHY RULES
# =====================================================

# Who can create whom
HIERARCHY_CREATION_RULES: dict[str, list[str]] = {
    "superadmin": ["white_label", "agency", "distributor", "partner", "retailer", "merchant", "customer", "agent"],
    "white_label": ["agency", "distributor", "partner", "retailer"],
    "agency": ["distributor", "partner", "retailer"],
    "distributor": ["partner", "retailer"],
    "partner": ["retailer"],
    "retailer": [],
    "merchant": [],
    "customer": [],
    "agent": [],
}

# Hierarchy level (lower = higher authority)
HIERARCHY_LEVEL: dict[str, int] = {
    "superadmin": 0,
    "white_label": 1,
    "agency": 2,
    "distributor": 3,
    "partner": 4,
    "retailer": 5,
    "merchant": 6,
    "customer": 7,
    "agent": 5,
}

# KYC approval: who can approve whom
KYC_APPROVAL_RULES: dict[str, list[str]] = {
    "superadmin": ["white_label", "agency", "distributor", "partner", "retailer", "merchant", "customer", "agent"],
    "white_label": ["agency", "distributor", "partner", "retailer"],
    "agency": ["distributor", "partner", "retailer"],
    "distributor": ["partner", "retailer"],
    "partner": ["retailer"],
}


# =====================================================
# ENTITY CREATION
# =====================================================

class CreateEntityRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: str = Field(..., min_length=10, max_length=10)
    email: Optional[str] = None
    password: str = Field(..., min_length=8)
    entity_type: str = Field(..., description="Entity type to create")
    # Optional address
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class UpdateEntityRequest(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    daily_transaction_limit: Optional[float] = None
    per_transaction_limit: Optional[float] = None
    monthly_transaction_limit: Optional[float] = None


# =====================================================
# SERVICE ENABLEMENT
# =====================================================

class ServiceToggleRequest(BaseModel):
    service_code: str = Field(..., description="Service code to enable/disable")
    enabled: bool = Field(..., description="Enable or disable")


class BulkServiceToggleRequest(BaseModel):
    services: List[str] = Field(..., description="List of service codes")
    enabled: bool = Field(...)


# =====================================================
# KYC HIERARCHY APPROVAL
# =====================================================

class KYCApprovalRequest(BaseModel):
    remarks: Optional[str] = None


# =====================================================
# WALLET OPERATIONS
# =====================================================

class WalletLoadRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount to load (positive only)")
    description: str = Field(..., min_length=1, max_length=500)


# =====================================================
# DASHBOARD RESPONSE
# =====================================================

class EntityDashboardStats(BaseModel):
    # Entity info
    entity_type: str
    entity_name: str
    # Children counts
    total_children: int = 0
    active_children: int = 0
    children_by_type: dict = {}
    # KYC
    pending_kyc_approvals: int = 0
    # Financial
    wallet_balance: float = 0.0
    total_transactions: int = 0
    total_transaction_amount: float = 0.0
    total_commission_earned: float = 0.0
    # Tickets
    open_tickets: int = 0
