from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


# =========================
# CREATE TASK
# =========================

@router.post(
    "/",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
):
    task = Task(
        user_id=task_data.user_id,
        title=task_data.title,
        description=task_data.description,
        category=task_data.category,
        due_date=task_data.due_date,
        status=task_data.status,
        progress=task_data.progress,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


# =========================
# GET NORMAL TASKS
# =========================

@router.get("/", response_model=list[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return (
        db.query(Task)
        .filter(Task.is_deleted == False)
        .all()
    )


# =========================
# GET IMPORTANT TASKS
# =========================

@router.get("/important", response_model=list[TaskResponse])
def get_important_tasks(db: Session = Depends(get_db)):
    return (
        db.query(Task)
        .filter(
            Task.is_important == True,
            Task.is_deleted == False,
        )
        .all()
    )


# =========================
# TOGGLE IMPORTANT
# =========================

@router.patch(
    "/{task_id}/important",
    response_model=TaskResponse,
)
def toggle_important(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task.is_important = not task.is_important

    db.commit()
    db.refresh(task)

    return task


# =========================
# GET TRASH
# =========================

@router.get("/trash", response_model=list[TaskResponse])
def get_trash_tasks(db: Session = Depends(get_db)):
    return (
        db.query(Task)
        .filter(Task.is_deleted == True)
        .all()
    )


# =========================
# GET SINGLE TASK
# =========================

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    return task


# =========================
# UPDATE TASK
# =========================

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


# =========================
# MOVE TASK TO TRASH
# =========================

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == False,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    task.is_deleted = True

    db.commit()

    return {
        "message": "Task moved to trash successfully"
    }


# =========================
# RESTORE TASK
# =========================

@router.post(
    "/{task_id}/restore",
    response_model=TaskResponse,
)
def restore_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == True,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found in trash",
        )

    task.is_deleted = False

    db.commit()
    db.refresh(task)

    return task


# =========================
# PERMANENT DELETE
# =========================

@router.delete("/{task_id}/permanent")
def permanently_delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_deleted == True,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found in trash",
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task permanently deleted"
    }