from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100)
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    # ======================================================
    # USER → CONTRACTS RELATIONSHIP
    # ======================================================

    contracts = relationship(
        "Contract",
        back_populates="user",
        cascade="all, delete-orphan"
    )