from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import ProgressHistory
from app.schemas.progress_history import (
    ProgressHistoryCreate,
    ProgressHistoryResponse,
)

router = APIRouter(
    prefix="/progress-history",
    tags=["Progress History"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/task/{task_id}",
    response_model=list[ProgressHistoryResponse],
)
def get_progress_history(
    task_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(ProgressHistory)
        .filter(ProgressHistory.task_id == task_id)
        .order_by(ProgressHistory.created_at.desc())
        .all()
    )


@router.post(
    "/",
    response_model=ProgressHistoryResponse,
)
def create_progress_history(
    data: ProgressHistoryCreate,
    db: Session = Depends(get_db),
):
    history = ProgressHistory(
        task_id=data.task_id,
        progress=data.progress,
        status=data.status,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history