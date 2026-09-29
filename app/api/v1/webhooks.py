"""
VasuPay - Webhook Routes
Incoming webhook handlers for payment providers and service callbacks
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import logging

from app.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


# =====================================================
# PAYMENT GATEWAY WEBHOOKS
# =====================================================

@router.post(
    "/payment/callback",
    summary="Payment gateway callback",
)
async def payment_callback(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Handle payment gateway webhook callbacks (Razorpay, PayU, etc.).
    """
    body = await request.json()
    logger.info(f"Payment webhook received: {body.get('event', 'unknown')}")

    # TODO: Implement signature verification and payment status update
    return {"status": "received"}


# =====================================================
# SERVICE PROVIDER WEBHOOKS
# =====================================================

@router.post(
    "/service/callback",
    summary="Service provider callback",
)
async def service_callback(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Handle service provider webhook callbacks (BBPS, AEPS, DMT, etc.).
    """
    body = await request.json()
    logger.info(f"Service webhook received: {body.get('type', 'unknown')}")

    # TODO: Implement signature verification and transaction status update
    return {"status": "received"}
