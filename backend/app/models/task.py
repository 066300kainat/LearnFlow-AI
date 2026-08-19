from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(200), nullable=False)

    description = Column(Text, nullable=True)

    category = Column(String(100), nullable=True)

    due_date = Column(Date, nullable=True)

    status = Column(
        String(30),
        nullable=False,
        default="pending",
    )

    progress = Column(
        Float,
        nullable=False,
        default=0.0,
    )
    is_important = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    is_deleted = Column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="tasks",
    )