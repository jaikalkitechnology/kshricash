"""
VasuPay - API v1 Router Registry
"""

from app.api.v1.auth import router as auth_router
from app.api.v1.admin import router as admin_router
from app.api.v1.users import router as users_router
from app.api.v1.kyc import router as kyc_router
from app.api.v1.wallets import router as wallets_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.settlements import router as settlements_router
from app.api.v1.commissions import router as commissions_router
from app.api.v1.services import router as services_router
from app.api.v1.reports import router as reports_router
from app.api.v1.webhooks import router as webhooks_router

__all__ = [
    "auth_router",
    "admin_router",
    "users_router",
    "kyc_router",
    "wallets_router",
    "transactions_router",
    "settlements_router",
    "commissions_router",
    "services_router",
    "reports_router",
    "webhooks_router",
]
