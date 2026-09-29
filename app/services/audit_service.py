"""
VasuPay - Integration Audit Service
===================================
Best-effort audit logging for external integrations and sensitive operations
(BBPS / OTP / WALLET / SMS). Writes to the `integration_audit_logs` table.

Design goals:
  * Never break the calling business flow — all failures are swallowed.
  * Never interfere with the caller's DB transaction — a *separate* short-lived
    session is used for every write.
  * Never persist secrets — request/response payloads are deeply redacted.
"""

from __future__ import annotations

import logging
from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Channels
CHANNEL_BBPS = "BBPS"
CHANNEL_OTP = "OTP"
CHANNEL_WALLET = "WALLET"
CHANNEL_SMS = "SMS"
CHANNELS = (CHANNEL_BBPS, CHANNEL_OTP, CHANNEL_WALLET, CHANNEL_SMS)

# Statuses
STATUS_SUCCESS = "SUCCESS"
STATUS_FAILED = "FAILED"
STATUS_PENDING = "PENDING"
STATUS_INITIATED = "INITIATED"

# Keys whose *values* must never be stored.
_REDACT_KEYS = {
    "key", "secret", "secret_key", "secretkey", "authorization", "auth",
    "password", "passwd", "pwd", "pin", "mpin", "otp", "otp_code", "token",
    "access_token", "refresh_token", "api_key", "apikey", "x-key-id",
    "trackingid1", "trackingid2", "tracking-id1", "tracking-id2",
    "devicedetails", "public_key", "private_key",
}
_MAX_STR = 2000


def _redact(value: Any, depth: int = 0) -> Any:
    """Recursively redact secret-looking keys and truncate long strings."""
    if depth > 6:
        return "…"
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            if isinstance(k, str) and k.strip().lower() in _REDACT_KEYS:
                out[k] = "***REDACTED***"
            else:
                out[k] = _redact(v, depth + 1)
        return out
    if isinstance(value, (list, tuple)):
        return [_redact(v, depth + 1) for v in value][:100]
    if isinstance(value, str) and len(value) > _MAX_STR:
        return value[:_MAX_STR] + "…"
    return value


def _to_decimal(amount: Any) -> Optional[Decimal]:
    if amount is None or amount == "":
        return None
    try:
        return Decimal(str(amount))
    except (InvalidOperation, ValueError, TypeError):
        return None


def record(
    *,
    channel: str,
    action: str,
    status: str = STATUS_SUCCESS,
    provider: Optional[str] = None,
    user_id: Optional[int] = None,
    actor_name: Optional[str] = None,
    actor_phone: Optional[str] = None,
    mobile_number: Optional[str] = None,
    reference_id: Optional[str] = None,
    biller_id: Optional[str] = None,
    amount: Any = None,
    endpoint: Optional[str] = None,
    http_status: Optional[int] = None,
    response_code: Optional[str] = None,
    response_message: Optional[str] = None,
    latency_ms: Optional[int] = None,
    ip_address: Optional[str] = None,
    request_data: Any = None,
    response_data: Any = None,
    error: Optional[str] = None,
) -> None:
    """Persist a single audit entry. Best-effort: swallows every error."""
    try:
        from app.database import SessionLocal
        from app.models_complete import IntegrationAuditLog

        ensure_table()
        entry = IntegrationAuditLog(
            channel=(channel or "").upper()[:20],
            action=(action or "")[:60],
            status=(status or STATUS_SUCCESS).upper()[:20],
            provider=(provider or None),
            environment=getattr(settings, "ENVIRONMENT", "production"),
            user_id=user_id,
            actor_name=(actor_name or None),
            actor_phone=(str(actor_phone)[:20] if actor_phone else None),
            mobile_number=(str(mobile_number)[:20] if mobile_number else None),
            reference_id=(str(reference_id)[:120] if reference_id else None),
            biller_id=(str(biller_id)[:80] if biller_id else None),
            amount=_to_decimal(amount),
            endpoint=(str(endpoint)[:500] if endpoint else None),
            http_status=http_status,
            response_code=(str(response_code)[:60] if response_code is not None else None),
            response_message=(str(response_message) if response_message else None),
            latency_ms=latency_ms,
            ip_address=(str(ip_address)[:50] if ip_address else None),
            request_data=_redact(request_data) if request_data is not None else None,
            response_data=_redact(response_data) if response_data is not None else None,
            error=(str(error) if error else None),
        )
        db = SessionLocal()
        try:
            db.add(entry)
            db.commit()
        finally:
            db.close()
    except Exception as e:  # pragma: no cover - auditing must never break callers
        logger.warning("Audit log write failed (%s/%s): %s", channel, action, e)


def status_from_meta(meta: Optional[dict]) -> str:
    """Map a BBPS provider meta.status (0/1/2) to an audit status."""
    s = (meta or {}).get("status") if isinstance(meta, dict) else None
    if s == 0:
        return STATUS_SUCCESS
    if s == 2:
        return STATUS_INITIATED
    return STATUS_FAILED


# ---- table bootstrap -------------------------------------------------------
# Some deployments run without create_all / migrations for this table, so we
# create it on demand (targeted, checkfirst) rather than relying on a global
# metadata create. Guarded so the check runs at most once per process.
_table_ready = False


def ensure_table() -> bool:
    """Ensure the integration_audit_logs table exists. Best-effort, cached."""
    global _table_ready
    if _table_ready:
        return True
    try:
        from app.database import engine
        from app.models_complete import IntegrationAuditLog
        IntegrationAuditLog.__table__.create(bind=engine, checkfirst=True)
        _table_ready = True
        return True
    except Exception as e:  # pragma: no cover - lack of CREATE priv, etc.
        logger.warning("Could not ensure integration_audit_logs table: %s", e)
        return False

