from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AttachmentCreate(BaseModel):
    task_id: int
    file_name: str
    file_path: str
    file_type: str | None = None
    file_size: int | None = None


class AttachmentResponse(AttachmentCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)