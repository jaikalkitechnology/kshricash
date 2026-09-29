"""
Kshricash - SMS Service (transactional / DLT)
==========================================
Thin wrapper around the Kutility SMS HTTP API used for transactional
notifications (e.g. BBPS payment confirmations). All sends are best-effort:
a failure here must never break the calling business flow.
"""

from __future__ import annotations

import logging
import re
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)


def _normalize_msisdn(mobile: Optional[str]) -> Optional[str]:
    """Return a bare 10-digit Indian mobile number, or None if invalid."""
    if not mobile:
        return None
    digits = re.sub(r"\D", "", str(mobile))
    if len(digits) > 10:
        digits = digits[-10:]  # strip country code / leading zeros
    return digits if re.fullmatch(r"[6-9]\d{9}", digits) else None


def send_sms(mobile: str, message: str, template_id: Optional[str] = None,
             *, action: str = "SMS_SEND", user_id: Optional[int] = None,
             reference_id: Optional[str] = None, audit: bool = True) -> bool:
    """Send a single transactional SMS. Returns True on an accepted request.

    Never raises: any transport/config error is logged and swallowed so the
    caller's flow (payment, etc.) is unaffected. When ``audit`` is set an entry
    is written to the integration audit log (channel=SMS).
    """
    import time as _time

    def _audit(status: str, http_status=None, error=None):
        if not audit:
            return
        try:
            from app.services import audit_service
            audit_service.record(
                channel=audit_service.CHANNEL_SMS, action=action, status=status,
                provider="Kutility", user_id=user_id, mobile_number=mobile,
                reference_id=reference_id, endpoint=settings.SMS_API_URL,
                http_status=http_status,
                request_data={"mobile": _normalize_msisdn(mobile), "message": message,
                              "template_id": template_id},
                error=error,
            )
        except Exception:  # pragma: no cover
            pass

    if not settings.SMS_ENABLED:
        logger.info("SMS disabled; skipping send to %s", mobile)
        _audit("FAILED", error="SMS disabled")
        return False

    msisdn = _normalize_msisdn(mobile)
    if not msisdn:
        logger.warning("SMS not sent: invalid mobile number %r", mobile)
        _audit("FAILED", error="Invalid mobile number")
        return False

    try:
        import requests
    except ImportError:  # pragma: no cover
        logger.error("SMS not sent: 'requests' dependency is not installed")
        _audit("FAILED", error="requests not installed")
        return False

    params = {
        "key": settings.SMS_API_KEY,
        "campaign": settings.SMS_CAMPAIGN,
        "routeid": settings.SMS_ROUTE_ID,
        "type": settings.SMS_TYPE,
        "contacts": msisdn,
        "senderid": settings.SMS_SENDER_ID,
        "msg": message,
        "pe_id": settings.SMS_PE_ID,
    }
    if template_id:
        params["template_id"] = template_id

    try:
        r = requests.get(settings.SMS_API_URL, params=params, timeout=settings.SMS_TIMEOUT_SECONDS)
        ok = r.status_code == 200
        if ok:
            logger.info("SMS sent to %s (%s chars)", msisdn, len(message))
        else:
            logger.warning("SMS send to %s returned HTTP %s: %s", msisdn, r.status_code, r.text[:200])
        _audit("SUCCESS" if ok else "FAILED", http_status=r.status_code,
               error=None if ok else (r.text[:500] if r.text else None))
        return ok
    except Exception as e:  # pragma: no cover - network variance must not break callers
        logger.error("SMS send to %s failed: %s", msisdn, e)
        _audit("FAILED", error=str(e))
        return False


def send_payment_success_sms(mobile: str, amount, biller: str, txn_id: str,
                             user_id: Optional[int] = None) -> bool:
    """Send the DLT-approved 'payment successful' SMS for a BBPS payment."""
    message = settings.SMS_PAYMENT_TEMPLATE.format(
        amount=_fmt_amount(amount),
        biller=biller or "biller",
        txn_id=txn_id or "-",
    )
    return send_sms(mobile, message, template_id=settings.SMS_PAYMENT_TEMPLATE_ID,
                    action="PAYMENT_SMS", user_id=user_id, reference_id=txn_id)


def _fmt_amount(amount) -> str:
    """Render an amount without trailing decimals when it's a whole number."""
    try:
        from decimal import Decimal
        d = Decimal(str(amount))
        return str(int(d)) if d == d.to_integral_value() else f"{d:.2f}"
    except Exception:
        return str(amount)
