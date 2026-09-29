"""
Kshricash - Complete Production Database Models
Comprehensive SQLAlchemy Models with All Features

Version: 2.0
Lines: ~2500+
Models: 35

Features:
✅ All 35 models with complete field sets
✅ Fixed all foreign key ambiguity issues
✅ Extensive validation methods
✅ Hybrid properties and computed fields
✅ Complete audit trail
✅ Optimistic locking
✅ Soft delete support
✅ India timezone handling
✅ Auto-generated IDs
✅ Comprehensive indexes
✅ Detailed constraints
✅ Business logic helpers
"""

from datetime import datetime, date, timedelta
import enum
import uuid
import re
from decimal import Decimal
from typing import Optional, Dict, Any, List

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum as SQLEnum, ForeignKey,
    Numeric, JSON, Text, UniqueConstraint, Index, Date,
    CheckConstraint, event, BigInteger, SmallInteger, func
)
from sqlalchemy.orm import declarative_base, relationship, validates, backref
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
from sqlalchemy.sql import select

import pytz

Base = declarative_base()

# India timezone
INDIA_TZ = pytz.timezone('Asia/Kolkata')


def get_india_time():
    """Get current datetime in India timezone"""
    return datetime.now(INDIA_TZ)


def gen_uuid():
    """Generate UUID string"""
    return str(uuid.uuid4())


# =====================================================
# ENUMS (Complete Set)
# =====================================================

class EntityType(str, enum.Enum):
    """Entity types in the system hierarchy"""
    SUPERADMIN = "superadmin"
    WHITE_LABEL = "white_label"
    AGENCY = "agency"
    DISTRIBUTOR = "distributor"
    PARTNER = "partner"
    RETAILER = "retailer"
    MERCHANT = "merchant"
    CUSTOMER = "customer"
    AGENT = "agent"


class UserStatus(str, enum.Enum):
    """User account status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    BLOCKED = "blocked"
    DEACTIVATED = "deactivated"


class KYCStatus(str, enum.Enum):
    """KYC verification status"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    UNDER_REVIEW = "under_review"
    IN_PROGRESS = "in_progress"
    EXPIRED = "expired"
    RESUBMITTED = "resubmitted"


class KYCDocumentType(str, enum.Enum):
    """KYC document types"""
    AADHAAR = "aadhaar"
    PAN = "pan"
    PASSPORT = "passport"
    DRIVING_LICENSE = "driving_license"
    VOTER_ID = "voter_id"
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    GST_CERTIFICATE = "gst_certificate"
    SHOP_ACT = "shop_act"
    CANCELLED_CHEQUE = "cancelled_cheque"


class TransactionType(str, enum.Enum):
    """Transaction types"""
    CREDIT = "credit"
    DEBIT = "debit"
    REVERSAL = "reversal"
    COMMISSION = "commission"
    SETTLEMENT = "settlement"
    REFUND = "refund"
    CHARGE = "charge"
    TRANSFER = "transfer"
    WITHDRAWAL = "withdrawal"
    DEPOSIT = "deposit"


class TransactionStatus(str, enum.Enum):
    """Transaction status"""
    INITIATED = "initiated"
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REVERSED = "reversed"
    CANCELLED = "cancelled"
    HOLD = "hold"
    PROCESSING = "processing"
    TIMEOUT = "timeout"
    DISPUTED = "disputed"


class TransactionMode(str, enum.Enum):
    """Transaction modes"""
    UPI = "upi"
    NEFT = "neft"
    RTGS = "rtgs"
    IMPS = "imps"
    CASH = "cash"
    WALLET = "wallet"
    CARD = "card"
    NET_BANKING = "net_banking"
    CHEQUE = "cheque"


class SettlementStatus(str, enum.Enum):
    """Settlement status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REVERSED = "reversed"


class WalletPurpose(str, enum.Enum):
    """Wallet purposes"""
    MAIN = "main"
    COMMISSION = "commission"
    AEPS = "aeps"
    DMT = "dmt"
    BBPS = "bbps"
    RECHARGE = "recharge"
    SECURITY = "security"
    REWARD = "reward"
    CASHBACK = "cashback"


class ChargeType(str, enum.Enum):
    """Types of charges"""
    FLAT = "flat"
    PERCENTAGE = "percentage"
    SLAB = "slab"
    TIERED = "tiered"


class GSTType(str, enum.Enum):
    """GST calculation types"""
    INCLUSIVE = "inclusive"
    EXCLUSIVE = "exclusive"
    NONE = "none"


class CommissionType(str, enum.Enum):
    """Commission types"""
    FLAT = "flat"
    PERCENTAGE = "percentage"
    SLAB = "slab"
    DYNAMIC = "dynamic"
    HYBRID = "hybrid"


class ServiceCategory(str, enum.Enum):
    """Service categories"""
    BBPS = "bbps"
    AEPS = "aeps"
    DMT = "dmt"
    PAN_CARD = "pan_card"
    INSURANCE = "insurance"
    LOAN = "loan"
    RECHARGE = "recharge"
    UPI = "upi"
    ELECTRICITY = "electricity"
    WATER = "water"
    GAS = "gas"
    MOBILE_PREPAID = "mobile_prepaid"
    MOBILE_POSTPAID = "mobile_postpaid"
    DTH = "dth"
    BROADBAND = "broadband"
    CREDIT_CARD = "credit_card"
    FASTAG = "fastag"
    OTHER = "other"


class ServiceType(str, enum.Enum):
    """Service types"""
    FINANCIAL = "financial"
    UTILITY = "utility"
    TRAVEL = "travel"
    GOVERNMENT = "government"
    RECHARGE = "recharge"
    INSURANCE = "insurance"
    PAYMENT = "payment"


class AuditAction(str, enum.Enum):
    """Audit trail actions"""
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    TRANSACTION = "transaction"
    KYC_SUBMIT = "kyc_submit"
    KYC_APPROVE = "kyc_approve"
    KYC_REJECT = "kyc_reject"
    WALLET_CREDIT = "wallet_credit"
    WALLET_DEBIT = "wallet_debit"
    SETTLEMENT = "settlement"
    PASSWORD_CHANGE = "password_change"


class NotificationType(str, enum.Enum):
    """Notification types"""
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"
    WEBHOOK = "webhook"


class NotificationPriority(str, enum.Enum):
    """Notification priority"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class WebhookEvent(str, enum.Enum):
    """Webhook events"""
    TRANSACTION_SUCCESS = "transaction.success"
    TRANSACTION_FAILED = "transaction.failed"
    WALLET_LOW_BALANCE = "wallet.low_balance"
    KYC_APPROVED = "kyc.approved"
    KYC_REJECTED = "kyc.rejected"
    SETTLEMENT_COMPLETED = "settlement.completed"


class TicketStatus(str, enum.Enum):
    """Support ticket status"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    REOPENED = "reopened"


class TicketPriority(str, enum.Enum):
    """Support ticket priority"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# =====================================================
# MIXINS (Enhanced)
# =====================================================

class TimestampMixin:
    """Timestamp mixin with India timezone"""
    created_at = Column(DateTime(timezone=True), default=get_india_time, nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=get_india_time, onupdate=get_india_time, nullable=False)


class SoftDeleteMixin:
    """Soft delete mixin"""
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    deleted_by = Column(Integer, nullable=True)  # ForeignKey will be added in models


class VersionMixin:
    """Optimistic locking version control"""
    version = Column(Integer, default=1, nullable=False)


class MetadataMixin:
    """Common metadata fields"""
    meta = Column(JSON, default=dict, nullable=False)
    tags = Column(JSON, default=list, nullable=False)


# =====================================================
# WHITE LABEL / ORGANIZATION STRUCTURE
# =====================================================

class WhiteLabel(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """White Label platform configuration"""
    __tablename__ = "white_labels"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Basic Details
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    subdomain = Column(String(100), unique=True, nullable=True)

    # Contact Details
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    country = Column(String(100), default="India")

    # Business Details
    business_name = Column(String(255), nullable=False)
    gst_number = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    cin_number = Column(String(21), unique=True, nullable=True)
    tan_number = Column(String(10), unique=True, nullable=True)

    # Bank Details
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    branch_name = Column(String(255))
    account_type = Column(String(20))  # SAVINGS, CURRENT

    # Branding
    logo_url = Column(String(500))
    favicon_url = Column(String(500))
    banner_url = Column(String(500))
    primary_color = Column(String(20), default="#1976D2")
    secondary_color = Column(String(20), default="#424242")
    accent_color = Column(String(20), default="#FF4081")
    branding_config = Column(JSON, default=dict)

    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    commission_lock = Column(Boolean, default=False, nullable=False)
    allow_sub_entities = Column(Boolean, default=True, nullable=False)

    # Limits
    max_agencies = Column(Integer, default=10)
    max_users = Column(Integer, default=1000)
    max_daily_transaction_limit = Column(Numeric(15, 2), default=Decimal('10000000.00'))

    # KYC Status
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    kyc_rejection_reason = Column(Text)

    # Metadata
    license_key = Column(String(255), unique=True)
    license_expiry = Column(Date)
    features = Column(JSON, default=dict)
    settings = Column(JSON, default=dict)

    # API Configuration
    api_enabled = Column(Boolean, default=False)
    api_key = Column(String(255), unique=True)
    api_secret_hash = Column(String(255))
    api_rate_limit = Column(Integer, default=1000)  # requests per hour

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    agencies = relationship("Agency", back_populates="white_label", cascade="all, delete-orphan")
    services = relationship("WhiteLabelService", back_populates="white_label", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_white_label_code_domain", "code", "domain"),
        Index("ix_white_label_active_verified", "is_active", "is_verified"),
        CheckConstraint("max_agencies >= 0", name="ck_wl_max_agencies"),
        CheckConstraint("max_users >= 0", name="ck_wl_max_users"),
    )

    @validates('email')
    def validate_email(self, key, email):
        """Validate email format"""
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email.lower() if email else None

    @validates('phone')
    def validate_phone(self, key, phone):
        """Validate phone number (Indian format)"""
        if phone and not re.match(r'^[6-9]\d{9}$', phone):
            raise ValueError("Invalid Indian phone number format")
        return phone

    @validates('gst_number')
    def validate_gst(self, key, gst):
        """Validate GST number"""
        if gst and not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', gst.upper()):
            raise ValueError("Invalid GST format")
        return gst.upper() if gst else None

    @validates('pan_number')
    def validate_pan(self, key, pan):
        """Validate PAN number"""
        if pan and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan.upper()):
            raise ValueError("Invalid PAN format")
        return pan.upper() if pan else None

    @hybrid_property
    def is_license_valid(self):
        """Check if license is valid"""
        if not self.license_expiry:
            return True
        return self.license_expiry >= date.today()

    def __repr__(self):
        return f"<WhiteLabel(id={self.id}, code={self.code}, name={self.name})>"


class Agency(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Agency under White Label"""
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    white_label_id = Column(Integer, ForeignKey("white_labels.id", ondelete="CASCADE"), nullable=False, index=True)

    # Agency Details
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    contact_person = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))

    # Business Details
    business_name = Column(String(255))
    gst_number = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))

    # Bank Details
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    branch_name = Column(String(255))
    account_type = Column(String(20))

    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    min_balance_alert = Column(Numeric(10, 2), default=Decimal('1000.00'))
    commission_lock = Column(Boolean, default=False, nullable=False)
    allow_sub_entities = Column(Boolean, default=True, nullable=False)

    # Commission Settings
    commission_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))
    max_commission_share = Column(Numeric(5, 2), default=Decimal('100.00'))

    # Limits
    max_distributors = Column(Integer, default=50)
    max_daily_transaction = Column(Numeric(15, 2), default=Decimal('1000000.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('50000.00'))

    # KYC Status
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    kyc_rejection_reason = Column(Text)

    # Metadata
    settings = Column(JSON, default=dict)
    features = Column(JSON, default=dict)

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    white_label = relationship("WhiteLabel", back_populates="agencies")
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    distributors = relationship("Distributor", back_populates="agency", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_agency_white_label_active", "white_label_id", "is_active"),
        CheckConstraint("commission_percentage >= 0 AND commission_percentage <= 100", name="ck_agency_commission"),
    )

    @validates('email', 'phone', 'gst_number', 'pan_number')
    def validate_fields(self, key, value):
        """Reuse validators from WhiteLabel"""
        if key == 'email' and value:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise ValueError("Invalid email format")
            return value.lower()
        elif key == 'phone' and value:
            if not re.match(r'^[6-9]\d{9}$', value):
                raise ValueError("Invalid phone number")
            return value
        elif key == 'gst_number' and value:
            if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value.upper()):
                raise ValueError("Invalid GST format")
            return value.upper()
        elif key == 'pan_number' and value:
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value.upper()):
                raise ValueError("Invalid PAN format")
            return value.upper()
        return value

    def __repr__(self):
        return f"<Agency(id={self.id}, code={self.code}, name={self.name})>"


class Distributor(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Distributor under Agency"""
    __tablename__ = "distributors"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_distributor_id = Column(Integer, ForeignKey("distributors.id", ondelete="SET NULL"), nullable=True, index=True)

    # Hierarchy tracking
    level = Column(SmallInteger, default=1, nullable=False)
    hierarchy_path = Column(String(500))  # e.g., "1/5/12"

    # Distributor Details
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    contact_person = Column(String(255))
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))

    # Business Details
    business_name = Column(String(255))
    gst_number = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))

    # Bank Details
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    branch_name = Column(String(255))

    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    min_balance_alert = Column(Numeric(10, 2), default=Decimal('500.00'))
    commission_lock = Column(Boolean, default=False, nullable=False)
    allow_sub_distributors = Column(Boolean, default=True, nullable=False)

    # Commission Settings
    commission_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))
    max_commission_percent = Column(Numeric(5, 2), default=Decimal('100.00'))
    min_commission_percent = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Limits
    max_partners = Column(Integer, default=100)
    max_daily_transaction = Column(Numeric(15, 2), default=Decimal('500000.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('25000.00'))

    # KYC Status
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    kyc_rejection_reason = Column(Text)

    # Metadata
    settings = Column(JSON, default=dict)
    features = Column(JSON, default=dict)

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    agency = relationship("Agency", back_populates="distributors")
    parent = relationship("Distributor", remote_side=[id], backref=backref("sub_distributors", cascade="all, delete-orphan"))
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    partners = relationship("Partner", back_populates="distributor", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_distributor_agency_active", "agency_id", "is_active"),
        Index("ix_distributor_hierarchy", "hierarchy_path"),
        CheckConstraint("level >= 1 AND level <= 5", name="ck_distributor_level"),
        CheckConstraint("commission_percentage >= 0 AND commission_percentage <= 100", name="ck_dist_commission"),
    )

    @validates('email', 'phone', 'gst_number', 'pan_number')
    def validate_fields(self, key, value):
        """Field validations"""
        if key == 'email' and value:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise ValueError("Invalid email format")
            return value.lower()
        elif key == 'phone' and value:
            if not re.match(r'^[6-9]\d{9}$', value):
                raise ValueError("Invalid phone number")
            return value
        elif key == 'gst_number' and value:
            if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value.upper()):
                raise ValueError("Invalid GST format")
            return value.upper()
        elif key == 'pan_number' and value:
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value.upper()):
                raise ValueError("Invalid PAN format")
            return value.upper()
        return value

    def __repr__(self):
        return f"<Distributor(id={self.id}, code={self.code}, level={self.level})>"


class Partner(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Partner under Distributor"""
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id", ondelete="CASCADE"), nullable=False, index=True)

    # Partner Details
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    contact_person = Column(String(255))
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))

    # Business Details
    business_name = Column(String(255))
    shop_name = Column(String(255))
    gst_number = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    address = Column(Text)
    shop_address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    landmark = Column(String(255))

    # Business Hours
    opening_time = Column(String(10))  # HH:MM
    closing_time = Column(String(10))
    working_days = Column(JSON, default=list)  # ["MON", "TUE", ...]

    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    min_balance_alert = Column(Numeric(10, 2), default=Decimal('200.00'))
    commission_lock = Column(Boolean, default=False, nullable=False)

    # Commission Settings
    commission_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Limits
    max_retailers = Column(Integer, default=50)
    max_daily_transaction = Column(Numeric(15, 2), default=Decimal('200000.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('15000.00'))

    # KYC Status
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    kyc_rejection_reason = Column(Text)

    # Geolocation
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))

    # Metadata
    settings = Column(JSON, default=dict)
    features = Column(JSON, default=dict)

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    distributor = relationship("Distributor", back_populates="partners")
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    retailers = relationship("Retailer", back_populates="partner", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_partner_distributor_active", "distributor_id", "is_active"),
        Index("ix_partner_location", "latitude", "longitude"),
        Index("ix_partner_pincode", "pincode"),
        CheckConstraint("commission_percentage >= 0 AND commission_percentage <= 100", name="ck_partner_commission"),
    )

    @validates('email', 'phone', 'gst_number', 'pan_number')
    def validate_fields(self, key, value):
        """Field validations"""
        if key == 'email' and value:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise ValueError("Invalid email format")
            return value.lower()
        elif key == 'phone' and value:
            if not re.match(r'^[6-9]\d{9}$', value):
                raise ValueError("Invalid phone number")
            return value
        elif key == 'gst_number' and value:
            if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value.upper()):
                raise ValueError("Invalid GST format")
            return value.upper()
        elif key == 'pan_number' and value:
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value.upper()):
                raise ValueError("Invalid PAN format")
            return value.upper()
        return value

    def __repr__(self):
        return f"<Partner(id={self.id}, code={self.code}, name={self.name})>"


class Retailer(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Retailer under Partner"""
    __tablename__ = "retailers"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    partner_id = Column(Integer, ForeignKey("partners.id", ondelete="CASCADE"), nullable=False, index=True)

    # Retailer Details
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(20), nullable=False, index=True)
    alternate_phone = Column(String(20))

    # Business Details
    shop_name = Column(String(255))
    shop_type = Column(String(100))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    landmark = Column(String(255))

    # Settings
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    min_balance_alert = Column(Numeric(10, 2), default=Decimal('100.00'))

    # Limits
    max_daily_transaction = Column(Numeric(15, 2), default=Decimal('50000.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('5000.00'))

    # KYC Status
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    kyc_rejection_reason = Column(Text)

    # Geolocation
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))

    # Metadata
    settings = Column(JSON, default=dict)

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    partner = relationship("Partner", back_populates="retailers")
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)

    __table_args__ = (
        Index("ix_retailer_partner_active", "partner_id", "is_active"),
        Index("ix_retailer_pincode", "pincode"),
        Index("ix_retailer_location", "latitude", "longitude"),
    )

    @validates('email', 'phone')
    def validate_fields(self, key, value):
        """Field validations"""
        if key == 'email' and value:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise ValueError("Invalid email format")
            return value.lower()
        elif key == 'phone' and value:
            if not re.match(r'^[6-9]\d{9}$', value):
                raise ValueError("Invalid phone number")
            return value
        return value

    def __repr__(self):
        return f"<Retailer(id={self.id}, code={self.code}, name={self.name})>"


class Customer(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """End customers using services"""
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Customer Details
    full_name = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    alternate_phone = Column(String(20))
    date_of_birth = Column(Date)
    gender = Column(String(10))  # MALE, FEMALE, OTHER

    # KYC Details (optional for customers)
    aadhaar_number = Column(String(12), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)

    # Address
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    country = Column(String(100), default="India")

    # Contact Preferences
    preferred_language = Column(String(10), default="en")
    preferred_communication = Column(String(20), default="SMS")  # SMS, EMAIL, WHATSAPP

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    blacklist_reason = Column(Text)

    # Segmentation
    customer_type = Column(String(50), default="REGULAR")  # REGULAR, PREMIUM, VIP
    customer_segment = Column(String(50))  # RETAIL, CORPORATE, etc.

    # Statistics
    total_transactions = Column(BigInteger, default=0)
    total_spent = Column(Numeric(15, 2), default=Decimal('0.00'))
    last_transaction_at = Column(DateTime(timezone=True))

    # Metadata
    notes = Column(Text)
    preferences = Column(JSON, default=dict)

    # Relationships
    transactions = relationship("Transaction", foreign_keys="Transaction.customer_id", back_populates="customer")

    __table_args__ = (
        Index("ix_customer_phone_email", "phone", "email"),
        Index("ix_customer_name", "full_name"),
    )

    @validates('email')
    def validate_email(self, key, email):
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email.lower() if email else None

    @validates('phone', 'alternate_phone')
    def validate_phone(self, key, phone):
        if phone and not re.match(r'^[6-9]\d{9}$', phone):
            raise ValueError("Invalid phone number")
        return phone

    @validates('aadhaar_number')
    def validate_aadhaar(self, key, aadhaar):
        if aadhaar and not re.match(r'^\d{12}$', aadhaar):
            raise ValueError("Aadhaar must be 12 digits")
        return aadhaar

    @validates('pan_number')
    def validate_pan(self, key, pan):
        if pan and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan.upper()):
            raise ValueError("Invalid PAN format")
        return pan.upper() if pan else None

    def __repr__(self):
        return f"<Customer(id={self.id}, phone={self.phone}, name={self.full_name})>"


class Merchant(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Merchants accepting payments"""
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Merchant Details
    business_name = Column(String(255), nullable=False, index=True)
    merchant_code = Column(String(50), unique=True, nullable=False, index=True)
    owner_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    alternate_phone = Column(String(20))

    # Business Details
    business_type = Column(String(100))  # RETAIL, RESTAURANT, SERVICE, etc.
    category = Column(String(100))
    sub_category = Column(String(100))
    gst_number = Column(String(15), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    business_registration_number = Column(String(50))

    # Address
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    country = Column(String(100), default="India")

    # Location
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))

    # Bank Details
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    branch_name = Column(String(255))

    # Payment Configuration
    qr_code_url = Column(String(500))
    upi_id = Column(String(100), unique=True)
    payment_gateway = Column(String(100))
    merchant_id_gateway = Column(String(100))

    # Settlement Configuration
    settlement_cycle = Column(String(20), default="DAILY")  # DAILY, WEEKLY, MONTHLY
    settlement_day = Column(SmallInteger)  # 1-31 for monthly, 1-7 for weekly
    auto_settlement = Column(Boolean, default=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_featured = Column(Boolean, default=False)

    # KYC
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    kyc_verified_at = Column(DateTime(timezone=True))
    kyc_verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    # Business Hours
    opening_time = Column(String(10))
    closing_time = Column(String(10))
    working_days = Column(JSON, default=list)

    # Limits
    max_daily_transaction = Column(Numeric(15, 2), default=Decimal('500000.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('50000.00'))

    # Statistics
    total_transactions = Column(BigInteger, default=0)
    total_revenue = Column(Numeric(20, 2), default=Decimal('0.00'))
    average_transaction_value = Column(Numeric(15, 2), default=Decimal('0.00'))

    # Ratings & Reviews
    rating = Column(Numeric(3, 2), default=Decimal('0.00'))
    total_reviews = Column(Integer, default=0)

    # Metadata
    settings = Column(JSON, default=dict)
    features = Column(JSON, default=dict)
    business_info = Column(JSON, default=dict)

    # Relationships
    transactions = relationship("Transaction", foreign_keys="Transaction.merchant_id", back_populates="merchant")

    __table_args__ = (
        Index("ix_merchant_code_active", "merchant_code", "is_active"),
        Index("ix_merchant_location", "latitude", "longitude"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_merchant_rating"),
    )

    @validates('email', 'phone', 'gst_number', 'pan_number')
    def validate_fields(self, key, value):
        if key == 'email' and value:
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
                raise ValueError("Invalid email format")
            return value.lower()
        elif key in ('phone', 'alternate_phone') and value:
            if not re.match(r'^[6-9]\d{9}$', value):
                raise ValueError("Invalid phone number")
            return value
        elif key == 'gst_number' and value:
            if not re.match(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$', value.upper()):
                raise ValueError("Invalid GST format")
            return value.upper()
        elif key == 'pan_number' and value:
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value.upper()):
                raise ValueError("Invalid PAN format")
            return value.upper()
        return value

    def __repr__(self):
        return f"<Merchant(id={self.id}, code={self.merchant_code}, name={self.business_name})>"


# =====================================================
# USER MANAGEMENT (Enhanced)
# =====================================================

class User(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Central user table for all entity types"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Entity Relationships (User belongs to ONE entity type)
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=False, index=True)
    white_label_id = Column(Integer, ForeignKey("white_labels.id", ondelete="CASCADE"), nullable=True)
    agency_id = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id", ondelete="CASCADE"), nullable=True)
    partner_id = Column(Integer, ForeignKey("partners.id", ondelete="CASCADE"), nullable=True)
    retailer_id = Column(Integer, ForeignKey("retailers.id", ondelete="CASCADE"), nullable=True)
    parent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Personal Details
    full_name = Column(String(255), nullable=False, index=True)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    alternate_phone = Column(String(20))
    alternate_email = Column(String(255))

    # Authentication
    password_hash = Column(String(512), nullable=False)
    password_changed_at = Column(DateTime(timezone=True))
    password_expiry = Column(DateTime(timezone=True))
    force_password_change = Column(Boolean, default=False)

    # MPIN for transactions
    mpin_hash = Column(String(256))
    mpin_set_at = Column(DateTime(timezone=True))
    mpin_attempts = Column(SmallInteger, default=0)

    # KYC Details
    aadhaar_number = Column(String(12), unique=True, nullable=True, index=True)
    pan_number = Column(String(10), unique=True, nullable=True, index=True)
    date_of_birth = Column(Date)
    gender = Column(String(10))
    nationality = Column(String(50), default="Indian")

    # Address
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10), index=True)
    country = Column(String(100), default="India")

    # Status
    status = Column(SQLEnum(UserStatus, native_enum=False), default=UserStatus.PENDING_VERIFICATION, nullable=False,
                    index=True)
    kyc_status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Settings
    language = Column(String(10), default="en")
    timezone = Column(String(50), default="Asia/Kolkata")
    date_format = Column(String(20), default="DD/MM/YYYY")
    currency = Column(String(3), default="INR")

    # Security
    last_login = Column(DateTime(timezone=True), index=True)
    last_login_ip = Column(String(50))
    last_login_device = Column(String(255))
    login_attempts = Column(Integer, default=0, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False, index=True)
    locked_until = Column(DateTime(timezone=True))
    locked_reason = Column(String(500))

    # Two-Factor Authentication
    otp_secret = Column(String(100))
    two_factor_enabled = Column(Boolean, default=False, nullable=False)
    two_factor_method = Column(String(20))  # SMS, EMAIL, TOTP

    # Verification
    email_verified = Column(Boolean, default=False, nullable=False)
    email_verified_at = Column(DateTime(timezone=True))
    email_verification_token = Column(String(255))
    phone_verified = Column(Boolean, default=False, nullable=False)
    phone_verified_at = Column(DateTime(timezone=True))
    phone_verification_token = Column(String(100))

    # Transaction Limits
    daily_transaction_limit = Column(Numeric(15, 2), default=Decimal('50000.00'))
    per_transaction_limit = Column(Numeric(15, 2), default=Decimal('10000.00'))
    monthly_transaction_limit = Column(Numeric(15, 2), default=Decimal('200000.00'))

    # Current Usage (reset daily/monthly)
    today_transaction_count = Column(Integer, default=0)
    today_transaction_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    month_transaction_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    limits_reset_date = Column(Date)

    # API Access
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    api_secret_hash = Column(String(255), nullable=True)
    api_enabled = Column(Boolean, default=False, nullable=False)
    api_rate_limit = Column(Integer, default=100)  # requests per hour
    api_last_used = Column(DateTime(timezone=True))

    # Permissions & Roles (JSON array of permission codes)
    permissions = Column(JSON, default=list)
    roles = Column(JSON, default=list)
    allowed_services = Column(JSON, default=list)
    blocked_services = Column(JSON, default=list)

    # Profile
    profile_image_url = Column(String(500))
    cover_image_url = Column(String(500))
    bio = Column(Text)
    website = Column(String(255))

    # Preferences
    preferences = Column(JSON, default=dict)
    notification_settings = Column(JSON, default=dict)
    privacy_settings = Column(JSON, default=dict)

    # Device Management
    device_tokens = Column(JSON, default=list)  # For push notifications
    registered_devices = Column(JSON, default=list)
    max_devices = Column(SmallInteger, default=3)

    # Activity Tracking
    last_activity = Column(DateTime(timezone=True))
    total_logins = Column(BigInteger, default=0)
    total_transactions = Column(BigInteger, default=0)

    # Referral System
    referral_code = Column(String(20), unique=True, index=True)
    referred_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    referral_count = Column(Integer, default=0)

    # Self-referential audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships - All fixed for foreign key ambiguity
    creator = relationship("User", remote_side=[id], foreign_keys=[created_by], post_update=True)
    updater = relationship("User", remote_side=[id], foreign_keys=[updated_by], post_update=True)
    parent = relationship("User", remote_side=[id], foreign_keys=[parent_id], backref=backref("children"),
                          post_update=True)
    referrer = relationship("User", remote_side=[id], foreign_keys=[referred_by], post_update=True)

    wallets = relationship("Wallet", back_populates="user", foreign_keys="[Wallet.user_id]",
                           cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", foreign_keys="[Transaction.user_id]")
    kyc_document = relationship("UserKYC", back_populates="user", foreign_keys="[UserKYC.user_id]", uselist=False,
                                cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", foreign_keys="[UserSession.user_id]",
                            cascade="all, delete-orphan")
    webhooks = relationship("Webhook", back_populates="user", foreign_keys="[Webhook.user_id]")
    tickets = relationship("SupportTicket", back_populates="user", foreign_keys="[SupportTicket.user_id]")

    __table_args__ = (
        Index("ix_user_entity_status", "entity_type", "status"),
        Index("ix_user_phone_email", "phone", "email"),
        Index("ix_user_referral_code", "referral_code"),
        CheckConstraint(
            """
            (entity_type = 'white_label' AND white_label_id IS NOT NULL) OR
            (entity_type = 'agency' AND agency_id IS NOT NULL) OR
            (entity_type = 'distributor' AND distributor_id IS NOT NULL) OR
            (entity_type = 'partner' AND partner_id IS NOT NULL) OR
            (entity_type = 'retailer' AND retailer_id IS NOT NULL) OR
            entity_type IN ('superadmin', 'customer', 'merchant', 'agent')
            """,
            name="ck_user_entity_relationship"
        ),
        CheckConstraint("login_attempts >= 0", name="ck_user_login_attempts"),
        CheckConstraint("daily_transaction_limit >= 0", name="ck_user_daily_limit"),
    )

    @validates('email', 'alternate_email')
    def validate_email(self, key, email):
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise ValueError("Invalid email format")
        return email.lower() if email else None

    @validates('phone', 'alternate_phone')
    def validate_phone(self, key, phone):
        if phone and not re.match(r'^[6-9]\d{9}$', phone):
            raise ValueError("Invalid Indian phone number format")
        return phone

    @validates('aadhaar_number')
    def validate_aadhaar(self, key, aadhaar):
        if aadhaar and not re.match(r'^\d{12}$', aadhaar):
            raise ValueError("Aadhaar must be 12 digits")
        return aadhaar

    @validates('pan_number')
    def validate_pan(self, key, pan):
        if pan and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan.upper()):
            raise ValueError("Invalid PAN format")
        return pan.upper() if pan else None

    @hybrid_property
    def is_limit_exceeded(self):
        """Check if daily limit is exceeded"""
        if not self.limits_reset_date or self.limits_reset_date != date.today():
            return False
        return self.today_transaction_amount >= self.daily_transaction_limit

    @hybrid_property
    def available_daily_limit(self):
        """Calculate available daily limit"""
        if not self.limits_reset_date or self.limits_reset_date != date.today():
            return self.daily_transaction_limit
        return max(Decimal('0.00'), self.daily_transaction_limit - self.today_transaction_amount)

    def reset_daily_limits(self):
        """Reset daily transaction limits"""
        self.today_transaction_count = 0
        self.today_transaction_amount = Decimal('0.00')
        self.limits_reset_date = date.today()

    def __repr__(self):
        return f"<User(id={self.id}, type={self.entity_type}, phone={self.phone})>"


class UserSession(Base, TimestampMixin):
    """Track user login sessions"""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Session Details
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    refresh_token = Column(String(255), unique=True, nullable=True)
    session_id = Column(String(100), unique=True, nullable=False)

    # Device Information
    device_id = Column(String(255))
    device_name = Column(String(255))
    device_type = Column(String(50))  # WEB, MOBILE_ANDROID, MOBILE_IOS, TABLET
    device_os = Column(String(100))
    device_browser = Column(String(100))
    app_version = Column(String(50))

    # Network Details
    ip_address = Column(String(50), index=True)
    user_agent = Column(Text)
    location = Column(String(255))
    country = Column(String(100))
    city = Column(String(100))

    # Session State
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_activity = Column(DateTime(timezone=True), default=get_india_time, onupdate=get_india_time)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    logged_out_at = Column(DateTime(timezone=True))
    logout_reason = Column(String(100))  # USER_LOGOUT, TIMEOUT, FORCED, SECURITY

    # Security
    is_suspicious = Column(Boolean, default=False)
    suspicious_reason = Column(String(500))

    # Activity Tracking
    request_count = Column(Integer, default=0)
    last_request_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", back_populates="sessions", foreign_keys=[user_id])

    __table_args__ = (
        Index("ix_session_user_active", "user_id", "is_active"),
        Index("ix_session_token_expires", "session_token", "expires_at"),
        Index("ix_session_ip", "ip_address", "created_at"),
    )

    @hybrid_property
    def is_expired(self):
        """Check if session is expired"""
        return datetime.now(INDIA_TZ) > self.expires_at

    @hybrid_property
    def time_remaining(self):
        """Get remaining session time in seconds"""
        if self.is_expired:
            return 0
        delta = self.expires_at - datetime.now(INDIA_TZ)
        return int(delta.total_seconds())

    def extend_session(self, hours=24):
        """Extend session expiry"""
        self.expires_at = datetime.now(INDIA_TZ) + timedelta(hours=hours)

    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, device={self.device_type})>"


class UserKYC(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Enhanced KYC document management"""
    __tablename__ = "user_kyc"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Primary Documents
    aadhaar_front_url = Column(String(500))
    aadhaar_back_url = Column(String(500))
    aadhaar_xml_file = Column(String(500))  # For e-KYC
    aadhaar_number_masked = Column(String(20))  # XXXX XXXX 1234

    pan_card_url = Column(String(500))
    pan_number = Column(String(10))

    photo_url = Column(String(500))
    signature_url = Column(String(500))
    selfie_url = Column(String(500))

    # Address Proof
    address_proof_type = Column(SQLEnum(KYCDocumentType, native_enum=False))
    address_proof_url = Column(String(500))
    address_proof_number = Column(String(100))

    # Additional Business Documents
    gst_certificate_url = Column(String(500))
    shop_act_url = Column(String(500))
    trade_license_url = Column(String(500))
    cancelled_cheque_url = Column(String(500))
    bank_statement_url = Column(String(500))
    rental_agreement_url = Column(String(500))
    electricity_bill_url = Column(String(500))

    # Document Details
    document_type = Column(SQLEnum(KYCDocumentType, native_enum=False), default=KYCDocumentType.AADHAAR)
    document_number = Column(String(100), index=True)
    document_front_url = Column(String(500))
    document_back_url = Column(String(500))
    document_expiry = Column(Date)
    document_issue_date = Column(Date)
    document_issuing_authority = Column(String(255))

    # Verification Details
    status = Column(SQLEnum(KYCStatus, native_enum=False), default=KYCStatus.PENDING, nullable=False, index=True)
    verification_level = Column(String(50), default="BASIC")  # BASIC, ENHANCED, FULL

    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    verified_at = Column(DateTime(timezone=True))
    verification_method = Column(String(50))  # MANUAL, AUTOMATED, HYBRID
    verification_notes = Column(Text)

    rejection_reason = Column(Text)
    rejection_category = Column(String(100))  # DOCUMENT_UNCLEAR, MISMATCH, EXPIRED, etc.
    resubmission_count = Column(Integer, default=0)
    resubmitted_at = Column(DateTime(timezone=True))

    # eKYC Details
    is_ekyc = Column(Boolean, default=False)
    ekyc_verified_at = Column(DateTime(timezone=True))
    ekyc_reference_id = Column(String(100))
    ekyc_provider = Column(String(100))  # UIDAI, DIGILOCKER, etc.
    ekyc_response = Column(JSON)

    # Biometric Verification
    is_biometric_verified = Column(Boolean, default=False)
    biometric_verified_at = Column(DateTime(timezone=True))
    fingerprint_data = Column(Text)  # Encrypted
    iris_scan_data = Column(Text)  # Encrypted

    # Video KYC
    is_video_kyc = Column(Boolean, default=False)
    video_kyc_url = Column(String(500))
    video_kyc_verified_at = Column(DateTime(timezone=True))
    video_kyc_call_duration = Column(Integer)  # in seconds
    video_kyc_agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    # Audit Trail
    submission_ip = Column(String(50))
    submission_device = Column(String(255))
    submission_location = Column(String(255))

    # Expiry & Renewal
    kyc_expiry = Column(Date)
    kyc_expiry_notified = Column(Boolean, default=False)
    renewal_required = Column(Boolean, default=False)
    last_renewed_at = Column(DateTime(timezone=True))

    # Quality Checks
    document_quality_score = Column(Numeric(5, 2))  # 0-100
    face_match_score = Column(Numeric(5, 2))  # 0-100
    liveness_check_passed = Column(Boolean, default=False)

    # Metadata
    additional_info = Column(JSON, default=dict)
    documents_metadata = Column(JSON, default=dict)
    verification_checks = Column(JSON, default=dict)

    # Audit fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="kyc_document")
    verifier = relationship("User", foreign_keys=[verified_by], post_update=True)
    video_kyc_agent = relationship("User", foreign_keys=[video_kyc_agent_id], post_update=True)
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)

    __table_args__ = (
        Index("ix_kyc_status_level", "status", "verification_level"),
        Index("ix_kyc_expiry", "kyc_expiry"),
        CheckConstraint("resubmission_count >= 0", name="ck_kyc_resubmission_count"),
    )

    @hybrid_property
    def is_expired(self):
        """Check if KYC is expired"""
        if not self.kyc_expiry:
            return False
        return self.kyc_expiry < date.today()

    @hybrid_property
    def days_until_expiry(self):
        """Days remaining until KYC expires"""
        if not self.kyc_expiry:
            return None
        delta = self.kyc_expiry - date.today()
        return delta.days

    def __repr__(self):
        return f"<UserKYC(user_id={self.user_id}, status={self.status}, level={self.verification_level})>"


# =====================================================
# SERVICES & PRODUCTS (Part 3)
# =====================================================

class Service(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Service catalog"""
    __tablename__ = "services"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Service Details
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255))
    description = Column(Text)
    short_description = Column(String(500))
    help_text = Column(Text)

    # Classification
    category = Column(SQLEnum(ServiceCategory, native_enum=False), nullable=False, index=True)
    type = Column(SQLEnum(ServiceType, native_enum=False), nullable=False)
    sub_category = Column(String(100))
    industry = Column(String(100))

    # Configuration
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_new = Column(Boolean, default=False)
    requires_approval = Column(Boolean, default=False, nullable=False)
    requires_kyc = Column(Boolean, default=True, nullable=False)
    requires_mpin = Column(Boolean, default=True, nullable=False)
    has_slab_pricing = Column(Boolean, default=False, nullable=False)
    has_commission = Column(Boolean, default=True, nullable=False)
    allows_partial_payment = Column(Boolean, default=False)

    # Limits
    min_amount = Column(Numeric(10, 2), default=Decimal('0.00'))
    max_amount = Column(Numeric(15, 2), default=Decimal('100000.00'))
    min_per_transaction = Column(Numeric(10, 2), default=Decimal('10.00'))
    max_per_transaction = Column(Numeric(15, 2), default=Decimal('50000.00'))
    daily_transaction_limit = Column(Numeric(15, 2))
    monthly_transaction_limit = Column(Numeric(15, 2))

    # Display & Branding
    icon_url = Column(String(500))
    banner_url = Column(String(500))
    thumbnail_url = Column(String(500))
    color_code = Column(String(20))
    badge_text = Column(String(50))  # "NEW", "POPULAR", "HOT"
    priority = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)

    # Technical Configuration
    provider = Column(String(100))  # API provider name
    provider_service_code = Column(String(100))
    api_endpoint = Column(String(500))
    api_method = Column(String(10), default="POST")
    api_version = Column(String(20))
    timeout_seconds = Column(Integer, default=30)
    retry_count = Column(SmallInteger, default=3)
    retry_interval_seconds = Column(Integer, default=5)

    # Response Time SLA
    expected_response_time = Column(Integer, default=5)  # seconds
    max_response_time = Column(Integer, default=30)

    # Availability
    service_uptime_percentage = Column(Numeric(5, 2), default=Decimal('99.9'))
    maintenance_mode = Column(Boolean, default=False)
    maintenance_message = Column(Text)
    scheduled_downtime = Column(JSON, default=list)

    # Business Rules
    business_rules = Column(JSON, default=dict)
    validation_rules = Column(JSON, default=dict)
    input_parameters = Column(JSON, default=list)
    output_parameters = Column(JSON, default=list)

    # Statistics
    total_transactions = Column(BigInteger, default=0)
    successful_transactions = Column(BigInteger, default=0)
    failed_transactions = Column(BigInteger, default=0)
    total_volume = Column(Numeric(20, 2), default=Decimal('0.00'))
    average_transaction_value = Column(Numeric(15, 2), default=Decimal('0.00'))
    success_rate = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Rating
    rating = Column(Numeric(3, 2), default=Decimal('0.00'))
    total_ratings = Column(Integer, default=0)

    # Terms & Conditions
    terms_url = Column(String(500))
    terms_text = Column(Text)
    requires_terms_acceptance = Column(Boolean, default=False)

    # Metadata
    config = Column(JSON, default=dict)
    features = Column(JSON, default=list)
    supported_modes = Column(JSON, default=list)
    supported_regions = Column(JSON, default=list)
    faqs = Column(JSON, default=list)

    # SEO
    seo_title = Column(String(255))
    seo_description = Column(Text)
    seo_keywords = Column(JSON, default=list)

    # Relationships
    billers = relationship("Biller", back_populates="service", cascade="all, delete-orphan")
    commissions = relationship("CommissionStructure", back_populates="service", cascade="all, delete-orphan")
    charges = relationship("ServiceCharge", back_populates="service", cascade="all, delete-orphan")
    white_label_services = relationship("WhiteLabelService", back_populates="service")

    __table_args__ = (
        Index("ix_service_category_active", "category", "is_active"),
        Index("ix_service_type_active", "type", "is_active"),
        Index("ix_service_featured", "is_featured", "priority"),
        CheckConstraint("min_amount >= 0", name="ck_service_min_amount"),
        CheckConstraint("max_amount >= min_amount", name="ck_service_amount_range"),
        CheckConstraint("success_rate >= 0 AND success_rate <= 100", name="ck_service_success_rate"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_service_rating"),
    )

    @hybrid_property
    def is_available(self):
        """Check if service is available"""
        return self.is_active and not self.maintenance_mode

    def __repr__(self):
        return f"<Service(id={self.id}, code={self.code}, name={self.name})>"


class WhiteLabelService(Base, TimestampMixin, VersionMixin):
    """Service configuration per white label"""
    __tablename__ = "white_label_services"

    id = Column(Integer, primary_key=True)
    white_label_id = Column(Integer, ForeignKey("white_labels.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)

    # Service Configuration
    is_active = Column(Boolean, default=True, nullable=False)
    is_visible = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False)
    priority = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)

    # Custom Limits
    min_amount = Column(Numeric(10, 2))
    max_amount = Column(Numeric(15, 2))
    daily_transaction_limit = Column(Numeric(15, 2))
    monthly_transaction_limit = Column(Numeric(15, 2))

    # Custom Branding
    custom_name = Column(String(255))
    custom_display_name = Column(String(255))
    custom_icon_url = Column(String(500))
    custom_banner_url = Column(String(500))
    custom_description = Column(Text)
    custom_color_code = Column(String(20))

    # Custom Configuration
    custom_requires_kyc = Column(Boolean)
    custom_requires_approval = Column(Boolean)

    # Markup Configuration
    markup_type = Column(SQLEnum(ChargeType, native_enum=False))
    markup_value = Column(Numeric(10, 6))

    # Commission Override
    commission_override = Column(Boolean, default=False)
    custom_commission_config = Column(JSON, default=dict)

    # Configuration
    config = Column(JSON, default=dict)
    custom_fields = Column(JSON, default=dict)
    custom_validation_rules = Column(JSON, default=dict)

    # Statistics
    total_transactions = Column(BigInteger, default=0)
    total_volume = Column(Numeric(20, 2), default=Decimal('0.00'))

    # Relationships
    white_label = relationship("WhiteLabel", back_populates="services")
    service = relationship("Service", back_populates="white_label_services")

    __table_args__ = (
        UniqueConstraint("white_label_id", "service_id", name="uq_wl_service"),
        Index("ix_wl_service_active", "white_label_id", "service_id", "is_active"),
    )

    def __repr__(self):
        return f"<WhiteLabelService(wl_id={self.white_label_id}, service_id={self.service_id})>"


class Biller(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Service providers/billers"""
    __tablename__ = "billers"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)

    # Biller Details
    code = Column(String(50), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255))
    description = Column(Text)
    help_text = Column(Text)

    # Configuration
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    is_recommended = Column(Boolean, default=False)
    validation_required = Column(Boolean, default=True, nullable=False)
    supports_partial_payment = Column(Boolean, default=False, nullable=False)
    instant_validation = Column(Boolean, default=True, nullable=False)
    fetch_bill_supported = Column(Boolean, default=True)

    # Fields Configuration (Dynamic Forms)
    validation_fields = Column(JSON, default=list)  # [{"name": "account_number", "type": "text", ...}]
    payment_fields = Column(JSON, default=list)
    optional_fields = Column(JSON, default=list)
    display_fields = Column(JSON, default=list)

    # Validation Rules
    validation_regex = Column(JSON, default=dict)  # {"account_number": "^[0-9]{10}$"}
    validation_messages = Column(JSON, default=dict)

    # Limits
    min_amount = Column(Numeric(10, 2))
    max_amount = Column(Numeric(15, 2))
    fixed_amount = Column(Numeric(10, 2))  # For fixed amount services
    allowed_amounts = Column(JSON, default=list)  # [100, 200, 500] for preset amounts

    # Display
    category = Column(String(100))
    sub_category = Column(String(100))
    logo_url = Column(String(500))
    icon_url = Column(String(500))
    priority = Column(Integer, default=1)
    sort_order = Column(Integer, default=0)

    # Provider Details
    provider_name = Column(String(100))
    provider_biller_id = Column(String(100))
    provider_biller_code = Column(String(100))
    provider_config = Column(JSON, default=dict)
    provider_api_version = Column(String(20))

    # Business Rules
    business_hours = Column(JSON, default=dict)  # {"start": "09:00", "end": "21:00"}
    allowed_days = Column(JSON, default=list)  # Days of week when service available
    blackout_dates = Column(JSON, default=list)  # Dates when not available

    # Response Configuration
    expected_response_fields = Column(JSON, default=list)
    response_mapping = Column(JSON, default=dict)

    # Statistics
    total_transactions = Column(BigInteger, default=0)
    successful_transactions = Column(BigInteger, default=0)
    failed_transactions = Column(BigInteger, default=0)
    average_response_time = Column(Numeric(10, 2))  # in seconds
    success_rate = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Rating
    rating = Column(Numeric(3, 2), default=Decimal('0.00'))
    total_ratings = Column(Integer, default=0)

    # Additional Info
    contact_number = Column(String(20))
    customer_care_number = Column(String(20))
    website = Column(String(255))
    terms_url = Column(String(500))

    # Metadata
    config = Column(JSON, default=dict)
    features = Column(JSON, default=list)

    # Relationships
    service = relationship("Service", back_populates="billers")

    __table_args__ = (
        UniqueConstraint("service_id", "code", name="uq_biller_service_code"),
        Index("ix_biller_service_active", "service_id", "is_active"),
        Index("ix_biller_featured", "is_featured", "priority"),
        CheckConstraint("success_rate >= 0 AND success_rate <= 100", name="ck_biller_success_rate"),
        CheckConstraint("rating >= 0 AND rating <= 5", name="ck_biller_rating"),
    )

    def __repr__(self):
        return f"<Biller(id={self.id}, code={self.code}, name={self.name})>"


# =====================================================
# COMMISSION & PRICING STRUCTURE (Enhanced)
# =====================================================

class CommissionStructure(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Commission configuration for entities and services"""
    __tablename__ = "commission_structures"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Entity Relationship
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)  # NULL for default

    # Service Relationship
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    biller_id = Column(Integer, ForeignKey("billers.id", ondelete="SET NULL"), nullable=True)

    # Commission Configuration
    commission_type = Column(SQLEnum(CommissionType, native_enum=False), nullable=False)
    commission_value = Column(Numeric(10, 6), nullable=False)
    commission_name = Column(String(100))

    # Slab-based Commission Configuration
    slab_config = Column(JSON, default=list)
    # Format: [{"min": 0, "max": 1000, "value": 10, "type": "flat"}, ...]

    # Limits
    min_commission = Column(Numeric(10, 2), default=Decimal('0.00'))
    max_commission = Column(Numeric(10, 2))
    min_amount = Column(Numeric(10, 2))
    max_amount = Column(Numeric(15, 2))

    # Distribution Configuration (Hierarchical)
    distribution_config = Column(JSON, default=dict)
    # {"distributor": 40, "partner": 30, "retailer": 30}  # percentages
    cascade_commission = Column(Boolean, default=True)

    # GST Configuration
    gst_applicable = Column(Boolean, default=True)
    gst_percentage = Column(Numeric(5, 2), default=Decimal('18.00'))
    gst_type = Column(SQLEnum(GSTType, native_enum=False), default=GSTType.EXCLUSIVE)

    # TDS Configuration
    tds_applicable = Column(Boolean, default=False)
    tds_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))
    tds_threshold = Column(Numeric(10, 2))  # Apply TDS only above this amount

    # Validity
    effective_from = Column(DateTime(timezone=True), default=get_india_time)
    effective_to = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Priority (for multiple matching rules)
    priority = Column(Integer, default=1)

    # Conditions
    min_kyc_level = Column(String(50))  # BASIC, ENHANCED, FULL
    allowed_transaction_types = Column(JSON, default=list)
    excluded_transaction_types = Column(JSON, default=list)

    # Time-based Rules
    time_based_rules = Column(JSON, default=dict)
    # {"weekday": {"value": 10}, "weekend": {"value": 15}}

    # Metadata
    description = Column(Text)
    notes = Column(Text)
    config = Column(JSON, default=dict)

    # Relationships
    service = relationship("Service", back_populates="commissions")
    biller = relationship("Biller")

    __table_args__ = (
        Index("ix_commission_entity_service", "entity_type", "entity_id", "service_id"),
        Index("ix_commission_active_dates", "is_active", "effective_from", "effective_to"),
        CheckConstraint("commission_value >= 0", name="ck_commission_value_positive"),
        CheckConstraint("gst_percentage >= 0 AND gst_percentage <= 100", name="ck_gst_percentage"),
        CheckConstraint("tds_percentage >= 0 AND tds_percentage <= 100", name="ck_tds_percentage"),
        CheckConstraint(
            "effective_to IS NULL OR effective_to > effective_from",
            name="ck_commission_valid_dates"
        ),
    )

    @hybrid_method
    def calculate_commission(self, amount: Decimal) -> Decimal:
        """Calculate commission for given amount"""
        if self.commission_type == CommissionType.FLAT:
            commission = self.commission_value
        elif self.commission_type == CommissionType.PERCENTAGE:
            commission = (amount * self.commission_value) / Decimal('100')
        elif self.commission_type == CommissionType.SLAB:
            commission = self._calculate_slab_commission(amount)
        else:
            commission = Decimal('0.00')

        # Apply min/max limits
        if self.min_commission:
            commission = max(commission, self.min_commission)
        if self.max_commission:
            commission = min(commission, self.max_commission)

        return commission.quantize(Decimal('0.01'))

    def _calculate_slab_commission(self, amount: Decimal) -> Decimal:
        """Calculate slab-based commission"""
        for slab in self.slab_config:
            if slab['min'] <= amount <= slab['max']:
                if slab['type'] == 'flat':
                    return Decimal(str(slab['value']))
                else:  # percentage
                    return (amount * Decimal(str(slab['value']))) / Decimal('100')
        return Decimal('0.00')

    def __repr__(self):
        return f"<CommissionStructure(id={self.id}, entity={self.entity_type}, service_id={self.service_id})>"


class ServiceCharge(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Service charges configuration"""
    __tablename__ = "service_charges"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    biller_id = Column(Integer, ForeignKey("billers.id", ondelete="SET NULL"), nullable=True)

    # Charge Configuration
    charge_type = Column(SQLEnum(ChargeType, native_enum=False), nullable=False)
    charge_value = Column(Numeric(10, 6), nullable=False)
    charge_name = Column(String(100))
    charge_description = Column(Text)

    # GST Configuration
    gst_type = Column(SQLEnum(GSTType, native_enum=False), default=GSTType.EXCLUSIVE)
    gst_percent = Column(Numeric(5, 2), default=Decimal('18.00'))
    gst_hsn_code = Column(String(20))

    # Slab-based Charges
    slab_config = Column(JSON, default=list)
    # Format: [{"min": 0, "max": 1000, "value": 10}, ...]

    # Limits
    min_charge = Column(Numeric(10, 2))
    max_charge = Column(Numeric(10, 2))
    min_amount = Column(Numeric(10, 2))
    max_amount = Column(Numeric(15, 2))

    # Applicability
    applies_to_entity_types = Column(JSON, default=list)  # ["retailer", "partner"]
    exempt_entity_types = Column(JSON, default=list)

    # Conditions
    apply_on_success_only = Column(Boolean, default=True)
    refundable = Column(Boolean, default=False)

    # Validity
    effective_from = Column(DateTime(timezone=True), default=get_india_time)
    effective_to = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Priority
    priority = Column(Integer, default=1)

    # Metadata
    description = Column(Text)
    config = Column(JSON, default=dict)

    # Relationships
    service = relationship("Service", back_populates="charges")
    biller = relationship("Biller")

    __table_args__ = (
        Index("ix_service_charge_active", "service_id", "is_active"),
        CheckConstraint("charge_value >= 0", name="ck_charge_value_positive"),
        CheckConstraint("gst_percent >= 0 AND gst_percent <= 100", name="ck_charge_gst_percent"),
    )

    @hybrid_method
    def calculate_charge(self, amount: Decimal) -> Dict[str, Decimal]:
        """Calculate charge and GST for given amount"""
        if self.charge_type == ChargeType.FLAT:
            charge = self.charge_value
        elif self.charge_type == ChargeType.PERCENTAGE:
            charge = (amount * self.charge_value) / Decimal('100')
        elif self.charge_type == ChargeType.SLAB:
            charge = self._calculate_slab_charge(amount)
        else:
            charge = Decimal('0.00')

        # Apply min/max limits
        if self.min_charge:
            charge = max(charge, self.min_charge)
        if self.max_charge:
            charge = min(charge, self.max_charge)

        # Calculate GST
        if self.gst_type == GSTType.INCLUSIVE:
            gst = (charge * self.gst_percent) / (Decimal('100') + self.gst_percent)
            base_charge = charge - gst
        elif self.gst_type == GSTType.EXCLUSIVE:
            gst = (charge * self.gst_percent) / Decimal('100')
            base_charge = charge
        else:
            gst = Decimal('0.00')
            base_charge = charge

        total = base_charge + gst

        return {
            'base_charge': base_charge.quantize(Decimal('0.01')),
            'gst': gst.quantize(Decimal('0.01')),
            'total': total.quantize(Decimal('0.01'))
        }

    def _calculate_slab_charge(self, amount: Decimal) -> Decimal:
        """Calculate slab-based charge"""
        for slab in self.slab_config:
            if slab['min'] <= amount <= slab['max']:
                return Decimal(str(slab['value']))
        return Decimal('0.00')

    def __repr__(self):
        return f"<ServiceCharge(id={self.id}, service_id={self.service_id}, type={self.charge_type})>"


# =====================================================
# WALLET SYSTEM (Enhanced)
# =====================================================

class Wallet(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Multi-purpose wallet system"""
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Wallet Configuration
    purpose = Column(SQLEnum(WalletPurpose, native_enum=False), nullable=False, index=True)
    name = Column(String(100))
    wallet_number = Column(String(50), unique=True, nullable=False, index=True)

    # Balances
    balance = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    locked_balance = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    reserved_balance = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)

    # Limits
    max_balance_limit = Column(Numeric(15, 2), default=Decimal('500000.00'))
    min_balance_threshold = Column(Numeric(15, 2), default=Decimal('100.00'))
    daily_load_limit = Column(Numeric(15, 2), default=Decimal('100000.00'))
    daily_spend_limit = Column(Numeric(15, 2), default=Decimal('100000.00'))
    per_transaction_limit = Column(Numeric(15, 2), default=Decimal('50000.00'))

    # Daily Tracking (reset daily)
    today_loaded = Column(Numeric(15, 2), default=Decimal('0.00'))
    today_spent = Column(Numeric(15, 2), default=Decimal('0.00'))
    limits_reset_date = Column(Date)

    # Lifetime Tracking
    total_credited = Column(Numeric(20, 2), default=Decimal('0.00'), nullable=False)
    total_debited = Column(Numeric(20, 2), default=Decimal('0.00'), nullable=False)
    transaction_count = Column(BigInteger, default=0, nullable=False)
    last_transaction_at = Column(DateTime(timezone=True))

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_locked = Column(Boolean, default=False, nullable=False, index=True)
    locked_reason = Column(String(500))
    locked_at = Column(DateTime(timezone=True))
    locked_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    # Alerts
    low_balance_alert = Column(Boolean, default=True)
    low_balance_threshold = Column(Numeric(10, 2), default=Decimal('100.00'))
    alert_sent_at = Column(DateTime(timezone=True))

    # Security
    pin_required = Column(Boolean, default=False)
    pin_hash = Column(String(256))

    # Auto Load Configuration
    auto_load_enabled = Column(Boolean, default=False)
    auto_load_threshold = Column(Numeric(10, 2))
    auto_load_amount = Column(Numeric(10, 2))
    auto_load_source = Column(String(100))  # BANK, UPI, CARD

    # Currency
    currency = Column(String(3), default="INR")

    # Metadata
    config = Column(JSON, default=dict)

    # Relationships
    user = relationship("User", back_populates="wallets", foreign_keys=[user_id])
    locker = relationship("User", foreign_keys=[locked_by], post_update=True)
    transactions = relationship("WalletTransaction", back_populates="wallet", cascade="all, delete-orphan")
    balance_logs = relationship("WalletBalanceLog", back_populates="wallet", cascade="all, delete-orphan")

    @hybrid_property
    def available_balance(self):
        """Computed available balance"""
        return self.balance - self.locked_balance - self.reserved_balance

    @hybrid_property
    def is_balance_low(self):
        """Check if balance is below threshold"""
        return self.balance < self.low_balance_threshold

    @hybrid_method
    def can_debit(self, amount: Decimal) -> bool:
        """Check if amount can be debited"""
        return self.available_balance >= amount

    def reset_daily_limits(self):
        """Reset daily limits"""
        self.today_loaded = Decimal('0.00')
        self.today_spent = Decimal('0.00')
        self.limits_reset_date = date.today()

    __table_args__ = (
        UniqueConstraint("user_id", "purpose", name="uq_wallet_user_purpose"),
        Index("ix_wallet_user_purpose", "user_id", "purpose"),
        Index("ix_wallet_number", "wallet_number"),
        Index("ix_wallet_balance", "balance"),
        CheckConstraint("balance >= 0", name="ck_wallet_balance_non_negative"),
        CheckConstraint("locked_balance >= 0", name="ck_wallet_locked_non_negative"),
        CheckConstraint("reserved_balance >= 0", name="ck_wallet_reserved_non_negative"),
        CheckConstraint("locked_balance + reserved_balance <= balance", name="ck_wallet_locked_le_balance"),
    )

    def __repr__(self):
        return f"<Wallet(id={self.id}, user_id={self.user_id}, purpose={self.purpose}, balance={self.balance})>"


class WalletBalanceLog(Base, TimestampMixin):
    """Daily wallet balance snapshots"""
    __tablename__ = "wallet_balance_logs"

    id = Column(BigInteger, primary_key=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False, index=True)

    # Balances
    opening_balance = Column(Numeric(15, 2), nullable=False)
    closing_balance = Column(Numeric(15, 2), nullable=False)
    day_total_credit = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    day_total_debit = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    day_transaction_count = Column(Integer, default=0, nullable=False)

    # Min/Max during the day
    day_min_balance = Column(Numeric(15, 2))
    day_max_balance = Column(Numeric(15, 2))

    # Date
    log_date = Column(Date, nullable=False, index=True)

    # Snapshot time
    snapshot_time = Column(DateTime(timezone=True), default=get_india_time)

    # Relationships
    wallet = relationship("Wallet", back_populates="balance_logs")

    __table_args__ = (
        UniqueConstraint("wallet_id", "log_date", name="uq_wallet_balance_log_date"),
        Index("ix_wallet_balance_date", "wallet_id", "log_date"),
    )

    def __repr__(self):
        return f"<WalletBalanceLog(wallet_id={self.wallet_id}, date={self.log_date}, balance={self.closing_balance})>"


class WalletTransaction(Base, TimestampMixin, MetadataMixin):
    """Wallet-specific transaction log"""
    __tablename__ = "wallet_transactions"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True, index=True)

    # Transaction Details
    transaction_type = Column(SQLEnum(TransactionType, native_enum=False), nullable=False, index=True)
    amount = Column(Numeric(15, 2), nullable=False)

    # Balance Tracking
    balance_before = Column(Numeric(15, 2), nullable=False)
    balance_after = Column(Numeric(15, 2), nullable=False)

    # Reference
    reference_id = Column(String(100), index=True)
    reference_type = Column(String(50))  # TRANSACTION, SETTLEMENT, REFUND, etc.
    description = Column(String(500))
    notes = Column(Text)

    # Status
    status = Column(String(50), default="SUCCESS")
    is_reversed = Column(Boolean, default=False)
    reversal_transaction_id = Column(BigInteger, ForeignKey("wallet_transactions.id", ondelete="SET NULL"))

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")
    transaction = relationship("Transaction")
    reversal_transaction = relationship("WalletTransaction", remote_side=[id])

    __table_args__ = (
        Index("ix_wallet_txn_date", "wallet_id", "created_at"),
        Index("ix_wallet_txn_type", "transaction_type", "created_at"),
        Index("ix_wallet_txn_reference", "reference_type", "reference_id"),
        CheckConstraint("amount > 0", name="ck_wallet_txn_amount_positive"),
    )

    def __repr__(self):
        return f"<WalletTransaction(id={self.id}, wallet_id={self.wallet_id}, type={self.transaction_type}, amount={self.amount})>"


# =====================================================
# TRANSACTION SYSTEM (Part 4 - Enhanced)
# =====================================================

class Transaction(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Main transaction table - Core of the payment system"""
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Entity Relationships
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    wallet_id = Column(Integer, ForeignKey("wallets.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True)
    biller_id = Column(Integer, ForeignKey("billers.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="SET NULL"), nullable=True, index=True)

    # Transaction Details
    transaction_type = Column(SQLEnum(TransactionType, native_enum=False), nullable=False, index=True)
    status = Column(SQLEnum(TransactionStatus, native_enum=False), nullable=False, index=True)
    mode = Column(SQLEnum(TransactionMode, native_enum=False), nullable=True)

    # Transaction ID (displayed to user)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)

    # External References
    external_transaction_id = Column(String(100), index=True)
    reference_id = Column(String(100), index=True)
    utr_number = Column(String(100), index=True)
    rrn = Column(String(100), index=True)  # Retrieval Reference Number
    order_id = Column(String(100), index=True)
    invoice_number = Column(String(100))

    # Amount Details
    amount = Column(Numeric(15, 2), nullable=False)
    charge_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    commission_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    gst_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    tds_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False)
    cashback_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    convenience_fee = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)

    # Wallet Balance Tracking
    balance_before = Column(Numeric(15, 2))
    balance_after = Column(Numeric(15, 2))

    # Customer/Beneficiary Details
    customer_name = Column(String(255), index=True)
    customer_number = Column(String(20), index=True)
    customer_account = Column(String(50))
    customer_email = Column(String(255))
    beneficiary_name = Column(String(255))
    beneficiary_mobile = Column(String(20))

    # Bill Details (for BBPS)
    bill_number = Column(String(100), index=True)
    bill_date = Column(Date)
    due_date = Column(Date, index=True)
    bill_amount = Column(Numeric(15, 2))
    bill_period = Column(String(50))
    bill_fetch_id = Column(String(100))
    late_fee = Column(Numeric(10, 2), default=Decimal('0.00'))

    # Bank Details (for DMT, AEPS)
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11), index=True)
    account_type = Column(String(20))  # SAVINGS, CURRENT
    branch_name = Column(String(255))

    # AEPS Specific
    aadhaar_number = Column(String(12))  # Masked
    bank_iin = Column(String(6))  # Bank Identification Number
    terminal_id = Column(String(50))
    merchant_transaction_id = Column(String(100))

    # UPI Specific
    upi_id = Column(String(100))
    payer_vpa = Column(String(100))
    payee_vpa = Column(String(100))

    # Card Payment Specific
    card_type = Column(String(20))  # CREDIT, DEBIT
    card_number_masked = Column(String(20))  # XXXX XXXX XXXX 1234
    card_network = Column(String(50))  # VISA, MASTERCARD, RUPAY

    # Commission Distribution
    distributor_commission = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    partner_commission = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    retailer_commission = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    platform_commission = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)

    # Reversal Info
    is_reversed = Column(Boolean, default=False, nullable=False, index=True)
    reversal_transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    reversal_reason = Column(Text)
    reversal_initiated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    reversed_at = Column(DateTime(timezone=True))

    # Refund Info
    is_refunded = Column(Boolean, default=False, nullable=False)
    refund_amount = Column(Numeric(15, 2), default=Decimal('0.00'))
    refund_transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="SET NULL"))
    refund_reason = Column(Text)
    refunded_at = Column(DateTime(timezone=True))

    # Provider Details
    provider_name = Column(String(100))
    provider_transaction_id = Column(String(100), index=True)
    provider_response_code = Column(String(50), index=True)
    provider_response_message = Column(Text)
    provider_status = Column(String(50))

    # API Details
    api_version = Column(String(20))
    api_endpoint = Column(String(500))
    api_method = Column(String(10))
    api_request_id = Column(String(100))

    # Response Time Tracking
    request_sent_at = Column(DateTime(timezone=True))
    response_received_at = Column(DateTime(timezone=True))
    response_time_ms = Column(Integer)  # Response time in milliseconds

    # Metadata
    remarks = Column(Text)
    notes = Column(Text)
    internal_notes = Column(Text)  # For admin use only
    request_data = Column(JSON, default=dict)
    response_data = Column(JSON, default=dict)
    additional_data = Column(JSON, default=dict)

    # Network Details
    ip_address = Column(String(50), index=True)
    device_info = Column(JSON, default=dict)
    location = Column(String(255))
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    user_agent = Column(Text)

    # Timestamps
    initiated_at = Column(DateTime(timezone=True), default=get_india_time, index=True)
    processed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True), index=True)
    failed_at = Column(DateTime(timezone=True))
    callback_received_at = Column(DateTime(timezone=True))

    # Retry Mechanism
    retry_count = Column(SmallInteger, default=0, nullable=False)
    max_retries = Column(SmallInteger, default=3, nullable=False)
    next_retry_at = Column(DateTime(timezone=True))
    retry_history = Column(JSON, default=list)

    # Notification Status
    user_notified = Column(Boolean, default=False)
    user_notification_sent_at = Column(DateTime(timezone=True))
    webhook_notified = Column(Boolean, default=False)
    webhook_notification_sent_at = Column(DateTime(timezone=True))

    # Dispute & Complaints
    is_disputed = Column(Boolean, default=False, nullable=False)
    dispute_raised_at = Column(DateTime(timezone=True))
    dispute_reason = Column(Text)
    dispute_status = Column(String(50))
    dispute_resolved_at = Column(DateTime(timezone=True))

    # Compliance
    aml_checked = Column(Boolean, default=False)
    aml_status = Column(String(50))
    aml_risk_score = Column(Numeric(5, 2))
    fraud_check = Column(Boolean, default=False)
    fraud_score = Column(Numeric(5, 2))

    # Settlement
    is_settled = Column(Boolean, default=False, nullable=False, index=True)
    settlement_id = Column(Integer, ForeignKey("settlements.id", ondelete="SET NULL"), nullable=True)
    settled_at = Column(DateTime(timezone=True))

    # Invoice
    invoice_generated = Column(Boolean, default=False)
    invoice_url = Column(String(500))
    invoice_sent = Column(Boolean, default=False)

    # Receipt
    receipt_generated = Column(Boolean, default=False)
    receipt_url = Column(String(500))
    receipt_number = Column(String(100))

    # Priority
    priority = Column(String(20), default="NORMAL")  # LOW, NORMAL, HIGH, URGENT

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="transactions")
    wallet = relationship("Wallet")
    service = relationship("Service")
    biller = relationship("Biller")
    customer = relationship("Customer", back_populates="transactions")
    merchant = relationship("Merchant", back_populates="transactions")
    reversal_transaction = relationship("Transaction", remote_side=[id], foreign_keys=[reversal_transaction_id])
    refund_transaction = relationship("Transaction", remote_side=[id], foreign_keys=[refund_transaction_id])
    reversal_initiator = relationship("User", foreign_keys=[reversal_initiated_by], post_update=True)
    commission_ledgers = relationship("CommissionLedger", back_populates="transaction", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_transaction_user_date", "user_id", "created_at"),
        Index("ix_transaction_status_date", "status", "created_at"),
        Index("ix_transaction_type_status", "transaction_type", "status"),
        Index("ix_transaction_customer", "customer_number", "created_at"),
        Index("ix_transaction_completed", "completed_at"),
        Index("ix_transaction_service_status", "service_id", "status", "created_at"),
        Index("ix_transaction_amount_date", "amount", "created_at"),
        Index("ix_transaction_provider", "provider_name", "provider_transaction_id"),
        CheckConstraint("amount >= 0", name="ck_transaction_amount_positive"),
        CheckConstraint("total_amount >= 0", name="ck_transaction_total_positive"),
        CheckConstraint("retry_count >= 0", name="ck_transaction_retry_count"),
    )

    @hybrid_property
    def net_amount(self):
        """Calculate net amount after charges"""
        return self.amount - self.charge_amount

    @hybrid_property
    def is_success(self):
        """Check if transaction is successful"""
        return self.status == TransactionStatus.SUCCESS

    @hybrid_property
    def is_pending(self):
        """Check if transaction is pending"""
        return self.status in (TransactionStatus.PENDING, TransactionStatus.INITIATED, TransactionStatus.PROCESSING)

    @hybrid_property
    def is_failed(self):
        """Check if transaction failed"""
        return self.status in (TransactionStatus.FAILED, TransactionStatus.CANCELLED, TransactionStatus.TIMEOUT)

    @hybrid_property
    def processing_time_seconds(self):
        """Calculate processing time in seconds"""
        if self.completed_at and self.initiated_at:
            delta = self.completed_at - self.initiated_at
            return int(delta.total_seconds())
        return None

    def can_retry(self):
        """Check if transaction can be retried"""
        return (self.retry_count < self.max_retries and
                self.status in (TransactionStatus.FAILED, TransactionStatus.TIMEOUT))

    def __repr__(self):
        return f"<Transaction(id={self.id}, txn_id={self.transaction_id}, status={self.status}, amount={self.amount})>"


class CommissionLedger(Base, TimestampMixin, MetadataMixin):
    """Commission distribution ledger - Tracks all commission payouts"""
    __tablename__ = "commission_ledgers"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False, index=True)
    beneficiary_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Beneficiary Details
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True)
    beneficiary_name = Column(String(255))
    beneficiary_code = Column(String(50))

    # Commission Structure Reference
    commission_structure_id = Column(Integer, ForeignKey("commission_structures.id", ondelete="SET NULL"))

    # Commission Details
    commission_type = Column(SQLEnum(CommissionType, native_enum=False), nullable=False)
    commission_rate = Column(Numeric(10, 6), nullable=False)
    commission_amount = Column(Numeric(15, 2), nullable=False)

    # GST Details
    gst_applicable = Column(Boolean, default=True)
    gst_percentage = Column(Numeric(5, 2), default=Decimal('18.00'))
    gst_amount = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)

    # TDS (Tax Deducted at Source)
    tds_applicable = Column(Boolean, default=False)
    tds_percent = Column(Numeric(5, 2), default=Decimal('0.00'), nullable=False)
    tds_amount = Column(Numeric(10, 2), default=Decimal('0.00'), nullable=False)

    # Net Commission
    gross_commission = Column(Numeric(15, 2), nullable=False)
    net_commission = Column(Numeric(15, 2), nullable=False)

    # Transaction Details Reference
    transaction_amount = Column(Numeric(15, 2), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="SET NULL"))
    service_name = Column(String(255))

    # Settlement Status
    is_settled = Column(Boolean, default=False, nullable=False, index=True)
    settled_at = Column(DateTime(timezone=True))
    settlement_id = Column(Integer, ForeignKey("settlements.id", ondelete="SET NULL"), nullable=True, index=True)
    settlement_reference = Column(String(100))

    # Credit Status
    is_credited = Column(Boolean, default=False, nullable=False, index=True)
    credited_at = Column(DateTime(timezone=True))
    credit_transaction_id = Column(BigInteger, ForeignKey("wallet_transactions.id", ondelete="SET NULL"))

    # Reversal Info
    is_reversed = Column(Boolean, default=False, nullable=False)
    reversed_at = Column(DateTime(timezone=True))
    reversal_reason = Column(Text)
    reversal_ledger_id = Column(BigInteger, ForeignKey("commission_ledgers.id", ondelete="SET NULL"))

    # Hold/Block Status
    is_on_hold = Column(Boolean, default=False, nullable=False)
    hold_reason = Column(String(500))
    hold_until = Column(DateTime(timezone=True))
    hold_released_at = Column(DateTime(timezone=True))

    # Period Tracking
    commission_period = Column(String(20))  # YYYY-MM format
    commission_date = Column(Date, nullable=False, index=True)

    # Approval Workflow
    requires_approval = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=False)
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    approved_at = Column(DateTime(timezone=True))
    rejection_reason = Column(Text)

    # Invoice Details
    invoice_number = Column(String(100))
    invoice_generated = Column(Boolean, default=False)
    invoice_url = Column(String(500))

    # Metadata
    remarks = Column(Text)
    calculation_details = Column(JSON, default=dict)

    # Relationships
    transaction = relationship("Transaction", back_populates="commission_ledgers")
    beneficiary = relationship("User", foreign_keys=[beneficiary_id])
    service = relationship("Service")
    settlement = relationship("Settlement", back_populates="commission_ledgers")
    approver = relationship("User", foreign_keys=[approved_by], post_update=True)
    credit_transaction = relationship("WalletTransaction")
    reversal_ledger = relationship("CommissionLedger", remote_side=[id])
    commission_structure = relationship("CommissionStructure")

    __table_args__ = (
        Index("ix_commission_beneficiary_settled", "beneficiary_id", "is_settled"),
        Index("ix_commission_transaction", "transaction_id"),
        Index("ix_commission_settlement", "settlement_id"),
        Index("ix_commission_date", "commission_date", "is_settled"),
        Index("ix_commission_period", "commission_period", "beneficiary_id"),
        Index("ix_commission_entity", "entity_type", "entity_id"),
        CheckConstraint("commission_amount >= 0", name="ck_commission_amount_positive"),
        CheckConstraint("net_commission >= 0", name="ck_net_commission_positive"),
    )

    @hybrid_property
    def is_payable(self):
        """Check if commission is ready to be paid"""
        return (not self.is_settled and
                not self.is_on_hold and
                not self.is_reversed and
                (not self.requires_approval or self.is_approved))

    def __repr__(self):
        return f"<CommissionLedger(id={self.id}, beneficiary_id={self.beneficiary_id}, amount={self.net_commission}, settled={self.is_settled})>"


# =====================================================
# SETTLEMENT SYSTEM (Enhanced)
# =====================================================

class Settlement(Base, TimestampMixin, VersionMixin, MetadataMixin):
    """Settlement/payout management - Handles fund transfers to users"""
    __tablename__ = "settlements"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Entity Relationship
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True)

    # Settlement Details
    settlement_id = Column(String(100), unique=True, nullable=False, index=True)
    settlement_type = Column(String(50), nullable=False, index=True)  # AUTO, MANUAL, REQUEST, INSTANT, SCHEDULED
    settlement_mode = Column(String(50), nullable=False)  # NEFT, RTGS, IMPS, UPI
    status = Column(SQLEnum(SettlementStatus, native_enum=False), nullable=False, index=True)

    # Amount Details
    gross_amount = Column(Numeric(15, 2), nullable=False)
    charge_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    gst_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    tds_amount = Column(Numeric(15, 2), default=Decimal('0.00'), nullable=False)
    adjustment_amount = Column(Numeric(15, 2), default=Decimal('0.00'))  # Can be +ve or -ve
    net_amount = Column(Numeric(15, 2), nullable=False)

    # Bank Transfer Details
    bank_name = Column(String(255))
    account_number = Column(String(50))
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    account_type = Column(String(20))
    branch_name = Column(String(255))

    # Transfer Details
    transfer_mode = Column(String(50))  # NEFT, RTGS, IMPS, UPI
    utr_number = Column(String(100), index=True)
    transaction_reference = Column(String(100))

    # UPI Details
    upi_id = Column(String(100))
    upi_transaction_id = Column(String(100))

    # Period
    from_date = Column(DateTime(timezone=True), nullable=False, index=True)
    to_date = Column(DateTime(timezone=True), nullable=False, index=True)
    settlement_period = Column(String(20))  # YYYY-MM or YYYY-Www format

    # Transaction Count
    transaction_count = Column(Integer, default=0, nullable=False)
    commission_count = Column(Integer, default=0, nullable=False)
    included_transaction_ids = Column(JSON, default=list)
    included_ledger_ids = Column(JSON, default=list)

    # Breakdown
    service_wise_breakdown = Column(JSON, default=dict)
    date_wise_breakdown = Column(JSON, default=dict)

    # Approval Workflow
    requested_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    approved_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    approved_at = Column(DateTime(timezone=True))
    approval_notes = Column(Text)
    rejection_reason = Column(Text)
    rejected_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    rejected_at = Column(DateTime(timezone=True))

    # Processing Details
    processed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    processing_notes = Column(Text)
    payment_gateway = Column(String(100))
    payment_gateway_response = Column(JSON)

    # Verification
    verification_required = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verified_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    verified_at = Column(DateTime(timezone=True))

    # Retry Mechanism
    retry_count = Column(SmallInteger, default=0)
    max_retries = Column(SmallInteger, default=3)
    retry_scheduled_at = Column(DateTime(timezone=True))

    # Failure Details
    failure_reason = Column(Text)
    failure_code = Column(String(50))
    provider_error_message = Column(Text)

    # Notifications
    user_notified = Column(Boolean, default=False)
    notification_sent_at = Column(DateTime(timezone=True))
    email_sent = Column(Boolean, default=False)
    sms_sent = Column(Boolean, default=False)

    # Documents
    invoice_number = Column(String(100))
    invoice_url = Column(String(500))
    certificate_url = Column(String(500))
    proof_of_payment_url = Column(String(500))

    # Metadata
    remarks = Column(Text)
    notes = Column(Text)
    internal_notes = Column(Text)

    # Audit Fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    requested_at = Column(DateTime(timezone=True), index=True)
    scheduled_at = Column(DateTime(timezone=True))
    processed_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True), index=True)
    failed_at = Column(DateTime(timezone=True))

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    requester = relationship("User", foreign_keys=[requested_by], post_update=True)
    approver = relationship("User", foreign_keys=[approved_by], post_update=True)
    rejecter = relationship("User", foreign_keys=[rejected_by], post_update=True)
    processor = relationship("User", foreign_keys=[processed_by], post_update=True)
    verifier = relationship("User", foreign_keys=[verified_by], post_update=True)
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    commission_ledgers = relationship("CommissionLedger", back_populates="settlement")

    __table_args__ = (
        Index("ix_settlement_user_status", "user_id", "status"),
        Index("ix_settlement_date_range", "from_date", "to_date"),
        Index("ix_settlement_completed", "completed_at"),
        Index("ix_settlement_type_status", "settlement_type", "status"),
        Index("ix_settlement_period", "settlement_period", "user_id"),
        CheckConstraint("net_amount >= 0", name="ck_settlement_net_positive"),
        CheckConstraint("gross_amount >= 0", name="ck_settlement_gross_positive"),
        CheckConstraint("transaction_count >= 0", name="ck_settlement_txn_count"),
        CheckConstraint("retry_count >= 0", name="ck_settlement_retry_count"),
    )

    @hybrid_property
    def is_pending_approval(self):
        """Check if settlement is pending approval"""
        return self.status == SettlementStatus.PENDING and not self.approved_at

    @hybrid_property
    def is_processing(self):
        """Check if settlement is being processed"""
        return self.status == SettlementStatus.PROCESSING

    @hybrid_property
    def total_deductions(self):
        """Calculate total deductions"""
        return self.charge_amount + self.gst_amount + self.tds_amount

    @hybrid_property
    def processing_time_hours(self):
        """Calculate processing time in hours"""
        if self.completed_at and self.requested_at:
            delta = self.completed_at - self.requested_at
            return round(delta.total_seconds() / 3600, 2)
        return None

    def can_retry(self):
        """Check if settlement can be retried"""
        return (self.retry_count < self.max_retries and
                self.status == SettlementStatus.FAILED)

    def __repr__(self):
        return f"<Settlement(id={self.id}, settlement_id={self.settlement_id}, status={self.status}, amount={self.net_amount})>"


class SettlementRule(Base, TimestampMixin, VersionMixin):
    """Settlement automation rules"""
    __tablename__ = "settlement_rules"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Entity Configuration
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)

    # Rule Configuration
    rule_name = Column(String(255), nullable=False)
    settlement_type = Column(String(50), nullable=False)  # DAILY, WEEKLY, MONTHLY, ON_DEMAND, THRESHOLD
    settlement_cycle = Column(String(50))  # T+0, T+1, T+2, etc.

    # Schedule
    settlement_day = Column(String(20))  # MON, TUE, 1, 15, etc.
    settlement_time = Column(String(10))  # HH:MM format
    settlement_timezone = Column(String(50), default="Asia/Kolkata")

    # Amount Thresholds
    min_amount_threshold = Column(Numeric(15, 2), default=Decimal('1000.00'))
    max_amount_threshold = Column(Numeric(15, 2))
    auto_settlement_enabled = Column(Boolean, default=False, nullable=False)
    auto_approval_enabled = Column(Boolean, default=False)

    # Auto-settlement conditions
    min_transaction_count = Column(Integer, default=1)
    min_days_since_last_settlement = Column(Integer, default=1)

    # Charges Configuration
    settlement_charge_type = Column(SQLEnum(ChargeType, native_enum=False), default=ChargeType.FLAT)
    settlement_charge_value = Column(Numeric(10, 2), default=Decimal('0.00'))
    min_settlement_charge = Column(Numeric(10, 2))
    max_settlement_charge = Column(Numeric(10, 2))

    # GST & TDS
    gst_applicable = Column(Boolean, default=True)
    gst_percentage = Column(Numeric(5, 2), default=Decimal('18.00'))
    tds_applicable = Column(Boolean, default=False)
    tds_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Bank Details Template
    default_bank_name = Column(String(255))
    default_account_number = Column(String(50))
    default_ifsc_code = Column(String(11))
    default_account_holder = Column(String(255))
    default_transfer_mode = Column(String(50))

    # Hold Configuration
    hold_percentage = Column(Numeric(5, 2), default=Decimal('0.00'))  # % of amount to hold
    hold_days = Column(Integer, default=0)  # Days to hold funds

    # Working Days Configuration
    skip_weekends = Column(Boolean, default=False)
    skip_holidays = Column(Boolean, default=False)
    holiday_calendar = Column(JSON, default=list)

    # Priority
    priority = Column(Integer, default=1)

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Metadata
    description = Column(Text)
    config = Column(JSON, default=dict)

    __table_args__ = (
        UniqueConstraint("entity_type", "entity_id", "rule_name", name="uq_settlement_rule_entity"),
        Index("ix_settlement_rule_active", "entity_type", "entity_id", "is_active"),
        CheckConstraint("min_amount_threshold >= 0", name="ck_settlement_rule_min_amount"),
        CheckConstraint("hold_percentage >= 0 AND hold_percentage <= 100", name="ck_settlement_rule_hold_pct"),
    )

    def __repr__(self):
        return f"<SettlementRule(id={self.id}, entity_type={self.entity_type}, type={self.settlement_type})>"


# =====================================================
# AUDIT TRAIL SYSTEM (Part 5 - Enhanced)
# =====================================================

class AuditLog(Base, TimestampMixin):
    """Comprehensive audit trail for all critical operations"""
    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Actor Details
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    entity_type = Column(SQLEnum(EntityType, native_enum=False), index=True)
    entity_id = Column(Integer, index=True)
    actor_name = Column(String(255))
    actor_email = Column(String(255))
    actor_phone = Column(String(20))

    # Action Details
    action = Column(SQLEnum(AuditAction, native_enum=False), nullable=False, index=True)
    action_category = Column(String(50), index=True)  # AUTH, TRANSACTION, KYC, WALLET, ADMIN
    action_description = Column(Text)
    resource_type = Column(String(100), nullable=False, index=True)  # transaction, user, wallet, etc.
    resource_id = Column(String(100), index=True)
    resource_name = Column(String(255))

    # Change Tracking
    old_values = Column(JSON, default=dict)
    new_values = Column(JSON, default=dict)
    changes = Column(JSON, default=dict)  # Computed diff
    changed_fields = Column(JSON, default=list)

    # Request Details
    ip_address = Column(String(50), index=True)
    user_agent = Column(Text)
    request_method = Column(String(10))
    request_path = Column(String(500))
    request_params = Column(JSON)
    request_body = Column(JSON)
    request_headers = Column(JSON)

    # Response Details
    status_code = Column(SmallInteger)
    response_message = Column(Text)
    response_time_ms = Column(Integer)

    # Session Info
    session_id = Column(String(255), index=True)
    session_token = Column(String(255))
    device_id = Column(String(255))
    device_type = Column(String(50))
    device_name = Column(String(255))

    # Location
    location = Column(String(255))
    country = Column(String(100))
    city = Column(String(100))
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))

    # Context
    context = Column(JSON, default=dict)
    environment = Column(String(50), default="production")  # development, staging, production

    # Severity & Classification
    severity = Column(String(20), default="INFO", index=True)  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    risk_level = Column(String(20))  # LOW, MEDIUM, HIGH, CRITICAL
    is_suspicious = Column(Boolean, default=False, index=True)
    is_security_event = Column(Boolean, default=False, index=True)

    # Compliance
    compliance_relevant = Column(Boolean, default=False)
    compliance_category = Column(String(100))  # AML, KYC, GDPR, etc.
    retention_period_days = Column(Integer, default=2555)  # 7 years default

    # Tags & Labels
    tags = Column(JSON, default=list)
    labels = Column(JSON, default=dict)

    # Error Tracking
    error_code = Column(String(50))
    error_message = Column(Text)
    error_stack_trace = Column(Text)

    # Metadata
    meta = Column(JSON, default=dict)
    additional_info = Column(JSON, default=dict)

    # Indexing & Search
    search_text = Column(Text)  # For full-text search

    # Relationships
    user = relationship("User")

    __table_args__ = (
        Index("ix_audit_user_date", "user_id", "created_at"),
        Index("ix_audit_action_date", "action", "created_at"),
        Index("ix_audit_resource", "resource_type", "resource_id"),
        Index("ix_audit_ip_date", "ip_address", "created_at"),
        Index("ix_audit_session", "session_id", "created_at"),
        Index("ix_audit_severity", "severity", "created_at"),
        Index("ix_audit_security", "is_security_event", "is_suspicious"),
    )

    def __repr__(self):
        return f"<AuditLog(id={self.id}, action={self.action}, user_id={self.user_id}, resource={self.resource_type})>"


# =====================================================
# NOTIFICATION SYSTEM (Enhanced)
# =====================================================

class Notification(Base, TimestampMixin, MetadataMixin):
    """User notifications"""
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Notification Details
    type = Column(SQLEnum(NotificationType, native_enum=False), nullable=False, index=True)
    priority = Column(SQLEnum(NotificationPriority, native_enum=False), default=NotificationPriority.MEDIUM, index=True)
    category = Column(String(100), index=True)  # TRANSACTION, WALLET, KYC, SYSTEM, PROMOTIONAL

    # Content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    short_message = Column(String(500))
    html_content = Column(Text)

    # Action
    action_url = Column(String(500))
    action_text = Column(String(100))
    action_data = Column(JSON, default=dict)
    deep_link = Column(String(500))  # For mobile apps

    # Personalization
    template_id = Column(Integer, ForeignKey("notification_templates.id", ondelete="SET NULL"))
    template_variables = Column(JSON, default=dict)

    # Status
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True))
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True))
    is_archived = Column(Boolean, default=False, nullable=False)
    archived_at = Column(DateTime(timezone=True))

    # Delivery Status by Channel
    email_enabled = Column(Boolean, default=True)
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime(timezone=True))
    email_opened = Column(Boolean, default=False)
    email_opened_at = Column(DateTime(timezone=True))
    email_clicked = Column(Boolean, default=False)
    email_error = Column(Text)

    sms_enabled = Column(Boolean, default=True)
    sms_sent = Column(Boolean, default=False)
    sms_sent_at = Column(DateTime(timezone=True))
    sms_delivered = Column(Boolean, default=False)
    sms_delivered_at = Column(DateTime(timezone=True))
    sms_error = Column(Text)

    push_enabled = Column(Boolean, default=True)
    push_sent = Column(Boolean, default=False)
    push_sent_at = Column(DateTime(timezone=True))
    push_opened = Column(Boolean, default=False)
    push_opened_at = Column(DateTime(timezone=True))
    push_error = Column(Text)

    in_app_enabled = Column(Boolean, default=True)

    whatsapp_enabled = Column(Boolean, default=False)
    whatsapp_sent = Column(Boolean, default=False)
    whatsapp_sent_at = Column(DateTime(timezone=True))
    whatsapp_delivered = Column(Boolean, default=False)
    whatsapp_error = Column(Text)

    # Related Entity
    related_entity_type = Column(String(100), index=True)
    related_entity_id = Column(String(100), index=True)

    # Transaction Reference
    transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="SET NULL"))

    # Media
    image_url = Column(String(500))
    icon_url = Column(String(500))
    thumbnail_url = Column(String(500))

    # Scheduling
    scheduled_at = Column(DateTime(timezone=True))
    is_scheduled = Column(Boolean, default=False)

    # Expiry
    expires_at = Column(DateTime(timezone=True), index=True)
    is_expired = Column(Boolean, default=False, nullable=False)

    # Retry Mechanism
    retry_count = Column(SmallInteger, default=0)
    max_retries = Column(SmallInteger, default=3)
    next_retry_at = Column(DateTime(timezone=True))

    # Analytics
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime(timezone=True))
    interaction_count = Column(Integer, default=0)

    # Grouping
    group_key = Column(String(100), index=True)
    is_grouped = Column(Boolean, default=False)

    # Relationships
    user = relationship("User")
    template = relationship("NotificationTemplate")
    transaction = relationship("Transaction")

    __table_args__ = (
        Index("ix_notification_user_read", "user_id", "is_read", "created_at"),
        Index("ix_notification_priority_sent", "priority", "is_sent"),
        Index("ix_notification_category", "category", "created_at"),
        Index("ix_notification_expires", "expires_at", "is_expired"),
        Index("ix_notification_scheduled", "is_scheduled", "scheduled_at"),
    )

    @hybrid_property
    def is_delivered(self):
        """Check if notification was delivered via any channel"""
        return any([
            self.email_sent,
            self.sms_sent,
            self.push_sent,
            self.whatsapp_sent
        ])

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, title={self.title}, read={self.is_read})>"


class NotificationTemplate(Base, TimestampMixin, VersionMixin):
    """Notification templates for different events"""
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Template Content
    email_subject = Column(String(255))
    email_body = Column(Text)
    email_html_body = Column(Text)

    sms_template = Column(String(500))

    push_title = Column(String(255))
    push_body = Column(String(500))

    in_app_title = Column(String(255))
    in_app_body = Column(Text)

    whatsapp_template = Column(Text)
    whatsapp_template_id = Column(String(100))  # Provider template ID

    # Configuration
    priority = Column(SQLEnum(NotificationPriority, native_enum=False), default=NotificationPriority.MEDIUM)
    enabled_channels = Column(JSON, default=list)  # ["email", "sms", "push"]
    category = Column(String(100), index=True)

    # Variables
    variables = Column(JSON, default=list)  # ["user_name", "amount", "transaction_id"]
    sample_data = Column(JSON, default=dict)  # Sample variable values for preview

    # Conditions
    send_conditions = Column(JSON, default=dict)
    user_segment = Column(String(100))  # ALL, PREMIUM, ACTIVE, etc.

    # Scheduling
    send_immediately = Column(Boolean, default=True)
    delay_minutes = Column(Integer, default=0)
    optimal_send_time = Column(Boolean, default=False)  # Send at user's optimal time

    # Rate Limiting
    rate_limit_enabled = Column(Boolean, default=False)
    max_per_user_per_day = Column(Integer)
    max_per_user_per_hour = Column(Integer)

    # A/B Testing
    ab_test_enabled = Column(Boolean, default=False)
    ab_test_variants = Column(JSON, default=list)

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_draft = Column(Boolean, default=False)

    # Statistics
    total_sent = Column(BigInteger, default=0)
    total_delivered = Column(BigInteger, default=0)
    total_opened = Column(BigInteger, default=0)
    total_clicked = Column(BigInteger, default=0)

    # Engagement Rates
    delivery_rate = Column(Numeric(5, 2), default=Decimal('0.00'))
    open_rate = Column(Numeric(5, 2), default=Decimal('0.00'))
    click_rate = Column(Numeric(5, 2), default=Decimal('0.00'))

    # Metadata
    tags = Column(JSON, default=list)
    meta = Column(JSON, default=dict)

    __table_args__ = (
        Index("ix_notification_template_code", "code"),
        Index("ix_notification_template_active", "is_active", "category"),
    )

    def __repr__(self):
        return f"<NotificationTemplate(id={self.id}, code={self.code}, name={self.name})>"


# =====================================================
# WEBHOOK SYSTEM (Enhanced)
# =====================================================

class Webhook(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Webhook configuration"""
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Webhook Details
    name = Column(String(255), nullable=False)
    description = Column(Text)
    url = Column(String(500), nullable=False)
    secret_key = Column(String(255), nullable=False)

    # Events to Subscribe
    events = Column(JSON, default=list, nullable=False)  # List of WebhookEvent values
    event_filters = Column(JSON, default=dict)  # Additional event filtering

    # Authentication
    auth_type = Column(String(50), default="bearer")  # bearer, basic, api_key, hmac
    auth_header = Column(String(100))
    auth_value = Column(String(500))
    custom_headers = Column(JSON, default=dict)

    # Configuration
    method = Column(String(10), default="POST")
    content_type = Column(String(100), default="application/json")
    timeout_seconds = Column(Integer, default=30)

    # Retry Configuration
    max_retries = Column(SmallInteger, default=3)
    retry_interval_seconds = Column(Integer, default=60)
    exponential_backoff = Column(Boolean, default=True)
    retry_status_codes = Column(JSON, default=list)  # [500, 502, 503, 504]

    # Rate Limiting
    rate_limit_enabled = Column(Boolean, default=False)
    max_requests_per_minute = Column(Integer, default=60)

    # IP Whitelisting
    ip_whitelist_enabled = Column(Boolean, default=False)
    whitelisted_ips = Column(JSON, default=list)

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime(timezone=True))
    verification_token = Column(String(255))

    # Health Check
    health_check_enabled = Column(Boolean, default=True)
    last_health_check_at = Column(DateTime(timezone=True))
    health_status = Column(String(50))  # HEALTHY, DEGRADED, DOWN

    # Statistics
    total_calls = Column(BigInteger, default=0)
    success_count = Column(BigInteger, default=0)
    failure_count = Column(BigInteger, default=0)
    average_response_time = Column(Numeric(10, 2))

    last_success_at = Column(DateTime(timezone=True))
    last_failure_at = Column(DateTime(timezone=True))
    consecutive_failures = Column(Integer, default=0)

    # Auto-disable on failure
    auto_disable_on_failure = Column(Boolean, default=True)
    max_consecutive_failures = Column(Integer, default=10)
    auto_disabled = Column(Boolean, default=False)
    auto_disabled_at = Column(DateTime(timezone=True))

    # Monitoring
    alert_on_failure = Column(Boolean, default=True)
    alert_email = Column(String(255))
    alert_phone = Column(String(20))

    # Payload Configuration
    include_metadata = Column(Boolean, default=True)
    include_user_info = Column(Boolean, default=False)
    custom_payload_template = Column(JSON)

    # Audit Fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="webhooks", foreign_keys=[user_id])
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    webhook_logs = relationship("WebhookLog", back_populates="webhook", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_webhook_user_active", "user_id", "is_active"),
        Index("ix_webhook_health", "health_status", "last_health_check_at"),
    )

    @hybrid_property
    def success_rate(self):
        """Calculate success rate"""
        if self.total_calls == 0:
            return Decimal('0.00')
        return (Decimal(self.success_count) / Decimal(self.total_calls) * 100).quantize(Decimal('0.01'))

    def __repr__(self):
        return f"<Webhook(id={self.id}, name={self.name}, url={self.url})>"


class WebhookLog(Base, TimestampMixin):
    """Webhook delivery logs"""
    __tablename__ = "webhook_logs"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    webhook_id = Column(Integer, ForeignKey("webhooks.id", ondelete="CASCADE"), nullable=False, index=True)

    # Event Details
    event = Column(SQLEnum(WebhookEvent, native_enum=False), nullable=False, index=True)
    event_id = Column(String(100), index=True)
    event_data = Column(JSON, default=dict)
    event_timestamp = Column(DateTime(timezone=True), default=get_india_time)

    # Request Details
    request_url = Column(String(500))
    request_method = Column(String(10))
    request_headers = Column(JSON)
    request_body = Column(JSON)
    request_sent_at = Column(DateTime(timezone=True))

    # Response Details
    response_status_code = Column(SmallInteger, index=True)
    response_headers = Column(JSON)
    response_body = Column(Text)
    response_received_at = Column(DateTime(timezone=True))
    response_time_ms = Column(Integer)

    # Status
    is_success = Column(Boolean, default=False, nullable=False, index=True)
    error_message = Column(Text)
    error_code = Column(String(50))
    error_type = Column(String(100))  # TIMEOUT, CONNECTION_ERROR, HTTP_ERROR, etc.

    # Retry Info
    attempt_number = Column(SmallInteger, default=1, nullable=False)
    next_retry_at = Column(DateTime(timezone=True))
    is_final_attempt = Column(Boolean, default=False)

    # Processing
    processing_time_ms = Column(Integer)
    queue_time_ms = Column(Integer)

    # Metadata
    meta = Column(JSON, default=dict)
    tags = Column(JSON, default=list)

    # Relationships
    webhook = relationship("Webhook", back_populates="webhook_logs")

    __table_args__ = (
        Index("ix_webhook_log_webhook_date", "webhook_id", "created_at"),
        Index("ix_webhook_log_success", "is_success", "created_at"),
        Index("ix_webhook_log_event", "event", "created_at"),
        Index("ix_webhook_log_status_code", "response_status_code", "created_at"),
    )

    @hybrid_property
    def total_time_ms(self):
        """Calculate total time including queue and processing"""
        return (self.queue_time_ms or 0) + (self.response_time_ms or 0)

    def __repr__(self):
        return f"<WebhookLog(id={self.id}, webhook_id={self.webhook_id}, event={self.event}, success={self.is_success})>"


# =====================================================
# SUPPORT & TICKETS (Enhanced)
# =====================================================

class SupportTicket(Base, TimestampMixin, SoftDeleteMixin, VersionMixin, MetadataMixin):
    """Support ticket system"""
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Ticket Details
    ticket_id = Column(String(50), unique=True, nullable=False, index=True)
    subject = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Classification
    category = Column(String(100), index=True)  # TECHNICAL, TRANSACTION, COMMISSION, KYC, ACCOUNT, OTHER
    sub_category = Column(String(100))
    type = Column(String(50))  # ISSUE, REQUEST, COMPLAINT, INQUIRY

    # Status
    status = Column(SQLEnum(TicketStatus, native_enum=False), default=TicketStatus.OPEN, nullable=False, index=True)
    priority = Column(SQLEnum(TicketPriority, native_enum=False), default=TicketPriority.MEDIUM, nullable=False,
                      index=True)

    # Assignment
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_at = Column(DateTime(timezone=True))
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    department = Column(String(100))
    team = Column(String(100))

    # Related Entity
    related_transaction_id = Column(BigInteger, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    related_settlement_id = Column(Integer, ForeignKey("settlements.id", ondelete="SET NULL"), nullable=True)
    related_entity_type = Column(String(100), index=True)
    related_entity_id = Column(String(100), index=True)

    # SLA Tracking
    sla_breach_time = Column(DateTime(timezone=True))
    is_sla_breached = Column(Boolean, default=False, index=True)
    due_date = Column(DateTime(timezone=True), index=True)

    first_response_time_minutes = Column(Integer)
    first_response_at = Column(DateTime(timezone=True))
    first_response_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))

    resolution_time_minutes = Column(Integer)
    expected_resolution_time = Column(Integer)

    # Escalation
    is_escalated = Column(Boolean, default=False, nullable=False, index=True)
    escalation_level = Column(SmallInteger, default=0)
    escalated_at = Column(DateTime(timezone=True))
    escalated_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    escalation_reason = Column(Text)

    # Communication
    customer_email = Column(String(255))
    customer_phone = Column(String(20))
    preferred_contact_method = Column(String(20))  # EMAIL, PHONE, CHAT

    # Satisfaction
    rating = Column(SmallInteger)  # 1-5
    feedback = Column(Text)
    feedback_received_at = Column(DateTime(timezone=True))

    # Resolution
    resolution = Column(Text)
    resolution_notes = Column(Text)
    root_cause = Column(Text)
    preventive_action = Column(Text)

    # Metadata
    attachments = Column(JSON, default=list)
    labels = Column(JSON, default=list)
    custom_fields = Column(JSON, default=dict)

    # Source
    source = Column(String(50), default="WEB")  # WEB, MOBILE, EMAIL, PHONE, CHAT

    # Internal Tracking
    internal_notes = Column(Text)
    work_log = Column(JSON, default=list)

    # Audit Fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    resolved_at = Column(DateTime(timezone=True), index=True)
    closed_at = Column(DateTime(timezone=True), index=True)
    reopened_at = Column(DateTime(timezone=True))
    reopen_count = Column(Integer, default=0)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="tickets")
    assignee = relationship("User", foreign_keys=[assigned_to], post_update=True)
    assigner = relationship("User", foreign_keys=[assigned_by], post_update=True)
    escalation_user = relationship("User", foreign_keys=[escalated_to], post_update=True)
    first_responder = relationship("User", foreign_keys=[first_response_by], post_update=True)
    transaction = relationship("Transaction")
    settlement = relationship("Settlement")
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)
    replies = relationship("TicketReply", back_populates="ticket", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_ticket_user_status", "user_id", "status"),
        Index("ix_ticket_status_priority", "status", "priority", "created_at"),
        Index("ix_ticket_assigned", "assigned_to", "status"),
        Index("ix_ticket_category", "category", "sub_category"),
        Index("ix_ticket_sla", "is_sla_breached", "due_date"),
        Index("ix_ticket_escalation", "is_escalated", "escalation_level"),
        CheckConstraint("rating IS NULL OR (rating >= 1 AND rating <= 5)", name="ck_ticket_rating"),
    )

    @hybrid_property
    def is_open(self):
        """Check if ticket is open"""
        return self.status in (TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.REOPENED)

    @hybrid_property
    def age_hours(self):
        """Calculate ticket age in hours"""
        if self.closed_at:
            end_time = self.closed_at
        else:
            end_time = datetime.now(INDIA_TZ)
        delta = end_time - self.created_at
        return round(delta.total_seconds() / 3600, 2)

    def __repr__(self):
        return f"<SupportTicket(id={self.id}, ticket_id={self.ticket_id}, status={self.status})>"


class TicketReply(Base, TimestampMixin):
    """Ticket conversation replies"""
    __tablename__ = "ticket_replies"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Reply Details
    message = Column(Text, nullable=False)
    html_message = Column(Text)

    # Type
    reply_type = Column(String(50), default="REPLY")  # REPLY, NOTE, RESOLUTION, FOLLOW_UP
    is_internal = Column(Boolean, default=False, nullable=False)  # Internal note not visible to user
    is_automated = Column(Boolean, default=False, nullable=False)

    # Sender Details
    sender_name = Column(String(255))
    sender_email = Column(String(255))
    sender_type = Column(String(50))  # CUSTOMER, AGENT, SYSTEM

    # Attachments
    attachments = Column(JSON, default=list)
    attachment_count = Column(Integer, default=0)

    # Status Change
    status_before = Column(String(50))
    status_after = Column(String(50))
    status_changed = Column(Boolean, default=False)

    # Time Tracking
    time_spent_minutes = Column(Integer)

    # Email Details
    email_message_id = Column(String(255))
    email_thread_id = Column(String(255))
    in_reply_to = Column(String(255))

    # Metadata
    meta = Column(JSON, default=dict)

    # Source
    source = Column(String(50))  # WEB, EMAIL, MOBILE, API

    # Relationships
    ticket = relationship("SupportTicket", back_populates="replies")
    user = relationship("User")

    __table_args__ = (
        Index("ix_ticket_reply_ticket_date", "ticket_id", "created_at"),
        Index("ix_ticket_reply_user", "user_id", "created_at"),
        Index("ix_ticket_reply_internal", "is_internal", "created_at"),
    )

    def __repr__(self):
        return f"<TicketReply(id={self.id}, ticket_id={self.ticket_id}, user_id={self.user_id})>"


# =====================================================
# RATE LIMITING & CONFIGURATION
# =====================================================

class RateLimit(Base, TimestampMixin):
    """API rate limiting tracking"""
    __tablename__ = "rate_limits"

    id = Column(BigInteger, primary_key=True)

    # Identifier
    identifier_type = Column(String(50), nullable=False, index=True)  # USER, IP, API_KEY, SESSION
    identifier_value = Column(String(255), nullable=False, index=True)

    # Rate Limit Details
    endpoint = Column(String(255), nullable=False, index=True)
    method = Column(String(10))
    resource = Column(String(100))

    # Counters
    request_count = Column(Integer, default=1, nullable=False)
    window_start = Column(DateTime(timezone=True), nullable=False, index=True)
    window_end = Column(DateTime(timezone=True), nullable=False)
    window_duration_seconds = Column(Integer, default=3600)

    # Limit Configuration
    max_requests = Column(Integer, nullable=False)

    # Status
    is_blocked = Column(Boolean, default=False, nullable=False, index=True)
    blocked_at = Column(DateTime(timezone=True))
    blocked_until = Column(DateTime(timezone=True), index=True)
    block_reason = Column(String(500))

    # Reset
    reset_at = Column(DateTime(timezone=True))
    auto_reset = Column(Boolean, default=True)

    # Additional Info
    ip_address = Column(String(50))
    user_agent = Column(Text)

    # Metadata
    meta = Column(JSON, default=dict)

    __table_args__ = (
        UniqueConstraint("identifier_type", "identifier_value", "endpoint", "window_start",
                         name="uq_rate_limit_window"),
        Index("ix_rate_limit_identifier", "identifier_type", "identifier_value", "window_start"),
        Index("ix_rate_limit_blocked", "is_blocked", "blocked_until"),
        Index("ix_rate_limit_reset", "reset_at"),
    )

    @hybrid_property
    def requests_remaining(self):
        """Calculate remaining requests"""
        return max(0, self.max_requests - self.request_count)

    @hybrid_property
    def is_limit_exceeded(self):
        """Check if limit is exceeded"""
        return self.request_count >= self.max_requests

    def __repr__(self):
        return f"<RateLimit(id={self.id}, identifier={self.identifier_value}, endpoint={self.endpoint}, count={self.request_count})>"


class SystemConfig(Base, TimestampMixin, VersionMixin):
    """System-wide and entity-specific configurations"""
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Configuration
    config_key = Column(String(100), nullable=False, index=True)
    config_value = Column(JSON, nullable=False)
    config_type = Column(String(50))  # STRING, NUMBER, BOOLEAN, JSON, ARRAY
    description = Column(Text)
    help_text = Column(Text)

    # Scope
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=True, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    scope = Column(String(50), default="GLOBAL")  # GLOBAL, ENTITY, USER

    # Metadata
    category = Column(String(100), index=True)  # FEATURE, LIMIT, PAYMENT, NOTIFICATION, SECURITY
    sub_category = Column(String(100))
    is_encrypted = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)  # Visible to users
    is_system = Column(Boolean, default=False, nullable=False)  # System-only, not editable

    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_locked = Column(Boolean, default=False)  # Prevent changes

    # Validation
    validation_rules = Column(JSON, default=dict)
    allowed_values = Column(JSON, default=list)
    default_value = Column(JSON)
    min_value = Column(Numeric(20, 6))
    max_value = Column(Numeric(20, 6))

    # Change Tracking
    previous_value = Column(JSON)
    changed_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    changed_at = Column(DateTime(timezone=True))
    change_reason = Column(Text)

    # Metadata
    tags = Column(JSON, default=list)
    meta = Column(JSON, default=dict)

    # Relationships
    changer = relationship("User", foreign_keys=[changed_by], post_update=True)

    __table_args__ = (
        UniqueConstraint("config_key", "entity_type", "entity_id", name="uq_system_config_scope"),
        Index("ix_system_config_key_entity", "config_key", "entity_type", "entity_id"),
        Index("ix_system_config_category", "category", "is_active"),
    )

    def __repr__(self):
        return f"<SystemConfig(id={self.id}, key={self.config_key}, entity={self.entity_type})>"


class FeatureFlag(Base, TimestampMixin, VersionMixin):
    """Feature flag management"""
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Flag Details
    flag_key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)

    # Status
    is_enabled = Column(Boolean, default=False, nullable=False, index=True)
    is_permanent = Column(Boolean, default=False)  # Cannot be disabled once enabled

    # Rollout Configuration
    rollout_percentage = Column(SmallInteger, default=0)  # 0-100
    rollout_strategy = Column(String(50))  # PERCENTAGE, WHITELIST, BLACKLIST, GRADUAL

    # Entity-based Rollout
    rollout_entity_types = Column(JSON, default=list)  # Which entity types can access
    rollout_entity_ids = Column(JSON, default=list)  # Specific entities

    # User-based Rollout
    whitelisted_user_ids = Column(JSON, default=list)
    blacklisted_user_ids = Column(JSON, default=list)

    # Environment
    environments = Column(JSON, default=list)  # ["development", "staging", "production"]

    # Schedule
    scheduled_enable_at = Column(DateTime(timezone=True))
    scheduled_disable_at = Column(DateTime(timezone=True))
    auto_enable = Column(Boolean, default=False)
    auto_disable = Column(Boolean, default=False)

    # Dependencies
    depends_on_flags = Column(JSON, default=list)  # Other flags that must be enabled
    conflicts_with_flags = Column(JSON, default=list)  # Flags that cannot be enabled together

    # Statistics
    total_checks = Column(BigInteger, default=0)
    total_enabled = Column(BigInteger, default=0)
    total_disabled = Column(BigInteger, default=0)

    # Metadata
    category = Column(String(100), index=True)
    owner = Column(String(255))
    team = Column(String(100))
    jira_ticket = Column(String(50))
    tags = Column(JSON, default=list)
    meta = Column(JSON, default=dict)

    __table_args__ = (
        Index("ix_feature_flag_enabled", "is_enabled"),
        Index("ix_feature_flag_category", "category", "is_enabled"),
        Index("ix_feature_flag_schedule", "scheduled_enable_at", "scheduled_disable_at"),
        CheckConstraint("rollout_percentage >= 0 AND rollout_percentage <= 100",
                        name="ck_rollout_percentage_range"),
    )

    def __repr__(self):
        return f"<FeatureFlag(id={self.id}, key={self.flag_key}, enabled={self.is_enabled})>"


# =====================================================
# REPORTING & UTILITIES
# =====================================================

class DailyReport(Base, TimestampMixin):
    """Daily aggregated reports"""
    __tablename__ = "daily_reports"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Report Details
    report_date = Column(Date, nullable=False, index=True)
    entity_type = Column(SQLEnum(EntityType, native_enum=False), nullable=True, index=True)
    entity_id = Column(Integer, nullable=True, index=True)

    # Transaction Metrics
    total_transactions = Column(BigInteger, default=0)
    successful_transactions = Column(BigInteger, default=0)
    failed_transactions = Column(BigInteger, default=0)
    pending_transactions = Column(BigInteger, default=0)
    reversed_transactions = Column(BigInteger, default=0)

    total_volume = Column(Numeric(20, 2), default=Decimal('0.00'))
    successful_volume = Column(Numeric(20, 2), default=Decimal('0.00'))
    failed_volume = Column(Numeric(20, 2), default=Decimal('0.00'))

    total_commission = Column(Numeric(20, 2), default=Decimal('0.00'))
    total_charges = Column(Numeric(20, 2), default=Decimal('0.00'))
    total_gst = Column(Numeric(20, 2), default=Decimal('0.00'))
    total_tds = Column(Numeric(20, 2), default=Decimal('0.00'))

    # User Metrics
    active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_users = Column(Integer, default=0)

    # Wallet Metrics
    total_wallet_balance = Column(Numeric(20, 2), default=Decimal('0.00'))
    total_wallet_credits = Column(Numeric(20, 2), default=Decimal('0.00'))
    total_wallet_debits = Column(Numeric(20, 2), default=Decimal('0.00'))

    # KYC Metrics
    kyc_pending = Column(Integer, default=0)
    kyc_verified = Column(Integer, default=0)
    kyc_rejected = Column(Integer, default=0)

    # Settlement Metrics
    total_settlements = Column(Integer, default=0)
    settlement_amount = Column(Numeric(20, 2), default=Decimal('0.00'))
    pending_settlements = Column(Integer, default=0)

    # Performance Metrics
    average_transaction_time = Column(Numeric(10, 2))  # in seconds
    success_rate = Column(Numeric(5, 2), default=Decimal('0.00'))
    average_transaction_value = Column(Numeric(15, 2), default=Decimal('0.00'))

    # Service-wise Breakdown
    service_breakdown = Column(JSON, default=dict)
    category_breakdown = Column(JSON, default=dict)

    # Hour-wise Breakdown
    hourly_breakdown = Column(JSON, default=dict)

    # Top Performers
    top_users = Column(JSON, default=list)
    top_services = Column(JSON, default=list)

    # Metadata
    generated_at = Column(DateTime(timezone=True))
    generated_by = Column(String(100))  # SYSTEM, USER, SCHEDULED
    is_final = Column(Boolean, default=False)
    notes = Column(Text)
    meta = Column(JSON, default=dict)

    __table_args__ = (
        UniqueConstraint("report_date", "entity_type", "entity_id", name="uq_daily_report"),
        Index("ix_daily_report_entity", "entity_type", "entity_id", "report_date"),
        Index("ix_daily_report_date", "report_date"),
    )

    def __repr__(self):
        return f"<DailyReport(id={self.id}, date={self.report_date}, transactions={self.total_transactions})>"


class OTPLog(Base, TimestampMixin):
    """OTP generation and verification logs"""
    __tablename__ = "otp_logs"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Recipient Details
    recipient_type = Column(String(20), nullable=False, index=True)  # PHONE, EMAIL
    recipient_value = Column(String(255), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # OTP Details
    otp_code = Column(String(10), nullable=False)
    otp_hash = Column(String(255))
    otp_length = Column(SmallInteger, default=6)
    purpose = Column(String(100), nullable=False, index=True)  # LOGIN, REGISTRATION, TRANSACTION, PASSWORD_RESET

    # Status
    is_verified = Column(Boolean, default=False, nullable=False, index=True)
    verified_at = Column(DateTime(timezone=True))
    attempts = Column(SmallInteger, default=0, nullable=False)
    max_attempts = Column(SmallInteger, default=3, nullable=False)

    # Expiry
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    is_expired = Column(Boolean, default=False, nullable=False)
    ttl_seconds = Column(Integer, default=300)  # Time to live

    # Delivery
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True))
    sent_via = Column(String(50))  # SMS, EMAIL, WHATSAPP
    delivery_status = Column(String(50))
    delivery_error = Column(Text)

    # Provider Details
    provider_name = Column(String(100))
    provider_message_id = Column(String(255))
    provider_response = Column(JSON)

    # Security
    ip_address = Column(String(50), index=True)
    user_agent = Column(Text)
    device_id = Column(String(255))
    location = Column(String(255))

    # Rate Limiting
    is_rate_limited = Column(Boolean, default=False)
    rate_limit_exceeded_at = Column(DateTime(timezone=True))

    # Metadata
    meta = Column(JSON, default=dict)

    # Relationships
    user = relationship("User")

    __table_args__ = (
        Index("ix_otp_recipient_purpose", "recipient_value", "purpose", "created_at"),
        Index("ix_otp_expires", "expires_at", "is_verified"),
        Index("ix_otp_user", "user_id", "purpose", "created_at"),
        CheckConstraint("attempts >= 0", name="ck_otp_attempts"),
    )

    @hybrid_property
    def is_valid(self):
        """Check if OTP is still valid"""
        return not self.is_expired and not self.is_verified and self.attempts < self.max_attempts

    def __repr__(self):
        return f"<OTPLog(id={self.id}, recipient={self.recipient_value}, purpose={self.purpose}, verified={self.is_verified})>"


class FileUpload(Base, TimestampMixin, SoftDeleteMixin):
    """Track file uploads"""
    __tablename__ = "file_uploads"

    id = Column(Integer, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # File Details
    file_name = Column(String(255), nullable=False)
    original_name = Column(String(255))
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500))
    file_type = Column(String(100), index=True)
    file_size = Column(BigInteger)  # in bytes
    mime_type = Column(String(100))
    file_extension = Column(String(10))

    # Classification
    category = Column(String(100), index=True)  # KYC, PROFILE, DOCUMENT, INVOICE, RECEIPT
    sub_category = Column(String(100))
    related_entity_type = Column(String(100), index=True)
    related_entity_id = Column(String(100), index=True)

    # Storage
    storage_provider = Column(String(50))  # LOCAL, S3, CLOUDINARY, AZURE
    storage_bucket = Column(String(255))
    storage_key = Column(String(500))
    storage_region = Column(String(100))

    # Security
    is_public = Column(Boolean, default=False, nullable=False)
    is_encrypted = Column(Boolean, default=False)
    encryption_algorithm = Column(String(50))
    access_token = Column(String(255))
    access_token_expires_at = Column(DateTime(timezone=True))

    # Virus Scan
    is_scanned = Column(Boolean, default=False)
    scan_status = Column(String(50))  # CLEAN, INFECTED, FAILED
    scanned_at = Column(DateTime(timezone=True))
    scan_result = Column(JSON)

    # OCR/Text Extraction
    has_text_extracted = Column(Boolean, default=False)
    extracted_text = Column(Text)
    ocr_confidence = Column(Numeric(5, 2))

    # Image Processing
    is_image = Column(Boolean, default=False)
    image_width = Column(Integer)
    image_height = Column(Integer)
    thumbnail_url = Column(String(500))

    # Document Processing
    is_document = Column(Boolean, default=False)
    page_count = Column(Integer)

    # Metadata
    tags = Column(JSON, default=list)
    meta = Column(JSON, default=dict)
    exif_data = Column(JSON)

    # Upload Details
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    upload_ip = Column(String(50))
    upload_device = Column(String(255))

    # Audit Fields
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Access Tracking
    download_count = Column(Integer, default=0)
    last_accessed_at = Column(DateTime(timezone=True))
    view_count = Column(Integer, default=0)

    # Expiry
    expires_at = Column(DateTime(timezone=True))
    is_expired = Column(Boolean, default=False)

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by], post_update=True)
    creator = relationship("User", foreign_keys=[created_by], post_update=True)
    updater = relationship("User", foreign_keys=[updated_by], post_update=True)

    __table_args__ = (
        Index("ix_file_upload_user_category", "uploaded_by", "category"),
        Index("ix_file_upload_related", "related_entity_type", "related_entity_id"),
        Index("ix_file_upload_storage", "storage_provider", "storage_bucket"),
        Index("ix_file_upload_expires", "expires_at", "is_expired"),
    )

    @hybrid_property
    def file_size_mb(self):
        """Get file size in MB"""
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0

    def __repr__(self):
        return f"<FileUpload(id={self.id}, name={self.file_name}, category={self.category})>"


# =====================================================
# DATABASE EVENTS & TRIGGERS
# =====================================================

@event.listens_for(Wallet, 'before_insert')
def generate_wallet_number(mapper, connection, target):
    """Auto-generate wallet number"""
    if not target.wallet_number:
        import random
        prefix = target.purpose.value[:4].upper()
        number = random.randint(100000000, 999999999)
        target.wallet_number = f"{prefix}{number}"


@event.listens_for(Transaction, 'before_insert')
def generate_transaction_id(mapper, connection, target):
    """Auto-generate transaction ID"""
    if not target.transaction_id:
        import random
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_num = random.randint(1000, 9999)
        target.transaction_id = f"TXN{timestamp}{random_num}"


@event.listens_for(Settlement, 'before_insert')
def generate_settlement_id(mapper, connection, target):
    """Auto-generate settlement ID"""
    if not target.settlement_id:
        import random
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_num = random.randint(100, 999)
        target.settlement_id = f"STL{timestamp}{random_num}"


@event.listens_for(SupportTicket, 'before_insert')
def generate_ticket_id(mapper, connection, target):
    """Auto-generate ticket ID"""
    if not target.ticket_id:
        import random
        timestamp = datetime.now().strftime('%Y%m%d')
        random_num = random.randint(10000, 99999)
        target.ticket_id = f"TKT{timestamp}{random_num}"


@event.listens_for(User, 'before_insert')
def generate_referral_code(mapper, connection, target):
    """Auto-generate referral code"""
    if not target.referral_code:
        import random
        import string
        chars = string.ascii_uppercase + string.digits
        target.referral_code = ''.join(random.choices(chars, k=8))


class IntegrationAuditLog(Base, TimestampMixin):
    """Self-contained audit trail for external integrations and sensitive
    operations (BBPS / OTP / WALLET / SMS).

    Purpose-built and dependency-free (no enum FKs) so it can be created on a
    live database without migration risk, queried/filtered in the admin panel,
    and exported (CSV/JSON) for reconciliation with partners such as Airtel.
    """
    __tablename__ = "integration_audit_logs"

    id = Column(BigInteger, primary_key=True)
    uuid = Column(String(36), default=gen_uuid, unique=True, nullable=False, index=True)

    # Classification
    channel = Column(String(20), nullable=False, index=True)   # BBPS | OTP | WALLET | SMS
    action = Column(String(60), nullable=False, index=True)     # BILL_PAY, OTP_SEND, WALLET_DEBIT, SMS_SEND, ...
    status = Column(String(20), nullable=False, index=True, default="SUCCESS")  # SUCCESS | FAILED | PENDING | INITIATED
    provider = Column(String(60), index=True)                   # Airtel BBPS, Kutility, Internal, ...
    environment = Column(String(20), default="production", index=True)

    # Actor
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_name = Column(String(255))
    actor_phone = Column(String(20), index=True)

    # Target / correlation
    mobile_number = Column(String(20), index=True)              # notified / operated number
    reference_id = Column(String(120), index=True)              # bbpouRefId / txn id / biller ref
    biller_id = Column(String(80), index=True)
    amount = Column(Numeric(15, 2))

    # Transport
    endpoint = Column(String(500))
    http_status = Column(SmallInteger)
    response_code = Column(String(60))
    response_message = Column(Text)
    latency_ms = Column(Integer)
    ip_address = Column(String(50), index=True)

    # Payloads (secrets redacted before persistence)
    request_data = Column(JSON)
    response_data = Column(JSON)
    error = Column(Text)

    __table_args__ = (
        Index("ix_intg_audit_channel_created", "channel", "created_at"),
        Index("ix_intg_audit_status_created", "status", "created_at"),
    )


# =====================================================
# PRINT SUMMARY
# =====================================================
