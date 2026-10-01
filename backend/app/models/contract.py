from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database.database import Base


class Contract(Base):

    __tablename__ = "contracts"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ======================================================
    # USER OWNERSHIP
    # ======================================================

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    user = relationship(
        "User",
        back_populates="contracts"
    )

    # ======================================================
    # CONTRACT FILE
    # ======================================================

    file_name = Column(
        String(255),
        nullable=False
    )

    filepath = Column(
        String(500),
        nullable=False
    )

    file_hash = Column(
        String(64),
        nullable=False,
        index=True
    )

    # ======================================================
    # AI ANALYSIS
    # ======================================================

    analysis = Column(
        Text,
        nullable=True
    )

    # ======================================================
    # UPLOAD DATE
    # ======================================================

    upload_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )