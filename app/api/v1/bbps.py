"""
VasuPay - BBPS Routes (Airtel Payments Bank / Bharat Connect)
Bill payment services ported from the validated UAT suite.

Flow: biller-categories -> billers -> ccf/bill-fetch -> bill-pay -> inquiry
Reference: bbps_api_docs/APBL-BBPS-AI-Open-Banking-API_v1.0.html
"""

import logging
import uuid
from decimal import Decimal
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import (
    User, Wallet, WalletTransaction, WalletPurpose,
    Transaction, TransactionType, TransactionStatus, TransactionMode,
)
from app.services.bbps_service import (
    get_bbps_client, BBPSError, BBPS_SERVICE_CATALOG,
    get_bbps_api_version, set_bbps_api_version, normalize_bbps_version,
    BBPS_SUPPORTED_VERSIONS,
)
from app.services.sms_service import send_payment_success_sms
from app.services import audit_service
from app.config import settings


def _client_ip(request: "Request | None") -> "str | None":
    if request is None:
        return None
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else None


_STRIP_FROM_RESPONSE = ("_request", "_endpoint")


def _clean_envelope(result):
    """Strip request-echo keys from the envelope returned to the client.
    Keeps _wallet / _http_status / _elapsed_ms which the frontend consumes."""
    if not isinstance(result, dict):
        return result
    return {k: v for k, v in result.items() if k not in _STRIP_FROM_RESPONSE}


def _response_for_audit(result):
    """Full provider response for the audit log, minus all internal `_` keys."""
    if not isinstance(result, dict):
        return result
    return {k: v for k, v in result.items() if not k.startswith("_")}


def _audit_bbps(action, user, *, request=None, result=None, error=None, error_obj=None,
                reference_id=None, biller_id=None, amount=None):
    """Best-effort audit entry for a BBPS provider call.

    Stores the full request body sent to the provider and the full decrypted
    response received (both redacted/truncated by audit_service).
    """
    meta = (result.get("meta") or {}) if isinstance(result, dict) else {}
    # Request body + endpoint: from the success envelope, else from the error.
    req_body = None
    endpoint = None
    if isinstance(result, dict):
        req_body = result.get("_request")
        endpoint = result.get("_endpoint")
    if error_obj is not None:
        req_body = req_body or getattr(error_obj, "request_body", None)
        endpoint = endpoint or getattr(error_obj, "endpoint", None)

    ref = reference_id
    if ref is None and isinstance(result, dict):
        ref = (result.get("data") or {}).get("bbpouRefId")

    audit_service.record(
        channel=audit_service.CHANNEL_BBPS, action=action,
        status=audit_service.status_from_meta(meta) if result is not None else audit_service.STATUS_FAILED,
        provider="Airtel BBPS",
        user_id=getattr(user, "id", None),
        actor_name=getattr(user, "full_name", None),
        actor_phone=getattr(user, "phone", None),
        reference_id=ref, biller_id=biller_id, amount=amount,
        endpoint=endpoint,
        http_status=(result.get("_http_status") if isinstance(result, dict)
                     else getattr(error_obj, "http_status", None)),
        response_code=meta.get("code"), response_message=meta.get("description"),
        latency_ms=result.get("_elapsed_ms") if isinstance(result, dict) else None,
        ip_address=_client_ip(request),
        request_data=req_body,
        response_data=_response_for_audit(result) if result is not None else None,
        error=error,
    )


def _gen_txn_id() -> str:
    return "VPB" + datetime.now().strftime("%y%m%d%H%M%S") + uuid.uuid4().hex[:6].upper()
from app.schemas.bbps import (
    AgentRegisterRequest,
    AgentInquiryRequest,
    CCFRequest,
    BillFetchRequest,
    BillValidateRequest,
    BillPaymentRequest,
    BillInquiryRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bbps", tags=["BBPS"])

# Brand assets for the dashboard "services" UI (served by the frontend)
AIRTEL_LOGO = "https://www.airtel.in/bank/ibsv2-assets/Zxn8mYF3NbkBX9Qk_apb-logo-mobile-light.svg"
BHARAT_CONNECT_LOGO = "/bharat-connect/logo.svg"


def _handle(call, audit=None):
    """Run a BBPS client call and translate BBPSError into HTTP responses.

    `audit`, when given, is a tuple (action, user, request, biller_id) and an
    audit entry is written for both success and failure (captures the full
    request + response). Internal bookkeeping keys are stripped from the
    response returned to the client.
    """
    try:
        result = call()
        if audit:
            action, user, request, biller_id = audit
            _audit_bbps(action, user, request=request, result=result, biller_id=biller_id)
        return _clean_envelope(result)
    except BBPSError as e:
        logger.warning("BBPS error: %s", e.message)
        if audit:
            action, user, request, biller_id = audit
            _audit_bbps(action, user, request=request, error=e.message, error_obj=e, biller_id=biller_id)
        raise HTTPException(
            status_code=e.http_status or status.HTTP_502_BAD_GATEWAY,
            detail=e.message,
        )


# =====================================================
# SERVICES CATALOG (for dashboards)
# =====================================================
@router.get("/services", summary="List BBPS services available in dashboards")
def list_services(current_user: User = Depends(get_current_active_user)):
    """
    Static catalog of Bharat Connect / BBPS service categories surfaced as
    dashboard tiles, plus provider + brand metadata.
    """
    return {
        "provider": settings.BBPS_PROVIDER,
        "powered_by": "Bharat Connect via Airtel Payments Bank",
        "environment": "UAT" if "uat" in settings.BBPS_BASE_URL.lower() else "PROD",
        "logos": {"airtel": AIRTEL_LOGO, "bharat_connect": BHARAT_CONNECT_LOGO},
        "services": BBPS_SERVICE_CATALOG,
    }


# =====================================================
# API VERSION (v1 / v2) — admin-selectable at runtime
# =====================================================
class BbpsVersionRequest(BaseModel):
    version: str


@router.get("/version", summary="Get the active BBPS API version (v1/v2)")
def get_version(current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    active = get_bbps_api_version(db)
    return {
        "version": active,
        "default": normalize_bbps_version(settings.BBPS_API_VERSION),
        "supported": list(BBPS_SUPPORTED_VERSIONS),
        "bases": {"v1": settings.BBPS_BASE_URL, "v2": settings.BBPS_BASE_URL_V2},
    }


@router.put("/version", summary="Set the active BBPS API version (v1/v2)")
def set_version(payload: BbpsVersionRequest,
                current_user: User = Depends(get_current_active_user),
                db: Session = Depends(get_db)):
    if normalize_bbps_version(payload.version) not in BBPS_SUPPORTED_VERSIONS:
        raise HTTPException(status_code=400, detail="version must be 'v1' or 'v2'")
    active = set_bbps_api_version(db, payload.version, user_id=current_user.id)
    return {"version": active, "supported": list(BBPS_SUPPORTED_VERSIONS)}


# =====================================================
# BILLERS
# =====================================================
@router.get("/biller-categories", summary="Fetch BBPS biller categories")
def biller_categories(request: Request, current_user: User = Depends(get_current_active_user)):
    return _handle(lambda: get_bbps_client().biller_categories(),
                   audit=("SERVICE_LIST", current_user, request, None))


@router.get("/billers/{category_id}", summary="Fetch billers for a category")
def biller_configs(category_id: str, request: Request,
                   current_user: User = Depends(get_current_active_user)):
    return _handle(lambda: get_bbps_client().biller_configs(category_id),
                   audit=("BILLER_LIST", current_user, request, category_id))


# =====================================================
# BILL FLOW
# =====================================================
@router.post("/ccf", summary="Fetch convenience fee (CCF) for a biller")
def ccf_fetch(payload: CCFRequest, request: Request,
              current_user: User = Depends(get_current_active_user)):
    return _handle(lambda: get_bbps_client().ccf_fetch(payload.biller_id, payload.payment_amount),
                   audit=("CCF_FETCH", current_user, request, payload.biller_id))


@router.post("/bill/fetch", summary="Fetch a bill")
def bill_fetch(payload: BillFetchRequest, request: Request,
               current_user: User = Depends(get_current_active_user),
               db: Session = Depends(get_db)):
    version = get_bbps_api_version(db)
    result = _handle(lambda: get_bbps_client().bill_fetch(
        biller_id=payload.biller_id,
        references=payload.references,
        mobile_number=payload.mobile_number,
        customer_name=payload.customer_name,
        version=version,
    ), audit=("BILL_FETCH", current_user, request, payload.biller_id))
    return result


@router.post("/bill/validate", summary="Validate a bill")
def bill_validate(payload: BillValidateRequest, request: Request,
                  current_user: User = Depends(get_current_active_user)):
    return _handle(lambda: get_bbps_client().bill_validation(
        biller_id=payload.biller_id,
        references=payload.references,
        mobile_number=payload.mobile_number,
        customer_name=payload.customer_name,
    ), audit=("BILL_VALIDATE", current_user, request, payload.biller_id))


def _main_wallet(db: Session, user_id: int):
    return (
        db.query(Wallet)
        .filter(Wallet.user_id == user_id, Wallet.purpose == WalletPurpose.MAIN)
        .first()
    )


def _refund_wallet(db: Session, wallet: Wallet, debit_txn, amount: Decimal, reason: str):
    """Credit the amount back to the wallet after a failed BBPS payment."""
    before = Decimal(wallet.balance)
    wallet.balance = before + amount
    wallet.total_debited = max(Decimal("0.00"), Decimal(wallet.total_debited or 0) - amount)
    db.add(WalletTransaction(
        wallet_id=wallet.id, transaction_type=TransactionType.REFUND, amount=amount,
        balance_before=before, balance_after=wallet.balance,
        reference_type="BBPS_REFUND", description=f"BBPS refund: {reason}"[:500], status="SUCCESS",
    ))
    if debit_txn is not None:
        debit_txn.is_reversed = True
    db.commit()


def _record_service_txn(db, user, wallet, debit_txn, payload, amount, before):
    """Best-effort: create a service Transaction row for history. Never fatal."""
    try:
        txn = Transaction(
            user_id=user.id, wallet_id=wallet.id,
            transaction_type=TransactionType.DEBIT, status=TransactionStatus.PENDING,
            mode=TransactionMode.WALLET, transaction_id=_gen_txn_id(),
            amount=amount, total_amount=amount,
            balance_before=before, balance_after=wallet.balance,
            customer_name=payload.customer_name, customer_number=payload.mobile_number,
            reference_id=(payload.references or {}).get("reference1"),
            provider_name="Airtel BBPS",
            remarks=f"{payload.service or 'BBPS'} · {payload.biller_id}"[:500],
            additional_data={
                "service": payload.service or "BBPS",
                "biller_id": payload.biller_id,
                "references": payload.references,
            },
        )
        db.add(txn)
        db.flush()
        if debit_txn is not None:
            debit_txn.transaction_id = txn.id
        db.commit()
        return txn
    except Exception as e:  # pragma: no cover - schema/DB variance must not break payment
        logger.error("Could not record BBPS service transaction: %s", e)
        db.rollback()
        return None


@router.post("/bill/pay", summary="Pay a bill (debits the VasuPay wallet)")
def bill_pay(
    payload: BillPaymentRequest,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    amount = Decimal(str(payload.payment_amount or "0"))
    wallet = None
    debit_txn = None
    txn = None
    before = Decimal("0.00")

    # 1) Debit wallet up-front and commit (critical path)
    if payload.from_wallet:
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid payment amount")
        wallet = _main_wallet(db, current_user.id)
        if not wallet or not wallet.is_active or wallet.is_locked:
            raise HTTPException(status_code=400, detail="Wallet is not available")
        if Decimal(wallet.balance) < amount:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient wallet balance. Available ₹{wallet.balance}, required ₹{amount}",
            )
        before = Decimal(wallet.balance)
        wallet.balance = before - amount
        wallet.total_debited = Decimal(wallet.total_debited or 0) + amount
        wallet.transaction_count = (wallet.transaction_count or 0) + 1
        wallet.last_transaction_at = datetime.utcnow()
        debit_txn = WalletTransaction(
            wallet_id=wallet.id, transaction_type=TransactionType.DEBIT, amount=amount,
            balance_before=before, balance_after=wallet.balance,
            reference_type="BBPS", description=f"BBPS payment · {payload.biller_id}"[:500], status="SUCCESS",
        )
        db.add(debit_txn)
        db.commit()

        # 1b) Service transaction for history — best-effort, never blocks payment
        txn = _record_service_txn(db, current_user, wallet, debit_txn, payload, amount, before)

    # 2) Call the BBPS provider
    try:
        result = get_bbps_client().bill_payment(
            bbpou_ref_id=payload.bbpou_ref_id,
            biller_id=payload.biller_id,
            references=payload.references,
            payment_amount=payload.payment_amount,
            mobile_number=payload.mobile_number,
            customer_name=payload.customer_name,
            payment_mode=payload.payment_mode,
            payment_mode_info=payload.payment_mode_info or "",
        )
    except BBPSError as e:
        if wallet is not None:
            _refund_wallet(db, wallet, debit_txn, amount, "Provider error")
            _safe_set_txn_status(db, txn, TransactionStatus.FAILED, refunded=True, amount=amount)
            audit_service.record(
                channel=audit_service.CHANNEL_WALLET, action="WALLET_REFUND",
                status=audit_service.STATUS_SUCCESS, provider="Internal",
                user_id=current_user.id, actor_name=current_user.full_name,
                actor_phone=current_user.phone, mobile_number=payload.mobile_number,
                biller_id=payload.biller_id, amount=amount, ip_address=_client_ip(request),
                response_message="Refund on provider error",
            )
        _audit_bbps("BILL_PAY", current_user, request=request, error=e.message, error_obj=e,
                    biller_id=payload.biller_id, amount=amount)
        raise HTTPException(status_code=e.http_status or status.HTTP_502_BAD_GATEWAY, detail=e.message)

    # 3) Settle: keep debit on success OR pending(initiated); refund only on failure.
    #    BBPS meta.status -> 0 = success, 1 = failure, 2 = pending/initiated.
    meta = (result.get("meta") or {}) if isinstance(result, dict) else {}
    mstatus = meta.get("status")
    ok = mstatus == 0
    pending = mstatus == 2
    if wallet is not None:
        ref = (result.get("data") or {}).get("bbpouRefId")
        if ok or pending:
            if debit_txn is not None:
                if ref:
                    debit_txn.reference_id = str(ref)
                debit_txn.status = "SUCCESS" if ok else "PENDING"
                db.commit()
            _safe_set_txn_status(
                db, txn, TransactionStatus.SUCCESS if ok else TransactionStatus.PENDING,
                ref=ref, code=meta.get("code"), desc=meta.get("description"),
            )
        else:
            _refund_wallet(db, wallet, debit_txn, amount, meta.get("description", "Payment failed"))
            _safe_set_txn_status(
                db, txn, TransactionStatus.FAILED, refunded=True, amount=amount,
                ref=ref, code=meta.get("code"), desc=meta.get("description"),
            )
        db.refresh(wallet)
        result["_wallet"] = {"balance": float(wallet.balance), "debited": bool(ok or pending)}
        # Wallet audit: debit retained (success/initiated) or refunded (failure).
        audit_service.record(
            channel=audit_service.CHANNEL_WALLET,
            action="WALLET_DEBIT" if (ok or pending) else "WALLET_REFUND",
            status=audit_service.STATUS_SUCCESS, provider="Internal",
            user_id=current_user.id, actor_name=current_user.full_name,
            actor_phone=current_user.phone, mobile_number=payload.mobile_number,
            reference_id=str(ref) if ref else None, biller_id=payload.biller_id,
            amount=amount, ip_address=_client_ip(request),
            response_message=(f"Wallet balance {float(wallet.balance)}"
                              if (ok or pending) else "Refunded: payment failed"),
        )

    # 3b) Audit the BBPS payment call itself.
    _audit_bbps("BILL_PAY", current_user, request=request, result=result,
                biller_id=payload.biller_id, amount=amount)

    # 4) SMS confirmation (opt-in) — best-effort, only for accepted payments.
    if payload.notify_sms and (ok or pending):
        try:
            ref = (result.get("data") or {}).get("bbpouRefId")
            txn_id = str(ref or (txn.transaction_id if txn is not None else "") or "")
            send_payment_success_sms(
                mobile=payload.notify_mobile or payload.mobile_number,
                amount=payload.payment_amount,
                biller=payload.biller_id,
                txn_id=txn_id,
                user_id=current_user.id,
            )
        except Exception as e:  # pragma: no cover - notifications must not break payment
            logger.error("Payment SMS notification failed: %s", e)

    return _clean_envelope(result)


def _safe_set_txn_status(db, txn, status_val, *, refunded=False, amount=None, ref=None, code=None, desc=None):
    """Best-effort update of the service Transaction status."""
    if txn is None:
        return
    try:
        txn.status = status_val
        if ref:
            txn.external_transaction_id = str(ref)
        if code is not None:
            txn.provider_response_code = str(code)[:50]
        if desc is not None:
            txn.provider_response_message = desc
        if refunded:
            txn.is_refunded = True
            if amount is not None:
                txn.refund_amount = amount
        db.commit()
    except Exception as e:  # pragma: no cover
        logger.error("Could not update BBPS service transaction status: %s", e)
        db.rollback()


@router.post("/bill/inquiry", summary="Inquire bill payment status")
def bill_inquiry(payload: BillInquiryRequest, request: Request,
                 current_user: User = Depends(get_current_active_user),
                 db: Session = Depends(get_db)):
    version = get_bbps_api_version(db)
    return _handle(
        lambda: get_bbps_client().bill_payment_inquiry(payload.bbpou_ref_id, version=version),
        audit=("BILL_INQUIRY", current_user, request, None),
    )


@router.get("/balance-check", summary="Provider available balance")
def balance_check(request: Request,
                  current_user: User = Depends(get_current_active_user),
                  db: Session = Depends(get_db)):
    version = get_bbps_api_version(db)
    return _handle(
        lambda: get_bbps_client().balance_check(version=version),
        audit=("BALANCE_CHECK", current_user, request, None),
    )


# =====================================================
# AGENT
# =====================================================
@router.post("/agent/register", summary="Register a BBPS agent")
def agent_register(payload: AgentRegisterRequest, request: Request,
                   current_user: User = Depends(get_current_active_user)):
    body = {
        "mobileNumber": payload.mobile_number,
        "pan": payload.pan,
        "dob": payload.dob,
        "agentName": payload.agent_name,
        "agentShopName": payload.agent_shop_name,
        "addressLine1": payload.address_line1,
        "addressLine2": payload.address_line2 or "",
        "state": payload.state,
        "city": payload.city,
        "pinCode": payload.pin_code,
        "latitude": payload.latitude or "",
        "longitude": payload.longitude or "",
    }
    return _handle(lambda: get_bbps_client().register_agent(body),
                   audit=("AGENT_REGISTER", current_user, request, None))


@router.post("/agent/inquiry", summary="Inquire BBPS agent registration status")
def agent_inquiry(payload: AgentInquiryRequest, request: Request,
                  current_user: User = Depends(get_current_active_user)):
    return _handle(lambda: get_bbps_client().agent_inquiry(payload.mobile_number),
                   audit=("AGENT_INQUIRY", current_user, request, None))
