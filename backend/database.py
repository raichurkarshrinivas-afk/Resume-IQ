"""
SQLAlchemy engine, session factory, and declarative base.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def _apply_safe_migrations():
    """Add new columns to existing SQLite tables without dropping data."""
    try:
        with engine.connect() as conn:
            # Check users table columns
            res_u = conn.exec_driver_sql("PRAGMA table_info(users)").fetchall()
            cols_u = [row[1] for row in res_u]
            if cols_u:
                if "role" not in cols_u:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'candidate'")
                if "is_active" not in cols_u:
                    conn.exec_driver_sql("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")

            # Check resumes table columns
            res = conn.exec_driver_sql("PRAGMA table_info(resumes)").fetchall()
            cols = [row[1] for row in res]
            if cols:
                if "corrected_text" not in cols:
                    conn.exec_driver_sql("ALTER TABLE resumes ADD COLUMN corrected_text TEXT")
                if "parser_metadata" not in cols:
                    conn.exec_driver_sql("ALTER TABLE resumes ADD COLUMN parser_metadata JSON")

            # Check analyses table columns
            res_a = conn.exec_driver_sql("PRAGMA table_info(analyses)").fetchall()
            cols_a = [row[1] for row in res_a]
            if cols_a:
                if "rubric_version" not in cols_a:
                    conn.exec_driver_sql("ALTER TABLE analyses ADD COLUMN rubric_version VARCHAR(50) DEFAULT '2026.1'")
                if "no_jd_mode" not in cols_a:
                    conn.exec_driver_sql("ALTER TABLE analyses ADD COLUMN no_jd_mode BOOLEAN DEFAULT 0")

            conn.commit()
    except Exception as err:
        pass


def create_tables():
    """Create all tables on startup and apply safe column additions."""
    import models  # Ensure all models are registered
    Base.metadata.create_all(bind=engine)
    _apply_safe_migrations()
