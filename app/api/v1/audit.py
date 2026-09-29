"""
Kshricash - Integration Audit Log API (admin)
==========================================
Read-only access to the `integration_audit_logs` table for the admin panel:
list + filter, per-channel/status summary counts, and CSV/JSON export for
reconciliation with partners (e.g. Airtel Payments Bank).
"""

import csv
import io
import json
import logging
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.dependencies import is_superadmin
from app.models_complete import User, IntegrationAuditLog
from app.services import audit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/audit", tags=["Audit Logs"])

_EXPORT_COLUMNS = [
    "id", "uuid", "created_at", "channel", "action", "status", "provider",
    "environment", "user_id", "actor_name", "actor_phone", "mobile_number",
    "reference_id", "biller_id", "amount", "endpoint", "http_status",
    "response_code", "response_message", "latency_ms", "ip_address", "error",
]


def _parse_date(value: Optional[str], *, end: bool = False) -> Optional[datetime]:
    if not value:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            dt = datetime.strptime(value, fmt)
            if end and fmt == "%Y-%m-%d":
                dt = dt + timedelta(days=1) - timedelta(seconds=1)
            return dt
        except ValueError:
            continue
    return None


def _apply_filters(query, *, channel, status_, action, user_id, search, date_from, date_to):
    if channel:
        query = query.filter(IntegrationAuditLog.channel == channel.upper())
    if status_:
        query = query.filter(IntegrationAuditLog.status == status_.upper())
    if action:
        query = query.filter(IntegrationAuditLog.action == action.upper())
    if user_id:
        query = query.filter(IntegrationAuditLog.user_id == user_id)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(
            IntegrationAuditLog.mobile_number.ilike(like),
            IntegrationAuditLog.reference_id.ilike(like),
            IntegrationAuditLog.biller_id.ilike(like),
            IntegrationAuditLog.actor_name.ilike(like),
            IntegrationAuditLog.actor_phone.ilike(like),
            IntegrationAuditLog.response_message.ilike(like),
        ))
    df = _parse_date(date_from)
    if df:
        query = query.filter(IntegrationAuditLog.created_at >= df)
    dt = _parse_date(date_to, end=True)
    if dt:
        query = query.filter(IntegrationAuditLog.created_at <= dt)
    return query


def _serialize(row: IntegrationAuditLog) -> dict:
    return {
        "id": row.id,
        "uuid": row.uuid,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "channel": row.channel,
        "action": row.action,
        "status": row.status,
        "provider": row.provider,
        "environment": row.environment,
        "user_id": row.user_id,
        "actor_name": row.actor_name,
        "actor_phone": row.actor_phone,
        "mobile_number": row.mobile_number,
        "reference_id": row.reference_id,
        "biller_id": row.biller_id,
        "amount": float(row.amount) if row.amount is not None else None,
        "endpoint": row.endpoint,
        "http_status": row.http_status,
        "response_code": row.response_code,
        "response_message": row.response_message,
        "latency_ms": row.latency_ms,
        "ip_address": row.ip_address,
        "request_data": row.request_data,
        "response_data": row.response_data,
        "error": row.error,
    }


@router.get("/logs", summary="List integration audit logs (BBPS/OTP/WALLET/SMS)")
def list_logs(
    channel: Optional[str] = Query(None, description="BBPS | OTP | WALLET | SMS"),
    status: Optional[str] = Query(None, description="SUCCESS | FAILED | PENDING | INITIATED"),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None, description="mobile / reference / biller / actor / message"),
    date_from: Optional[str] = Query(None, description="YYYY-MM-DD"),
    date_to: Optional[str] = Query(None, description="YYYY-MM-DD"),
    page: int = Query(1, ge=1),
    per_page: int = Query(25, ge=1, le=200),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    audit_service.ensure_table()
    q = _apply_filters(
        db.query(IntegrationAuditLog),
        channel=channel, status_=status, action=action, user_id=user_id,
        search=search, date_from=date_from, date_to=date_to,
    )
    try:
        total = q.count()
        rows = (
            q.order_by(IntegrationAuditLog.id.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
    except Exception as e:
        # Table not yet present (e.g. no CREATE privilege) — return an empty,
        # non-fatal result so the admin page renders instead of 500-ing.
        logger.warning("Audit log query failed: %s", e)
        db.rollback()
        return {"items": [], "total": 0, "page": page, "per_page": per_page, "pages": 0}
    return {
        "items": [_serialize(r) for r in rows],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.get("/summary", summary="Audit log counts by channel and status")
def summary(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    audit_service.ensure_table()
    base = _apply_filters(
        db.query(IntegrationAuditLog),
        channel=None, status_=None, action=None, user_id=None,
        search=None, date_from=date_from, date_to=date_to,
    )
    try:
        by_channel = dict(
            base.with_entities(IntegrationAuditLog.channel, func.count()).group_by(IntegrationAuditLog.channel).all()
        )
        by_status = dict(
            base.with_entities(IntegrationAuditLog.status, func.count()).group_by(IntegrationAuditLog.status).all()
        )
        total = int(base.count())
    except Exception as e:
        logger.warning("Audit summary query failed: %s", e)
        db.rollback()
        by_channel, by_status, total = {}, {}, 0
    return {
        "channels": audit_service.CHANNELS,
        "by_channel": {k: int(v) for k, v in by_channel.items()},
        "by_status": {k: int(v) for k, v in by_status.items()},
        "total": total,
    }


@router.get("/logs/export", summary="Export audit logs (CSV or JSON) for reconciliation")
def export_logs(
    format: str = Query("csv", pattern="^(csv|json)$"),
    channel: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(50000, ge=1, le=200000),
    current_user: User = Depends(is_superadmin),
    db: Session = Depends(get_db),
):
    audit_service.ensure_table()
    q = _apply_filters(
        db.query(IntegrationAuditLog),
        channel=channel, status_=status, action=action, user_id=user_id,
        search=search, date_from=date_from, date_to=date_to,
    ).order_by(IntegrationAuditLog.id.desc()).limit(limit)
    try:
        rows = q.all()
    except Exception as e:
        logger.warning("Audit export query failed: %s", e)
        db.rollback()
        rows = []
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if format == "json":
        payload = json.dumps([_serialize(r) for r in rows], indent=2, default=str)
        return StreamingResponse(
            iter([payload]),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="vasupay_audit_{stamp}.json"'},
        )

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(_EXPORT_COLUMNS)
    for r in rows:
        data = _serialize(r)
        writer.writerow([data.get(c, "") for c in _EXPORT_COLUMNS])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="vasupay_audit_{stamp}.csv"'},
    )
