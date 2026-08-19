import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Attachment
from app.schemas.attachment import AttachmentCreate, AttachmentResponse

router = APIRouter(
    prefix="/attachments",
    tags=["Attachments"],
)

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get(
    "/task/{task_id}",
    response_model=list[AttachmentResponse],
)
def get_task_attachments(
    task_id: int,
    db: Session = Depends(get_db),
):
    return (
        db.query(Attachment)
        .filter(Attachment.task_id == task_id)
        .order_by(Attachment.created_at.desc())
        .all()
    )


@router.post(
    "/",
    response_model=AttachmentResponse,
)
def create_attachment(
    data: AttachmentCreate,
    db: Session = Depends(get_db),
):
    attachment = Attachment(
        task_id=data.task_id,
        file_name=data.file_name,
        file_path=data.file_path,
        file_type=data.file_type,
        file_size=data.file_size,
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.post(
    "/upload",
    response_model=AttachmentResponse,
)
def upload_attachment(
    task_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="File name is required",
        )

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())

        file_size = os.path.getsize(file_path)

        attachment = Attachment(
            task_id=task_id,
            file_name=file.filename,
            file_path=file_path,
            file_type=file.content_type,
            file_size=file_size,
        )

        db.add(attachment)
        db.commit()
        db.refresh(attachment)

        return attachment

    except Exception:
        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail="Failed to upload file",
        )


@router.delete("/{attachment_id}")
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
):
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id)
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found",
        )

    if attachment.file_path and os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)

    db.delete(attachment)
    db.commit()

    return {"message": "Attachment deleted successfully"}