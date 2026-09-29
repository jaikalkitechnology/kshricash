"""
VasuPay - BBPS Schemas
Request/response models for the Airtel Payments Bank / Bharat Connect BBPS API.
These also serve as the OpenAPI documentation (/docs).
"""

from typing import Optional, Any, Dict
from pydantic import BaseModel, Field


class AgentRegisterRequest(BaseModel):
    mobile_number: str = Field(..., examples=["9876543210"])
    pan: str = Field(..., examples=["ABCDE1234Z"])
    dob: str = Field(..., description="dd/mm/yyyy", examples=["15/08/1990"])
    agent_name: str = Field(..., examples=["Test Agent"])
    agent_shop_name: str = Field(..., examples=["Test Shop Enterprises"])
    address_line1: str = Field(..., examples=["123 Main Street"])
    address_line2: Optional[str] = Field(default=None, examples=["Shop No 4B"])
    state: str = Field(..., examples=["Maharashtra"])
    city: str = Field(..., examples=["Mumbai"])
    pin_code: int = Field(..., examples=[400001])
    latitude: Optional[str] = Field(default=None, examples=["19.0760"])
    longitude: Optional[str] = Field(default=None, examples=["72.8777"])


class AgentInquiryRequest(BaseModel):
    mobile_number: str = Field(..., examples=["9876543210"])


class CCFRequest(BaseModel):
    biller_id: str = Field(..., examples=["OU1200000NATDH"])
    payment_amount: str = Field(..., examples=["200.0"])


class BillFetchRequest(BaseModel):
    biller_id: str = Field(..., examples=["OU1200000NATDH"])
    # Dynamic input parameters declared by the biller config (reference1..reference5).
    references: Dict[str, str] = Field(default_factory=dict, examples=[{"reference1": "1234567890"}])
    mobile_number: str = Field(..., examples=["9876543210"])
    customer_name: Optional[str] = Field(default=None, examples=["Test Customer"])


class BillValidateRequest(BillFetchRequest):
    pass


class BillPaymentRequest(BaseModel):
    # Present for fetchAndPay/validateAndPay billers; omitted for direct recharge.
    bbpou_ref_id: Optional[str] = Field(default=None, description="Reference returned by bill-fetch/validate")
    biller_id: str = Field(..., examples=["OU1200000NATDH"])
    references: Dict[str, str] = Field(default_factory=dict, examples=[{"reference1": "1234567890"}])
    payment_amount: str = Field(..., examples=["200.0"])
    mobile_number: str = Field(..., examples=["9876543210"])
    customer_name: Optional[str] = Field(default=None, examples=["Test Customer"])
    payment_mode: str = Field(default="WALLET", examples=["WALLET"])
    payment_mode_info: Optional[str] = Field(default=None, examples=["VasuPayWallet|9876543210"])
    from_wallet: bool = Field(default=True, description="Debit the VasuPay wallet for this payment")
    service: Optional[str] = Field(default=None, description="Service label for history, e.g. 'Mobile Prepaid'")
    notify_sms: bool = Field(default=False, description="Send an SMS confirmation on success/initiated")
    notify_mobile: Optional[str] = Field(default=None, description="Mobile number to notify (defaults to mobile_number)")


class BillInquiryRequest(BaseModel):
    bbpou_ref_id: str = Field(..., description="Reference returned by bill-payment")


class BBPSResponse(BaseModel):
    """Generic decrypted BBPS provider response (meta + data passthrough)."""
    meta: Optional[Dict[str, Any]] = None
    data: Optional[Any] = None
    errors: Optional[Any] = None
