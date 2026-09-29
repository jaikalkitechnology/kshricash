"""
VasuPay - BBPS Service (Airtel Payments Bank / Bharat Connect)
================================================================
Ports the validated UAT suite (bbps_api_docs/bbps_suit_v2.py) into a
reusable backend client.

Encryption (matches Airtel Java EncryptionUtil exactly):
  - Request body : AES/GCM/NoPadding, 256-bit key, 16-byte IV, 128-bit tag
  - Tracking-Id1 : RSA-OAEP-SHA256( Base64(AES_KEY).getBytes('UTF-8') )
  - Tracking-Id2 : RSA-OAEP-SHA256( Base64(IV).getBytes('UTF-8') )
  - Authorization: Base64( HMAC-SHA256-hex( minified_body, secret_key ) )
  - Response     : decrypted with the same AES key + IV sent in the request

Reference: bbps_api_docs/APBL-BBPS-AI-Open-Banking-API_v1.0.html
"""

from __future__ import annotations

import os
import json
import hmac
import time
import base64
import hashlib
import logging
import uuid
from typing import Any, Dict, Optional

from app.config import settings

logger = logging.getLogger(__name__)

# Runtime-configurable BBPS API version (system_configs key).
BBPS_VERSION_CONFIG_KEY = "bbps_api_version"
BBPS_SUPPORTED_VERSIONS = ("v1", "v2")


def normalize_bbps_version(value: Optional[str]) -> str:
    """Coerce any input to a supported version string ('v1' or 'v2')."""
    v = str(value or "").strip().lower()
    if not v.startswith("v"):
        v = "v" + v
    return v if v in BBPS_SUPPORTED_VERSIONS else "v2"


def get_bbps_api_version(db=None) -> str:
    """Currently-selected BBPS API version.

    Reads the admin override from system_configs; falls back to the config
    default. Resilient to a missing table / DB error (returns the default).
    """
    default = normalize_bbps_version(settings.BBPS_API_VERSION)
    if db is None:
        return default
    try:
        from app.models_complete import SystemConfig
        row = (
            db.query(SystemConfig)
            .filter(SystemConfig.config_key == BBPS_VERSION_CONFIG_KEY)
            .order_by(SystemConfig.id.desc())
            .first()
        )
        if row and row.config_value:
            val = row.config_value
            if isinstance(val, dict):
                val = val.get("version") or val.get("value")
            return normalize_bbps_version(val)
    except Exception as e:  # pragma: no cover - config store variance must not break BBPS
        logger.warning("Could not read BBPS version config: %s", e)
    return default


def set_bbps_api_version(db, version: str, user_id: Optional[int] = None) -> str:
    """Persist the admin-selected BBPS API version. Returns the normalized value."""
    ver = normalize_bbps_version(version)
    from app.models_complete import SystemConfig
    row = (
        db.query(SystemConfig)
        .filter(SystemConfig.config_key == BBPS_VERSION_CONFIG_KEY)
        .order_by(SystemConfig.id.desc())
        .first()
    )
    if row is None:
        row = SystemConfig(
            config_key=BBPS_VERSION_CONFIG_KEY,
            config_value={"version": ver},
            config_type="STRING",
            category="PAYMENT",
            description="Active Airtel BBPS API version for versioned endpoints.",
            scope="GLOBAL",
        )
        db.add(row)
    else:
        row.previous_value = row.config_value
        row.config_value = {"version": ver}
        if user_id is not None:
            row.changed_by = user_id
    db.commit()
    return ver


class BBPSError(Exception):
    """Raised when the BBPS provider call fails or the client is misconfigured."""

    def __init__(self, message: str, *, code: Optional[str] = None, http_status: Optional[int] = None,
                 request_body: Optional[dict] = None, endpoint: Optional[str] = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.http_status = http_status
        # Request context, so callers can audit the failed request too.
        self.request_body = request_body
        self.endpoint = endpoint


# Bharat Connect (BBPS) categories surfaced in dashboards as "services".
# Full NPCI category list. `id` maps to the Airtel biller-category id.
BBPS_SERVICE_CATALOG = [
    {"id": "AGENTCOLLECTION", "name": "Agent Collection", "icon": "Users", "group": "Finance"},
    {"id": "BROADBAND", "name": "Broadband Postpaid", "icon": "Wifi", "group": "Telecom"},
    {"id": "CABLETV", "name": "Cable TV", "icon": "Tv", "group": "Telecom"},
    {"id": "CLUBSASSOCIATIONS", "name": "Clubs and Associations", "icon": "Users", "group": "Lifestyle"},
    {"id": "CREDITCARD", "name": "Credit Card", "icon": "CreditCard", "group": "Finance"},
    {"id": "DONATION", "name": "Donation", "icon": "HeartHandshake", "group": "Lifestyle"},
    {"id": "DTH", "name": "DTH", "icon": "Tv", "group": "Telecom"},
    {"id": "ECHALLAN", "name": "eChallan", "icon": "ReceiptText", "group": "Government"},
    {"id": "EDUCATION", "name": "Education Fees", "icon": "GraduationCap", "group": "Education"},
    {"id": "ELECTRICITY", "name": "Electricity", "icon": "Lightbulb", "group": "Utilities"},
    {"id": "EVRECHARGE", "name": "EV Recharge", "icon": "Zap", "group": "Transport"},
    {"id": "FASTAG", "name": "Fastag", "icon": "Car", "group": "Transport"},
    {"id": "FLEETCARDRECHARGE", "name": "Fleet Card Recharge", "icon": "Truck", "group": "Transport"},
    {"id": "GAS", "name": "Gas", "icon": "Flame", "group": "Utilities"},
    {"id": "HOUSINGSOCIETY", "name": "Housing Society", "icon": "Building2", "group": "Utilities"},
    {"id": "INSURANCE", "name": "Insurance", "icon": "ShieldCheck", "group": "Finance"},
    {"id": "LANDLINE", "name": "Landline Postpaid", "icon": "Phone", "group": "Telecom"},
    {"id": "LOANREPAYMENT", "name": "Loan Repayment", "icon": "Banknote", "group": "Finance"},
    {"id": "LPG", "name": "LPG Gas", "icon": "Flame", "group": "Utilities"},
    {"id": "POSTPAID", "name": "Mobile Postpaid", "icon": "Smartphone", "group": "Telecom"},
    {"id": "MOBILEPREPAID", "name": "Mobile Prepaid", "icon": "Smartphone", "group": "Telecom"},
    {"id": "MUNICIPALSERVICES", "name": "Municipal Services", "icon": "Landmark", "group": "Government"},
    {"id": "MUNICIPALTAXES", "name": "Municipal Taxes", "icon": "Landmark", "group": "Government"},
    {"id": "NPS", "name": "National Pension System", "icon": "PiggyBank", "group": "Finance"},
    {"id": "NCMC", "name": "NCMC Recharge", "icon": "CreditCard", "group": "Transport"},
    {"id": "PREPAIDMETER", "name": "Prepaid Meter", "icon": "Gauge", "group": "Utilities"},
    {"id": "RENTAL", "name": "Rental", "icon": "Home", "group": "Lifestyle"},
    {"id": "SUBSCRIPTION", "name": "Subscription", "icon": "Repeat", "group": "Lifestyle"},
    {"id": "WATER", "name": "Water", "icon": "Droplet", "group": "Utilities"},
]


class BBPSClient:
    """Encrypted client for the Airtel Payments Bank BBPS / Bharat Connect API."""

    def __init__(self) -> None:
        self.base_url = settings.BBPS_BASE_URL.rstrip("/")
        # Independent base for v2 endpoints (bill-fetch / bill-payment-inquiry).
        self.base_v2 = settings.BBPS_BASE_URL_V2.rstrip("/")
        # Default API version for versioned endpoints; admin can override at runtime.
        self.default_version = normalize_bbps_version(settings.BBPS_API_VERSION)
        self.partner_id = settings.BBPS_PARTNER_ID
        self.x_key_id = settings.BBPS_X_KEY_ID
        self.secret_key = settings.BBPS_SECRET_KEY
        self.channel = settings.BBPS_CHANNEL
        self.device_details = settings.BBPS_DEVICE_DETAILS
        self.timeout = settings.BBPS_TIMEOUT_SECONDS
        self._public_key_pem = settings.BBPS_BANK_PUBLIC_KEY.encode()
        self._pub_key = None  # lazily loaded

    # ----- lazy crypto deps (kept out of import path so the app boots
    #       even if `cryptography`/`requests` are not yet installed) -----
    def _load_pub_key(self):
        if self._pub_key is None:
            from cryptography.hazmat.primitives import serialization

            self._pub_key = serialization.load_pem_public_key(self._public_key_pem)
        return self._pub_key

    # ----- encryption primitives (1:1 with bbps_suit_v2.py) -----
    @staticmethod
    def _gen_aes():
        k = os.urandom(32)
        v = os.urandom(16)
        return base64.b64encode(k).decode(), base64.b64encode(v).decode()

    @staticmethod
    def _aes_gcm_encrypt(plaintext: str, key_b64: str, iv_b64: str) -> str:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        aesgcm = AESGCM(base64.b64decode(key_b64))
        enc = aesgcm.encrypt(base64.b64decode(iv_b64), plaintext.encode(), None)
        return base64.b64encode(enc).decode()

    @staticmethod
    def _aes_gcm_decrypt(enc_b64: str, key_b64: str, iv_b64: str) -> dict:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        aesgcm = AESGCM(base64.b64decode(key_b64))
        dec = aesgcm.decrypt(base64.b64decode(iv_b64), base64.b64decode(enc_b64), None)
        return json.loads(dec.decode())

    def _rsa_encrypt(self, b64_string: str) -> str:
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import padding as apadding

        enc = self._load_pub_key().encrypt(
            b64_string.encode("utf-8"),
            apadding.OAEP(mgf=apadding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None),
        )
        return base64.b64encode(enc).decode()

    def _authorization(self, body_dict: dict) -> str:
        minified = json.dumps(body_dict, separators=(",", ":"))
        hex_sig = hmac.new(self.secret_key.encode(), minified.encode(), hashlib.sha256).hexdigest()
        return base64.b64encode(hex_sig.encode()).decode()

    def _build_request(self, body_dict: dict):
        key_b64, iv_b64 = self._gen_aes()
        minified = json.dumps(body_dict, separators=(",", ":"))
        enc_body = self._aes_gcm_encrypt(minified, key_b64, iv_b64)
        headers = {
            "Content-Type": "application/json",
            "X-Client-Id": self.partner_id,
            "X-Key-Id": self.x_key_id,
            "X-Request-Id": str(uuid.uuid4()),
            "Authorization": self._authorization(body_dict),
            "Tracking-Id1": self._rsa_encrypt(key_b64),
            "Tracking-Id2": self._rsa_encrypt(iv_b64),
        }
        return headers, {"data": enc_body}, key_b64, iv_b64

    def _post(self, endpoint: str, body: dict, base: Optional[str] = None) -> Dict[str, Any]:
        """Encrypt + POST + decrypt. Returns the decrypted provider response."""
        try:
            import requests
        except ImportError as e:  # pragma: no cover
            raise BBPSError("BBPS dependency 'requests' is not installed") from e

        headers, send_body, key_b64, iv_b64 = self._build_request(body)
        url = (base or self.base_url) + endpoint
        t0 = time.time()
        try:
            r = requests.post(url, headers=headers, json=send_body, timeout=self.timeout)
        except Exception as e:
            logger.error("BBPS request failed (%s): %s", endpoint, e)
            raise BBPSError(f"Could not reach BBPS provider: {e}",
                            request_body=body, endpoint=url) from e

        elapsed = round((time.time() - t0) * 1000)
        try:
            raw = r.json()
        except ValueError:
            raise BBPSError(f"Non-JSON response from BBPS (HTTP {r.status_code})",
                            http_status=r.status_code, request_body=body, endpoint=url)

        # Decrypt if the body is encrypted
        if isinstance(raw.get("data"), str) and raw.get("meta") is None:
            try:
                decrypted = self._aes_gcm_decrypt(raw["data"], key_b64, iv_b64)
            except Exception as e:
                raise BBPSError(f"Failed to decrypt BBPS response: {e}",
                                http_status=r.status_code, request_body=body, endpoint=url)
        else:
            decrypted = raw

        meta = decrypted.get("meta", {}) if isinstance(decrypted, dict) else {}
        logger.info(
            "BBPS %s -> HTTP %s status=%s code=%s (%sms)",
            endpoint, r.status_code, meta.get("status"), meta.get("code"), elapsed,
        )
        decrypted["_elapsed_ms"] = elapsed
        decrypted["_http_status"] = r.status_code
        # Attach request context so the API layer can audit request + response.
        decrypted["_request"] = body
        decrypted["_endpoint"] = url
        return decrypted

    # ----- operations (mirror the UAT suite) -----
    def register_agent(self, payload: dict) -> dict:
        body = {"requestId": str(uuid.uuid4()), **payload}
        return self._post("/register-agent", body)

    def agent_inquiry(self, mobile_number: str) -> dict:
        return self._post("/agent-registration-inquiry", {
            "requestId": str(uuid.uuid4()),
            "mobileNumber": mobile_number,
        })

    def biller_categories(self) -> dict:
        return self._post("/biller-categories-fetch", {"requestId": str(uuid.uuid4())})

    def biller_configs(self, category_id: str) -> dict:
        return self._post("/biller-configs-fetch", {
            "requestId": str(uuid.uuid4()),
            "billerCategoryId": category_id,
        })

    def ccf_fetch(self, biller_id: str, payment_amount: str) -> dict:
        return self._post("/ccf-fetch", {
            "requestId": str(uuid.uuid4()),
            "billerId": biller_id,
            "bbpsChannel": self.channel,
            "paymentAmount": str(payment_amount),
        })

    @staticmethod
    def _clean_refs(references: Optional[dict]) -> dict:
        """Keep only non-empty reference1..reference5 keys."""
        refs = references or {}
        return {k: str(v) for k, v in refs.items() if v not in (None, "")}

    def _resolve_version(self, version: Optional[str]) -> str:
        return normalize_bbps_version(version) if version else self.default_version

    def _base_for(self, version: str) -> str:
        """Provider base URL for the given API version ('v1' or 'v2')."""
        return self.base_v2 if version == "v2" else self.base_url

    def bill_fetch(self, biller_id: str, references: dict, mobile_number: str,
                   customer_name: Optional[str] = None, payment_mode: str = "WALLET",
                   walk_in_customer_id: Optional[str] = None,
                   version: Optional[str] = None) -> dict:
        # bill-fetch (POST {base}/bill-fetch). v2 additionally sends paymentMode,
        # customerConsent and walkInCustomerId; encryption/headers identical to v1.
        ver = self._resolve_version(version)
        body = {
            "requestId": str(uuid.uuid4()),
            "billerId": biller_id,
            **self._clean_refs(references),
            "deviceDetails": self.device_details,
            "bbpsChannel": self.channel,
            "mobileNumber": mobile_number,
        }
        if ver == "v2":
            body["customerConsent"] = "Y"
            body["paymentMode"] = payment_mode
            if walk_in_customer_id:
                body["walkInCustomerId"] = walk_in_customer_id
        if customer_name:
            body["customerName"] = customer_name
        return self._post("/bill-fetch", body, base=self._base_for(ver))

    def bill_validation(self, biller_id: str, references: dict, mobile_number: str,
                        customer_name: Optional[str] = None) -> dict:
        body = {
            "requestId": str(uuid.uuid4()),
            "billerId": biller_id,
            **self._clean_refs(references),
            "deviceDetails": self.device_details,
            "bbpsChannel": self.channel,
            "mobileNumber": mobile_number,
        }
        if customer_name:
            body["customerName"] = customer_name
        return self._post("/bill-validation", body)

    def bill_payment(self, *, biller_id: str, references: dict, payment_amount: str,
                     mobile_number: str, bbpou_ref_id: Optional[str] = None,
                     customer_name: Optional[str] = None, payment_mode: str = "WALLET",
                     payment_mode_info: str = "") -> dict:
        body = {
            "requestId": str(uuid.uuid4()),
            "billerId": biller_id,
            **self._clean_refs(references),
            "billAmount": str(payment_amount),
            "paymentAmount": str(payment_amount),
            "paymentMode": payment_mode,
            "paymentModeInfo": payment_mode_info or f"VasuPayWallet|{mobile_number}",
            "deviceDetails": self.device_details,
            "bbpsChannel": self.channel,
            "mobileNumber": mobile_number,
        }
        if bbpou_ref_id:
            body["bbpouRefId"] = bbpou_ref_id
        if customer_name:
            body["customerName"] = customer_name
        return self._post("/bill-payment", body)

    def bill_payment_inquiry(self, bbpou_ref_id: str, version: Optional[str] = None) -> dict:
        # payment inquiry (POST {base}/bill-payment-inquiry)
        ver = self._resolve_version(version)
        return self._post("/bill-payment-inquiry", {
            "requestId": str(uuid.uuid4()),
            "bbpouRefId": bbpou_ref_id,
        }, base=self._base_for(ver))

    def balance_check(self, version: Optional[str] = None) -> dict:
        """Partner/agent available balance at the provider -> data.availableBalance.
        Introduced in v2; honours the configured version for the base URL."""
        ver = self._resolve_version(version)
        return self._post("/balance-check", {"requestId": str(uuid.uuid4())},
                          base=self._base_for(ver))


# Singleton accessor
_client: Optional[BBPSClient] = None


def get_bbps_client() -> BBPSClient:
    global _client
    if _client is None:
        _client = BBPSClient()
    return _client
