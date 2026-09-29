from app.database import get_db_context
from app.models_complete import User, EntityType
from app.core.security import get_password_hash

with get_db_context() as db:
    superadmin = User(
        entity_type=EntityType.SUPERADMIN,
        full_name="Super Admin",
        phone="9999999999",
        email="admin@vasupay.com",
        password_hash=get_password_hash("SecurePassword123!"),
        is_active=True,
        status="active"
    )
    db.add(superadmin)
    db.commit()
    print("✅ Superadmin created successfully!")