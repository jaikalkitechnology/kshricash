"""
Kshricash - FastAPI Application Entry Point
"""

import logging
import logging.handlers
import os
import time
import uuid

import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import check_database_connection, create_all_tables

# =====================================================
# LOGGING CONFIGURATION
# =====================================================

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format=settings.LOG_FORMAT,
    handlers=[
        logging.StreamHandler(),
        logging.handlers.RotatingFileHandler(
            settings.LOG_FILE or "logs/vasupay.log",
            maxBytes=settings.LOG_FILE_MAX_BYTES,
            backupCount=settings.LOG_FILE_BACKUP_COUNT,
        ),
    ],
)

logger = logging.getLogger(__name__)

# =====================================================
# APPLICATION SETUP
# =====================================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# =====================================================
# MIDDLEWARE
# =====================================================

# CORS: allow all origins.
# NOTE: the browser spec forbids the "*" wildcard together with credentials,
# so we use allow_origin_regex=".*" which reflects each request's Origin back —
# this allows every origin while still permitting credentials.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    """Log request details and timing."""
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    if settings.LOG_REQUESTS:
        logger.info(f"[{request_id}] {request.method} {request.url.path}")

    response = await call_next(request)

    duration = round((time.time() - start_time) * 1000, 2)
    if settings.LOG_REQUESTS:
        logger.info(f"[{request_id}] {response.status_code} ({duration}ms)")

    response.headers["X-Request-ID"] = request_id
    return response


# =====================================================
# EXCEPTION HANDLERS
# =====================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return structured validation errors."""
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a generic error."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred"},
    )


# =====================================================
# ROUTERS
# =====================================================

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
from app.api.v1.entities import router as entities_router
from app.api.v1.bbps import router as bbps_router
from app.api.v1.audit import router as audit_router

app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)
app.include_router(entities_router, prefix=settings.API_PREFIX)
app.include_router(users_router, prefix=settings.API_PREFIX)
app.include_router(kyc_router, prefix=settings.API_PREFIX)
app.include_router(wallets_router, prefix=settings.API_PREFIX)
app.include_router(transactions_router, prefix=settings.API_PREFIX)
app.include_router(settlements_router, prefix=settings.API_PREFIX)
app.include_router(commissions_router, prefix=settings.API_PREFIX)
app.include_router(services_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(webhooks_router, prefix=settings.API_PREFIX)
app.include_router(bbps_router, prefix=settings.API_PREFIX)
app.include_router(audit_router, prefix=settings.API_PREFIX)


# =====================================================
# STARTUP & SHUTDOWN EVENTS
# =====================================================

@app.on_event("startup")
def on_startup():
    """Run on application startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DB_TYPE}://{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")

    # Ensure uploads directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "kyc"), exist_ok=True)

    if check_database_connection():
        logger.info("Database connection verified")
    else:
        logger.warning("Database connection check failed - some features may not work")

    # Ensure the integration audit-log table exists (targeted, best-effort).
    try:
        from app.services import audit_service
        if audit_service.ensure_table():
            logger.info("integration_audit_logs table is ready")
    except Exception as e:
        logger.warning("Could not ensure audit table on startup: %s", e)


@app.on_event("shutdown")
def on_shutdown():
    """Run on application shutdown."""
    logger.info("Shutting down Kshricash API")


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health", tags=["Health"])
def health_check():
    create_all_tables()
    return {"status": "healthy", "version": settings.APP_VERSION}


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower(),
    )
