from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.note import Note
from app.models.task import Task
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse


router = APIRouter(
    prefix="/notes",
    tags=["Notes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=NoteResponse)
def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == note.task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    new_note = Note(
        task_id=note.task_id,
        title=note.title,
        content=note.content,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.get("/", response_model=list[NoteResponse])
def get_notes(
    task_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Note)

    if task_id is not None:
        query = query.filter(Note.task_id == task_id)

    return query.order_by(Note.created_at.desc()).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    if note_data.title is not None:
        note.title = note_data.title

    if note_data.content is not None:
        note.content = note_data.content

    db.commit()
    db.refresh(note)

    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    db.delete(note)
    db.commit()

    return {
        "message": "Note deleted successfully"
    }