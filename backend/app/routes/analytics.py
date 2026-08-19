from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.task import Task
from app.models.quiz import Quiz
from app.schemas.analytics import AnalyticsSummary, CategoryAnalytics


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):

    tasks = (
        db.query(Task)
        .filter(Task.is_deleted == False)
        .all()
    )

    total_tasks = len(tasks)

    completed_tasks = sum(
        1 for task in tasks
        if task.status == "completed"
    )

    in_progress_tasks = sum(
        1 for task in tasks
        if task.status == "in_progress"
    )

    pending_tasks = sum(
        1 for task in tasks
        if task.status == "pending"
    )

    average_progress = (
        sum(task.progress for task in tasks) / total_tasks
        if total_tasks > 0
        else 0
    )

    important_tasks = sum(
        1 for task in tasks
        if task.is_important
    )

    total_quizzes = db.query(Quiz).count()

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "pending_tasks": pending_tasks,
        "average_progress": round(average_progress, 2),
        "important_tasks": important_tasks,
        "total_quizzes": total_quizzes,
    }


@router.get("/categories", response_model=list[CategoryAnalytics])
def get_category_analytics(db: Session = Depends(get_db)):

    results = (
        db.query(
            Task.category,
            func.count(Task.id),
        )
        .filter(
            Task.is_deleted == False,
            Task.category.isnot(None),
        )
        .group_by(Task.category)
        .all()
    )

    return [
        {
            "category": category,
            "task_count": count,
        }
        for category, count in results
    ]