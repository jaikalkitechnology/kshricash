"""
Kshricash - Database Configuration and Connection Management
"""

from sqlalchemy import create_engine, event, pool, text
from sqlalchemy.orm import sessionmaker, scoped_session, Session
from sqlalchemy.pool import QueuePool
from contextlib import contextmanager
import logging
from typing import Generator

from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =====================================================
# DATABASE ENGINE CONFIGURATION
# =====================================================

def get_database_url() -> str:
    """
    Construct database URL from settings
    """
    if settings.DB_TYPE == "postgresql":
        return f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    elif settings.DB_TYPE == "mysql":
        return f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}?charset=utf8mb4"
    else:
        raise ValueError(f"Unsupported database type: {settings.DB_TYPE}")


# Create database engine with connection pooling
engine = create_engine(
    get_database_url(),
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,  # Verify connections before using
    echo=settings.DB_ECHO,  # Log SQL statements
    echo_pool=settings.DB_ECHO_POOL,  # Log connection pool activity
    future=True,  # Use SQLAlchemy 2.0 style
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

# Create thread-safe scoped session
ScopedSession = scoped_session(SessionLocal)


# =====================================================
# DATABASE EVENTS & LISTENERS
# =====================================================

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """Set SQLite pragmas for better performance"""
    if settings.DB_TYPE == "sqlite":
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()


@event.listens_for(engine, "connect")
def set_mysql_charset(dbapi_conn, connection_record):
    """Set MySQL charset and timezone"""
    if settings.DB_TYPE == "mysql":
        cursor = dbapi_conn.cursor()
        cursor.execute("SET NAMES utf8mb4")
        cursor.execute("SET time_zone = '+05:30'")  # India timezone
        cursor.close()


@event.listens_for(engine, "connect")
def set_postgresql_timezone(dbapi_conn, connection_record):
    """Set PostgreSQL timezone"""
    if settings.DB_TYPE == "postgresql":
        cursor = dbapi_conn.cursor()
        cursor.execute("SET timezone='Asia/Kolkata'")
        cursor.close()


@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log when connection is checked out from pool"""
    if settings.DEBUG:
        logger.debug(f"Connection checked out from pool: {id(dbapi_conn)}")


@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log when connection is returned to pool"""
    if settings.DEBUG:
        logger.debug(f"Connection returned to pool: {id(dbapi_conn)}")


# =====================================================
# SESSION MANAGEMENT
# =====================================================

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions

    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database sessions

    Usage:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {str(e)}")
        raise
    finally:
        db.close()


def get_scoped_session():
    """
    Get thread-safe scoped session

    Usage:
        db = get_scoped_session()
        try:
            user = db.query(User).first()
            db.commit()
        finally:
            db.remove()
    """
    return ScopedSession()


# =====================================================
# DATABASE UTILITIES
# =====================================================

def create_all_tables():
    """
    Create all tables in the database

    WARNING: This should only be used for development
    Use Alembic migrations for production
    """
    from app.models_complete import Base

    logger.info("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("All tables created successfully")


def drop_all_tables():
    """
    Drop all tables in the database

    WARNING: This will delete all data!
    Only use in development/testing
    """
    from app.models_complete import Base

    if settings.ENVIRONMENT == "production":
        raise RuntimeError("Cannot drop tables in production!")

    logger.warning("Dropping all database tables...")
    Base.metadata.drop_all(bind=engine)
    logger.warning("All tables dropped")


def check_database_connection() -> bool:
    """
    Check if database connection is working

    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
        return True
    except Exception as e:
        logger.error(f"❌ Database connection failed: {str(e)}")
        return False


def get_pool_status():
    """
    Get connection pool status for monitoring

    Returns:
        dict: Pool statistics
    """
    pool = engine.pool
    return {
        "size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "total": pool.size() + pool.overflow(),
    }


# =====================================================
# TRANSACTION HELPERS
# =====================================================

class TransactionManager:
    """
    Context manager for manual transaction control

    Usage:
        with TransactionManager() as tm:
            tm.session.add(user)
            tm.session.add(wallet)
            # Auto-commits on success, rollbacks on error
    """

    def __init__(self):
        self.session: Session = SessionLocal()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is not None:
                self.session.rollback()
                logger.error(f"Transaction rolled back: {exc_val}")
            else:
                try:
                    self.session.commit()
                except Exception as e:
                    self.session.rollback()
                    logger.error(f"Commit failed: {str(e)}")
                    raise RuntimeError(f"Commit failed: {str(e)}") from e
        finally:
            self.session.close()

    def commit(self):
        """Manual commit"""
        self.session.commit()

    def rollback(self):
        """Manual rollback"""
        self.session.rollback()


# =====================================================
# QUERY HELPERS
# =====================================================

class DatabaseQueryHelper:
    """Helper methods for common database operations"""

    @staticmethod
    def get_or_create(db: Session, model, defaults=None, **kwargs):
        """
        Get existing record or create new one

        Usage:
            user, created = DatabaseQueryHelper.get_or_create(
                db, User,
                defaults={"full_name": "John Doe"},
                phone="9876543210"
            )
        """
        instance = db.query(model).filter_by(**kwargs).first()
        if instance:
            return instance, False
        else:
            params = dict((k, v) for k, v in kwargs.items())
            params.update(defaults or {})
            instance = model(**params)
            db.add(instance)
            try:
                db.commit()
            except Exception:
                db.rollback()
                instance = db.query(model).filter_by(**kwargs).first()
                if instance:
                    return instance, False
                raise
            return instance, True

    @staticmethod
    def bulk_insert(db: Session, model, data_list: list):
        """
        Bulk insert records for better performance

        Usage:
            DatabaseQueryHelper.bulk_insert(db, User, [
                {"phone": "9876543210", "full_name": "User 1"},
                {"phone": "9876543211", "full_name": "User 2"},
            ])
        """
        try:
            db.bulk_insert_mappings(model, data_list)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Bulk insert failed: {str(e)}")
            raise

    @staticmethod
    def paginate(query, page: int = 1, per_page: int = 20):
        """
        Paginate query results

        Usage:
            query = db.query(User)
            results = DatabaseQueryHelper.paginate(query, page=1, per_page=20)
        """
        total = query.count()
        items = query.limit(per_page).offset((page - 1) * per_page).all()

        return {
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }


# =====================================================
# DATABASE INITIALIZATION
# =====================================================

def init_database():
    """
    Initialize database connection and verify setup
    """
    logger.info("Initializing database...")

    # Check connection
    if not check_database_connection():
        raise RuntimeError("Failed to connect to database")

    # Log pool status
    logger.info(f"Connection pool status: {get_pool_status()}")

    logger.info("Database initialized successfully")


# =====================================================
# ALEMBIC SUPPORT
# =====================================================

def get_engine():
    """Get engine instance for Alembic migrations"""
    return engine


def get_base():
    """Get Base instance for Alembic migrations"""
    from app.models_complete import Base
    return Base


# =====================================================
# EXPORT
# =====================================================

__all__ = [
    "engine",
    "SessionLocal",
    "ScopedSession",
    "get_db",
    "get_db_context",
    "get_scoped_session",
    "create_all_tables",
    "drop_all_tables",
    "check_database_connection",
    "get_pool_status",
    "TransactionManager",
    "DatabaseQueryHelper",
    "init_database",
    "get_engine",
    "get_base",
]