"""
Create the integration_audit_logs table on the configured database.

Use this if the table was not auto-created on startup (e.g. the app process
was not restarted after deploy, or the app DB user could not create it during
the batch create_all). Run from the project root:

    python -m scripts.create_audit_table

It uses the same SQLAlchemy engine/credentials as the app, so it produces the
exact schema the ORM expects. If the app DB user lacks CREATE privilege, hand
scripts/create_audit_table.sql to your DBA instead.
"""

import sys


def main() -> int:
    from app.database import engine
    from app.models_complete import IntegrationAuditLog

    print("Creating table 'integration_audit_logs' (if missing)...")
    IntegrationAuditLog.__table__.create(bind=engine, checkfirst=True)

    # Verify
    from sqlalchemy import inspect
    exists = inspect(engine).has_table("integration_audit_logs")
    print("OK — table exists." if exists else "ERROR — table still missing.")
    return 0 if exists else 1


if __name__ == "__main__":
    sys.exit(main())
