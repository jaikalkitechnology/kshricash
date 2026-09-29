"""
VasuPay - KYC Routes
Entity self-KYC submission via file uploads.
All entity types can submit their own KYC documents using the UserKYC model.
Approval is handled by parent entities via /entity/kyc/* endpoints,
or by superadmin via /admin/kyc/* endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path
import logging
import uuid
import os

from app.database import get_db
from app.api.dependencies import get_current_active_user
from app.models_complete import User, UserKYC, KYCStatus, KYCDocumentType, get_india_time
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/kyc", tags=["KYC"])

# =====================================================
# FILE UPLOAD HELPERS
# =====================================================

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def _get_upload_dir(user_id: int) -> Path:
    """Get the upload directory for a user's KYC documents."""
    upload_dir = Path(settings.UPLOAD_DIR) / "kyc" / str(user_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def _validate_file(file: UploadFile) -> None:
    """Validate file type and size."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="File has no filename")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '.{ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )


async def _save_file(file: UploadFile, user_id: int, doc_type: str) -> str:
    """Save uploaded file and return the stored path."""
    _validate_file(file)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    filename = f"{doc_type}_{uuid.uuid4().hex[:8]}.{ext}"

    upload_dir = _get_upload_dir(user_id)
    file_path = upload_dir / filename

    with open(file_path, "wb") as f:
        f.write(content)

    # Return relative path for DB storage
    return f"kyc/{user_id}/{filename}"


def _enum_val(obj, attr):
    val = getattr(obj, attr, None)
    if val is None:
        return None
    return val.value if hasattr(val, 'value') else str(val)


def _kyc_to_dict(kyc: UserKYC) -> dict:
    """Serialize a UserKYC record to dict."""
    return {
        "id": kyc.id,
        "user_id": kyc.user_id,
        "status": _enum_val(kyc, 'status'),
        "verification_level": kyc.verification_level,
        # Primary docs
        "aadhaar_number": kyc.aadhaar_number_masked,
        "aadhaar_front_url": kyc.aadhaar_front_url,
        "aadhaar_back_url": kyc.aadhaar_back_url,
        "pan_number": kyc.pan_number,
        "pan_card_url": kyc.pan_card_url,
        "photo_url": kyc.photo_url,
        "selfie_url": kyc.selfie_url,
        "signature_url": kyc.signature_url,
        # Address proof
        "address_proof_type": _enum_val(kyc, 'address_proof_type'),
        "address_proof_url": kyc.address_proof_url,
        "address_proof_number": kyc.address_proof_number,
        # Business docs
        "gst_certificate_url": kyc.gst_certificate_url,
        "shop_act_url": kyc.shop_act_url,
        "trade_license_url": kyc.trade_license_url,
        "cancelled_cheque_url": kyc.cancelled_cheque_url,
        "bank_statement_url": kyc.bank_statement_url,
        "rental_agreement_url": kyc.rental_agreement_url,
        "electricity_bill_url": kyc.electricity_bill_url,
        # General document
        "document_type": _enum_val(kyc, 'document_type'),
        "document_number": kyc.document_number,
        "document_front_url": kyc.document_front_url,
        "document_back_url": kyc.document_back_url,
        # Meta
        "rejection_reason": kyc.rejection_reason,
        "rejection_category": kyc.rejection_category,
        "resubmission_count": kyc.resubmission_count,
        "verified_at": str(kyc.verified_at) if kyc.verified_at else None,
        "verified_by": kyc.verified_by,
        "verification_notes": kyc.verification_notes,
        "submitted_at": str(kyc.created_at) if kyc.created_at else None,
        "updated_at": str(kyc.updated_at) if kyc.updated_at else None,
    }


# =====================================================
# SERVE UPLOADED FILES
# =====================================================

@router.get("/files/{user_id}/{filename}", summary="Serve KYC document file")
def serve_kyc_file(
    user_id: int,
    filename: str,
    current_user: User = Depends(get_current_active_user),
):
    """Serve a KYC document file. Only accessible by the owner or their parent hierarchy."""
    file_path = Path(settings.UPLOAD_DIR) / "kyc" / str(user_id) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Security: only owner or superadmin can access
    if current_user.id != user_id:
        entity_type = _enum_val(current_user, 'entity_type')
        if entity_type != "superadmin":
            # Check if user_id is in hierarchy (import here to avoid circular)
            from app.crud.entity import get_all_descendant_ids
            from app.database import SessionLocal
            db = SessionLocal()
            try:
                descendants = get_all_descendant_ids(db, current_user.id)
                if user_id not in descendants:
                    raise HTTPException(status_code=403, detail="Not authorized to view this file")
            finally:
                db.close()

    return FileResponse(str(file_path))


# =====================================================
# GET KYC STATUS
# =====================================================

@router.get("/status", summary="Get my KYC status and documents")
def get_kyc_status(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get the current KYC verification status for the authenticated user.
    """
    user_kyc_status = _enum_val(current_user, 'kyc_status') or "not_submitted"

    kyc = db.query(UserKYC).filter(UserKYC.user_id == current_user.id).first()

    if not kyc:
        return {
            "kyc_status": user_kyc_status,
            "kyc_submitted": False,
            "kyc": None,
        }

    return {
        "kyc_status": user_kyc_status,
        "kyc_submitted": True,
        "kyc": _kyc_to_dict(kyc),
    }


# =====================================================
# SUBMIT KYC (file upload based)
# =====================================================

@router.post("/submit", status_code=status.HTTP_201_CREATED, summary="Submit KYC documents with file uploads")
async def submit_kyc(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    # Text fields
    aadhaar_number: Optional[str] = Form(None),
    pan_number: Optional[str] = Form(None),
    address_proof_type: Optional[str] = Form(None),
    address_proof_number: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    document_number: Optional[str] = Form(None),
    # File uploads
    aadhaar_front: Optional[UploadFile] = File(None),
    aadhaar_back: Optional[UploadFile] = File(None),
    pan_card: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None),
    selfie: Optional[UploadFile] = File(None),
    signature: Optional[UploadFile] = File(None),
    address_proof: Optional[UploadFile] = File(None),
    gst_certificate: Optional[UploadFile] = File(None),
    shop_act: Optional[UploadFile] = File(None),
    trade_license: Optional[UploadFile] = File(None),
    cancelled_cheque: Optional[UploadFile] = File(None),
    bank_statement: Optional[UploadFile] = File(None),
    rental_agreement: Optional[UploadFile] = File(None),
    electricity_bill: Optional[UploadFile] = File(None),
    document_front: Optional[UploadFile] = File(None),
    document_back: Optional[UploadFile] = File(None),
):
    """Submit KYC documents for verification. Upload files + text fields via multipart/form-data."""

    # Check if KYC already exists
    existing = db.query(UserKYC).filter(UserKYC.user_id == current_user.id).first()
    if existing:
        existing_status = _enum_val(existing, 'status')
        if existing_status == "verified":
            raise HTTPException(status_code=400, detail="Your KYC is already verified")
        raise HTTPException(status_code=400, detail="KYC already submitted. Use PATCH /kyc/resubmit to update.")

    # Must provide at least one identity document
    has_aadhaar = bool(aadhaar_number or (aadhaar_front and aadhaar_front.filename))
    has_pan = bool(pan_number or (pan_card and pan_card.filename))
    has_doc = bool(document_number or (document_front and document_front.filename))
    if not (has_aadhaar or has_pan or has_doc):
        raise HTTPException(status_code=400, detail="Please provide at least Aadhaar, PAN, or other identity document")

    user_id = current_user.id

    # Save uploaded files
    aadhaar_front_path = await _save_file(aadhaar_front, user_id, "aadhaar_front") if aadhaar_front and aadhaar_front.filename else None
    aadhaar_back_path = await _save_file(aadhaar_back, user_id, "aadhaar_back") if aadhaar_back and aadhaar_back.filename else None
    pan_card_path = await _save_file(pan_card, user_id, "pan_card") if pan_card and pan_card.filename else None
    photo_path = await _save_file(photo, user_id, "photo") if photo and photo.filename else None
    selfie_path = await _save_file(selfie, user_id, "selfie") if selfie and selfie.filename else None
    signature_path = await _save_file(signature, user_id, "signature") if signature and signature.filename else None
    address_proof_path = await _save_file(address_proof, user_id, "address_proof") if address_proof and address_proof.filename else None
    gst_path = await _save_file(gst_certificate, user_id, "gst_certificate") if gst_certificate and gst_certificate.filename else None
    shop_act_path = await _save_file(shop_act, user_id, "shop_act") if shop_act and shop_act.filename else None
    trade_license_path = await _save_file(trade_license, user_id, "trade_license") if trade_license and trade_license.filename else None
    cancelled_cheque_path = await _save_file(cancelled_cheque, user_id, "cancelled_cheque") if cancelled_cheque and cancelled_cheque.filename else None
    bank_statement_path = await _save_file(bank_statement, user_id, "bank_statement") if bank_statement and bank_statement.filename else None
    rental_agreement_path = await _save_file(rental_agreement, user_id, "rental_agreement") if rental_agreement and rental_agreement.filename else None
    electricity_bill_path = await _save_file(electricity_bill, user_id, "electricity_bill") if electricity_bill and electricity_bill.filename else None
    document_front_path = await _save_file(document_front, user_id, "document_front") if document_front and document_front.filename else None
    document_back_path = await _save_file(document_back, user_id, "document_back") if document_back and document_back.filename else None

    # Resolve enum fields
    address_proof_enum = None
    if address_proof_type:
        try:
            address_proof_enum = KYCDocumentType(address_proof_type)
        except ValueError:
            pass

    doc_type_enum = None
    if document_type:
        try:
            doc_type_enum = KYCDocumentType(document_type)
        except ValueError:
            pass

    client_ip = request.client.host if request.client else None

    kyc = UserKYC(
        user_id=user_id,
        aadhaar_number_masked=aadhaar_number,
        aadhaar_front_url=aadhaar_front_path,
        aadhaar_back_url=aadhaar_back_path,
        pan_number=pan_number,
        pan_card_url=pan_card_path,
        photo_url=photo_path,
        selfie_url=selfie_path,
        signature_url=signature_path,
        address_proof_type=address_proof_enum,
        address_proof_url=address_proof_path,
        address_proof_number=address_proof_number,
        gst_certificate_url=gst_path,
        shop_act_url=shop_act_path,
        trade_license_url=trade_license_path,
        cancelled_cheque_url=cancelled_cheque_path,
        bank_statement_url=bank_statement_path,
        rental_agreement_url=rental_agreement_path,
        electricity_bill_url=electricity_bill_path,
        document_type=doc_type_enum,
        document_number=document_number,
        document_front_url=document_front_path,
        document_back_url=document_back_path,
        status=KYCStatus.PENDING,
        verification_level="BASIC",
        submission_ip=client_ip,
        created_by=user_id,
    )
    db.add(kyc)
    current_user.kyc_status = KYCStatus.PENDING
    db.commit()
    db.refresh(kyc)

    logger.info(f"KYC submitted by user {user_id} (entity_type={_enum_val(current_user, 'entity_type')})")

    return {
        "message": "KYC documents submitted successfully. Pending approval.",
        "kyc_id": kyc.id,
        "status": "pending",
    }


# =====================================================
# RESUBMIT / UPDATE KYC (file upload based)
# =====================================================

@router.patch("/resubmit", summary="Update/resubmit KYC documents with file uploads")
async def resubmit_kyc(
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    # Text fields
    aadhaar_number: Optional[str] = Form(None),
    pan_number: Optional[str] = Form(None),
    address_proof_type: Optional[str] = Form(None),
    address_proof_number: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    document_number: Optional[str] = Form(None),
    # File uploads
    aadhaar_front: Optional[UploadFile] = File(None),
    aadhaar_back: Optional[UploadFile] = File(None),
    pan_card: Optional[UploadFile] = File(None),
    photo: Optional[UploadFile] = File(None),
    selfie: Optional[UploadFile] = File(None),
    signature: Optional[UploadFile] = File(None),
    address_proof: Optional[UploadFile] = File(None),
    gst_certificate: Optional[UploadFile] = File(None),
    shop_act: Optional[UploadFile] = File(None),
    trade_license: Optional[UploadFile] = File(None),
    cancelled_cheque: Optional[UploadFile] = File(None),
    bank_statement: Optional[UploadFile] = File(None),
    rental_agreement: Optional[UploadFile] = File(None),
    electricity_bill: Optional[UploadFile] = File(None),
    document_front: Optional[UploadFile] = File(None),
    document_back: Optional[UploadFile] = File(None),
):
    """Update/resubmit KYC documents after rejection."""

    kyc = db.query(UserKYC).filter(UserKYC.user_id == current_user.id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="No KYC submission found. Use POST /kyc/submit first.")

    kyc_stat = _enum_val(kyc, 'status')
    if kyc_stat == "verified":
        raise HTTPException(status_code=400, detail="Your KYC is already verified and cannot be modified.")

    user_id = current_user.id
    updated = False

    # Save new files and update fields
    file_fields = [
        (aadhaar_front, "aadhaar_front", "aadhaar_front_url"),
        (aadhaar_back, "aadhaar_back", "aadhaar_back_url"),
        (pan_card, "pan_card", "pan_card_url"),
        (photo, "photo", "photo_url"),
        (selfie, "selfie", "selfie_url"),
        (signature, "signature", "signature_url"),
        (address_proof, "address_proof", "address_proof_url"),
        (gst_certificate, "gst_certificate", "gst_certificate_url"),
        (shop_act, "shop_act", "shop_act_url"),
        (trade_license, "trade_license", "trade_license_url"),
        (cancelled_cheque, "cancelled_cheque", "cancelled_cheque_url"),
        (bank_statement, "bank_statement", "bank_statement_url"),
        (rental_agreement, "rental_agreement", "rental_agreement_url"),
        (electricity_bill, "electricity_bill", "electricity_bill_url"),
        (document_front, "document_front", "document_front_url"),
        (document_back, "document_back", "document_back_url"),
    ]

    for file_obj, doc_label, model_field in file_fields:
        if file_obj and file_obj.filename:
            path = await _save_file(file_obj, user_id, doc_label)
            setattr(kyc, model_field, path)
            updated = True

    # Text fields
    if aadhaar_number is not None:
        kyc.aadhaar_number_masked = aadhaar_number
        updated = True
    if pan_number is not None:
        kyc.pan_number = pan_number
        updated = True
    if address_proof_number is not None:
        kyc.address_proof_number = address_proof_number
        updated = True
    if document_number is not None:
        kyc.document_number = document_number
        updated = True

    # Enum fields
    if address_proof_type:
        try:
            kyc.address_proof_type = KYCDocumentType(address_proof_type)
            updated = True
        except ValueError:
            pass
    if document_type:
        try:
            kyc.document_type = KYCDocumentType(document_type)
            updated = True
        except ValueError:
            pass

    if not updated:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Reset status
    if kyc_stat == "rejected":
        kyc.status = KYCStatus.RESUBMITTED
        kyc.resubmission_count = (kyc.resubmission_count or 0) + 1
        kyc.resubmitted_at = get_india_time()
    else:
        kyc.status = KYCStatus.PENDING

    kyc.updated_by = user_id
    kyc.submission_ip = request.client.host if request.client else None
    current_user.kyc_status = KYCStatus.PENDING

    db.commit()
    db.refresh(kyc)

    return {
        "message": "KYC documents updated successfully. Pending re-approval.",
        "kyc_id": kyc.id,
        "status": _enum_val(kyc, 'status'),
        "resubmission_count": kyc.resubmission_count,
    }
