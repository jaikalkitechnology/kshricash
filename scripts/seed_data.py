"""
VasuPay - Mock/Seed Data Script
Creates one mock user for each role in the system hierarchy.

Hierarchy:
  SUPERADMIN
  └── WHITE_LABEL
      └── AGENCY
          └── DISTRIBUTOR
              └── PARTNER
                  └── RETAILER
  CUSTOMER
  MERCHANT
  AGENT

Usage:
    cd /home/user/vasu_pay_v1
    python -m scripts.seed_data
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decimal import Decimal
from app.database import get_db_context, engine
from app.models_complete import (
    Base,
    User,
    WhiteLabel,
    Agency,
    Distributor,
    Partner,
    Retailer,
    Customer,
    Merchant,
    Wallet,
    EntityType,
    UserStatus,
    KYCStatus,
    WalletPurpose,
)
from app.core.security import get_password_hash

# Default password for all mock users
DEFAULT_PASSWORD = "Test@12345"


def create_tables():
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    print("Tables created/verified.")


def user_exists(db, phone):
    """Check if user with given phone already exists."""
    return db.query(User).filter(User.phone == phone).first() is not None


def entity_exists(db, model, code):
    """Check if entity with given code already exists."""
    return db.query(model).filter(model.code == code).first() is not None


def create_mock_users():
    """Create one mock user for each role with linked entities."""

    password_hash = get_password_hash(DEFAULT_PASSWORD)

    with get_db_context() as db:

        # ─────────────────────────────────────────────
        # 1. SUPERADMIN
        # ─────────────────────────────────────────────
        if not user_exists(db, "9000000001"):
            superadmin = User(
                entity_type=EntityType.SUPERADMIN,
                full_name="Super Admin",
                phone="9000000001",
                email="superadmin@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="VasuPay HQ, Connaught Place",
                city="New Delhi",
                state="Delhi",
                pincode="110001",
                daily_transaction_limit=Decimal("10000000.00"),
                per_transaction_limit=Decimal("5000000.00"),
                monthly_transaction_limit=Decimal("100000000.00"),
                roles=["superadmin"],
                permissions=[
                    "manage_all", "manage_users", "manage_white_labels",
                    "manage_agencies", "manage_distributors", "manage_partners",
                    "manage_retailers", "manage_merchants", "manage_customers",
                    "manage_transactions", "manage_wallets", "manage_commissions",
                    "manage_kyc", "manage_services", "manage_reports",
                    "manage_settings", "manage_system_config",
                ],
            )
            db.add(superadmin)
            db.flush()

            # Main wallet for superadmin
            db.add(Wallet(
                user_id=superadmin.id,
                purpose=WalletPurpose.MAIN,
                name="Superadmin Main Wallet",
                wallet_number=f"WL-SA-{superadmin.id:06d}",
                balance=Decimal("10000000.00"),
            ))
            print(f"  Created SUPERADMIN       -> phone: 9000000001")
        else:
            superadmin = db.query(User).filter(User.phone == "9000000001").first()
            print(f"  SUPERADMIN already exists -> phone: 9000000001")

        # ─────────────────────────────────────────────
        # 2. WHITE LABEL (entity + user)
        # ─────────────────────────────────────────────
        if not entity_exists(db, WhiteLabel, "WL001"):
            wl = WhiteLabel(
                name="VasuPay White Label",
                code="WL001",
                domain="whitelabel.vasupay.com",
                subdomain="whitelabel",
                contact_person="Rajesh Kumar",
                email="whitelabel@vasupay.com",
                phone="9000000002",
                business_name="VasuPay White Label Pvt Ltd",
                gst_number="29ABCDE1234F1ZK",
                pan_number="ABCDE1234F",
                address="MG Road, Sector 14",
                city="Gurugram",
                state="Haryana",
                pincode="122001",
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(wl)
            db.flush()
        else:
            wl = db.query(WhiteLabel).filter(WhiteLabel.code == "WL001").first()
            print(f"  WhiteLabel entity exists  -> code: WL001")

        if not user_exists(db, "9000000002"):
            wl_user = User(
                entity_type=EntityType.WHITE_LABEL,
                white_label_id=wl.id,
                full_name="Rajesh Kumar",
                phone="9000000002",
                email="rajesh.wl@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="MG Road, Sector 14",
                city="Gurugram",
                state="Haryana",
                pincode="122001",
                pan_number="ABCDE1234F",
                daily_transaction_limit=Decimal("5000000.00"),
                per_transaction_limit=Decimal("1000000.00"),
                monthly_transaction_limit=Decimal("50000000.00"),
                roles=["white_label_admin"],
                permissions=[
                    "manage_agencies", "manage_distributors", "manage_partners",
                    "manage_retailers", "manage_transactions", "manage_wallets",
                    "manage_commissions", "manage_kyc", "view_reports",
                    "manage_branding", "manage_services",
                ],
            )
            db.add(wl_user)
            db.flush()
            db.add(Wallet(
                user_id=wl_user.id,
                purpose=WalletPurpose.MAIN,
                name="White Label Main Wallet",
                wallet_number=f"WL-WL-{wl_user.id:06d}",
                balance=Decimal("5000000.00"),
            ))
            print(f"  Created WHITE_LABEL      -> phone: 9000000002")
        else:
            print(f"  WHITE_LABEL already exists-> phone: 9000000002")

        # ─────────────────────────────────────────────
        # 3. AGENCY (entity + user)
        # ─────────────────────────────────────────────
        if not entity_exists(db, Agency, "AG001"):
            agency = Agency(
                white_label_id=wl.id,
                name="Delhi Agency",
                code="AG001",
                contact_person="Priya Sharma",
                email="agency@vasupay.com",
                phone="9000000003",
                business_name="Delhi Agency Services",
                gst_number="07FGHIJ5678K1ZL",
                pan_number="FGHIJ5678K",
                address="Karol Bagh, Ring Road",
                city="New Delhi",
                state="Delhi",
                pincode="110005",
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(agency)
            db.flush()
        else:
            agency = db.query(Agency).filter(Agency.code == "AG001").first()
            print(f"  Agency entity exists      -> code: AG001")

        if not user_exists(db, "9000000003"):
            ag_user = User(
                entity_type=EntityType.AGENCY,
                agency_id=agency.id,
                full_name="Priya Sharma",
                phone="9000000003",
                email="priya.agency@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Karol Bagh, Ring Road",
                city="New Delhi",
                state="Delhi",
                pincode="110005",
                pan_number="FGHIJ5678K",
                daily_transaction_limit=Decimal("1000000.00"),
                per_transaction_limit=Decimal("500000.00"),
                monthly_transaction_limit=Decimal("20000000.00"),
                roles=["agency_admin"],
                permissions=[
                    "manage_distributors", "manage_partners", "manage_retailers",
                    "manage_transactions", "manage_wallets", "manage_commissions",
                    "manage_kyc", "view_reports",
                ],
            )
            db.add(ag_user)
            db.flush()
            db.add(Wallet(
                user_id=ag_user.id,
                purpose=WalletPurpose.MAIN,
                name="Agency Main Wallet",
                wallet_number=f"WL-AG-{ag_user.id:06d}",
                balance=Decimal("1000000.00"),
            ))
            print(f"  Created AGENCY           -> phone: 9000000003")
        else:
            print(f"  AGENCY already exists     -> phone: 9000000003")

        # ─────────────────────────────────────────────
        # 4. DISTRIBUTOR (entity + user)
        # ─────────────────────────────────────────────
        if not entity_exists(db, Distributor, "DT001"):
            distributor = Distributor(
                agency_id=agency.id,
                name="North India Distributor",
                code="DT001",
                email="distributor@vasupay.com",
                phone="9000000004",
                business_name="North India Distribution Co.",
                gst_number="09KLMNO9012P1ZM",
                pan_number="KLMNO9012P",
                address="Hazratganj, Main Road",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226001",
                level=1,
                hierarchy_path="1",
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(distributor)
            db.flush()
        else:
            distributor = db.query(Distributor).filter(Distributor.code == "DT001").first()
            print(f"  Distributor entity exists -> code: DT001")

        if not user_exists(db, "9000000004"):
            dt_user = User(
                entity_type=EntityType.DISTRIBUTOR,
                distributor_id=distributor.id,
                full_name="Amit Verma",
                phone="9000000004",
                email="amit.distributor@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Hazratganj, Main Road",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226001",
                pan_number="KLMNO9012P",
                daily_transaction_limit=Decimal("500000.00"),
                per_transaction_limit=Decimal("100000.00"),
                monthly_transaction_limit=Decimal("10000000.00"),
                roles=["distributor_admin"],
                permissions=[
                    "manage_partners", "manage_retailers",
                    "manage_transactions", "manage_wallets",
                    "manage_commissions", "view_reports",
                ],
            )
            db.add(dt_user)
            db.flush()
            db.add(Wallet(
                user_id=dt_user.id,
                purpose=WalletPurpose.MAIN,
                name="Distributor Main Wallet",
                wallet_number=f"WL-DT-{dt_user.id:06d}",
                balance=Decimal("500000.00"),
            ))
            print(f"  Created DISTRIBUTOR      -> phone: 9000000004")
        else:
            print(f"  DISTRIBUTOR already exists-> phone: 9000000004")

        # ─────────────────────────────────────────────
        # 5. PARTNER (entity + user)
        # ─────────────────────────────────────────────
        if not entity_exists(db, Partner, "PT001"):
            partner = Partner(
                distributor_id=distributor.id,
                name="Lucknow City Partner",
                code="PT001",
                email="partner@vasupay.com",
                phone="9000000005",
                business_name="Lucknow City Services",
                shop_name="VasuPay Partner Hub",
                address="Aminabad Market",
                shop_address="Shop 12, Aminabad Complex",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226018",
                opening_time="09:00",
                closing_time="21:00",
                working_days=["MON", "TUE", "WED", "THU", "FRI", "SAT"],
                latitude=Decimal("26.84590000"),
                longitude=Decimal("80.94700000"),
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(partner)
            db.flush()
        else:
            partner = db.query(Partner).filter(Partner.code == "PT001").first()
            print(f"  Partner entity exists     -> code: PT001")

        if not user_exists(db, "9000000005"):
            pt_user = User(
                entity_type=EntityType.PARTNER,
                partner_id=partner.id,
                full_name="Sanjay Gupta",
                phone="9000000005",
                email="sanjay.partner@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Aminabad Market",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226018",
                daily_transaction_limit=Decimal("200000.00"),
                per_transaction_limit=Decimal("50000.00"),
                monthly_transaction_limit=Decimal("5000000.00"),
                roles=["partner_admin"],
                permissions=[
                    "manage_retailers", "manage_transactions",
                    "manage_wallets", "view_reports",
                ],
            )
            db.add(pt_user)
            db.flush()
            db.add(Wallet(
                user_id=pt_user.id,
                purpose=WalletPurpose.MAIN,
                name="Partner Main Wallet",
                wallet_number=f"WL-PT-{pt_user.id:06d}",
                balance=Decimal("200000.00"),
            ))
            print(f"  Created PARTNER          -> phone: 9000000005")
        else:
            print(f"  PARTNER already exists    -> phone: 9000000005")

        # ─────────────────────────────────────────────
        # 6. RETAILER (entity + user)
        # ─────────────────────────────────────────────
        if not entity_exists(db, Retailer, "RT001"):
            retailer = Retailer(
                partner_id=partner.id,
                name="Aminabad Retailer",
                code="RT001",
                email="retailer@vasupay.com",
                phone="9000000006",
                shop_name="VasuPay Digital Seva",
                shop_type="DIGITAL_SERVICES",
                address="Shop 5, Main Market",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226018",
                landmark="Near Post Office",
                latitude=Decimal("26.84600000"),
                longitude=Decimal("80.94750000"),
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(retailer)
            db.flush()
        else:
            retailer = db.query(Retailer).filter(Retailer.code == "RT001").first()
            print(f"  Retailer entity exists    -> code: RT001")

        if not user_exists(db, "9000000006"):
            rt_user = User(
                entity_type=EntityType.RETAILER,
                retailer_id=retailer.id,
                full_name="Deepak Singh",
                phone="9000000006",
                email="deepak.retailer@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Shop 5, Main Market",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226018",
                daily_transaction_limit=Decimal("50000.00"),
                per_transaction_limit=Decimal("10000.00"),
                monthly_transaction_limit=Decimal("1000000.00"),
                roles=["retailer"],
                permissions=[
                    "create_transaction", "view_transactions",
                    "view_wallet", "view_reports",
                ],
            )
            db.add(rt_user)
            db.flush()
            db.add(Wallet(
                user_id=rt_user.id,
                purpose=WalletPurpose.MAIN,
                name="Retailer Main Wallet",
                wallet_number=f"WL-RT-{rt_user.id:06d}",
                balance=Decimal("50000.00"),
            ))
            print(f"  Created RETAILER         -> phone: 9000000006")
        else:
            print(f"  RETAILER already exists   -> phone: 9000000006")

        # ─────────────────────────────────────────────
        # 7. MERCHANT (entity + user)
        # ─────────────────────────────────────────────
        merchant_obj = None
        if not db.query(Merchant).filter(Merchant.merchant_code == "MR001").first():
            merchant_obj = Merchant(
                business_name="QuickMart Store",
                merchant_code="MR001",
                owner_name="Vikram Patel",
                phone="9000000007",
                email="merchant@vasupay.com",
                business_type="RETAIL",
                category="GENERAL_STORE",
                address="Station Road, Shop 22",
                city="Jaipur",
                state="Rajasthan",
                pincode="302001",
                bank_name="HDFC Bank",
                account_number="50100012345678",
                ifsc_code="HDFC0001234",
                account_holder="Vikram Patel",
                upi_id="quickmart@upi",
                is_active=True,
                is_verified=True,
                kyc_status=KYCStatus.VERIFIED,
            )
            db.add(merchant_obj)
            db.flush()
        else:
            merchant_obj = db.query(Merchant).filter(Merchant.merchant_code == "MR001").first()
            print(f"  Merchant entity exists    -> code: MR001")

        if not user_exists(db, "9000000007"):
            mr_user = User(
                entity_type=EntityType.MERCHANT,
                full_name="Vikram Patel",
                phone="9000000007",
                email="vikram.merchant@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Station Road, Shop 22",
                city="Jaipur",
                state="Rajasthan",
                pincode="302001",
                daily_transaction_limit=Decimal("500000.00"),
                per_transaction_limit=Decimal("100000.00"),
                monthly_transaction_limit=Decimal("10000000.00"),
                roles=["merchant"],
                permissions=[
                    "accept_payments", "view_transactions",
                    "manage_settlements", "view_wallet", "view_reports",
                ],
            )
            db.add(mr_user)
            db.flush()
            db.add(Wallet(
                user_id=mr_user.id,
                purpose=WalletPurpose.MAIN,
                name="Merchant Main Wallet",
                wallet_number=f"WL-MR-{mr_user.id:06d}",
                balance=Decimal("100000.00"),
            ))
            print(f"  Created MERCHANT         -> phone: 9000000007")
        else:
            print(f"  MERCHANT already exists   -> phone: 9000000007")

        # ─────────────────────────────────────────────
        # 8. CUSTOMER (entity + user)
        # ─────────────────────────────────────────────
        if not db.query(Customer).filter(Customer.phone == "9000000008").first():
            customer_obj = Customer(
                full_name="Neha Tiwari",
                phone="9000000008",
                email="customer@vasupay.com",
                date_of_birth="1995-06-15",
                gender="Female",
                address="Gomti Nagar, Sector 10",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226010",
                is_active=True,
                is_verified=True,
            )
            db.add(customer_obj)
            db.flush()

        if not user_exists(db, "9000000008"):
            cu_user = User(
                entity_type=EntityType.CUSTOMER,
                full_name="Neha Tiwari",
                phone="9000000008",
                email="neha.customer@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                date_of_birth="1995-06-15",
                gender="Female",
                address="Gomti Nagar, Sector 10",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226010",
                daily_transaction_limit=Decimal("50000.00"),
                per_transaction_limit=Decimal("10000.00"),
                monthly_transaction_limit=Decimal("200000.00"),
                roles=["customer"],
                permissions=[
                    "create_transaction", "view_transactions",
                    "view_wallet", "pay_bills",
                ],
            )
            db.add(cu_user)
            db.flush()
            db.add(Wallet(
                user_id=cu_user.id,
                purpose=WalletPurpose.MAIN,
                name="Customer Main Wallet",
                wallet_number=f"WL-CU-{cu_user.id:06d}",
                balance=Decimal("5000.00"),
            ))
            print(f"  Created CUSTOMER         -> phone: 9000000008")
        else:
            print(f"  CUSTOMER already exists   -> phone: 9000000008")

        # ─────────────────────────────────────────────
        # 9. AGENT (user only, no separate entity table)
        # ─────────────────────────────────────────────
        if not user_exists(db, "9000000009"):
            agent_user = User(
                entity_type=EntityType.AGENT,
                full_name="Ravi Yadav",
                phone="9000000009",
                email="ravi.agent@vasupay.com",
                password_hash=password_hash,
                status=UserStatus.ACTIVE,
                kyc_status=KYCStatus.VERIFIED,
                is_active=True,
                email_verified=True,
                phone_verified=True,
                address="Charbagh, Station Area",
                city="Lucknow",
                state="Uttar Pradesh",
                pincode="226004",
                daily_transaction_limit=Decimal("100000.00"),
                per_transaction_limit=Decimal("25000.00"),
                monthly_transaction_limit=Decimal("2000000.00"),
                roles=["agent"],
                permissions=[
                    "create_transaction", "view_transactions",
                    "manage_aeps", "manage_dmt", "view_wallet",
                    "view_reports",
                ],
            )
            db.add(agent_user)
            db.flush()
            db.add(Wallet(
                user_id=agent_user.id,
                purpose=WalletPurpose.MAIN,
                name="Agent Main Wallet",
                wallet_number=f"WL-AT-{agent_user.id:06d}",
                balance=Decimal("25000.00"),
            ))
            print(f"  Created AGENT            -> phone: 9000000009")
        else:
            print(f"  AGENT already exists      -> phone: 9000000009")

        # Commit all at once
        db.commit()
        print("\nAll mock users seeded successfully!")


def print_summary():
    """Print a summary table of all mock users."""
    print("\n" + "=" * 75)
    print("  MOCK USER CREDENTIALS SUMMARY")
    print("=" * 75)
    print(f"  {'Role':<18} {'Phone':<14} {'Email':<35} {'Password'}")
    print("-" * 75)
    users = [
        ("SUPERADMIN",   "9000000001", "superadmin@vasupay.com"),
        ("WHITE_LABEL",  "9000000002", "rajesh.wl@vasupay.com"),
        ("AGENCY",       "9000000003", "priya.agency@vasupay.com"),
        ("DISTRIBUTOR",  "9000000004", "amit.distributor@vasupay.com"),
        ("PARTNER",      "9000000005", "sanjay.partner@vasupay.com"),
        ("RETAILER",     "9000000006", "deepak.retailer@vasupay.com"),
        ("MERCHANT",     "9000000007", "vikram.merchant@vasupay.com"),
        ("CUSTOMER",     "9000000008", "neha.customer@vasupay.com"),
        ("AGENT",        "9000000009", "ravi.agent@vasupay.com"),
    ]
    for role, phone, email in users:
        print(f"  {role:<18} {phone:<14} {email:<35} {DEFAULT_PASSWORD}")
    print("=" * 75)


if __name__ == "__main__":
    print("VasuPay - Seeding Mock Role Users")
    print("=" * 40)
    create_tables()
    create_mock_users()
    print_summary()
