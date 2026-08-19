from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    due_date: date | None = None
    status: str = "pending"
    progress: float = Field(default=0.0, ge=0.0, le=100.0)


class TaskCreate(TaskBase):
    user_id: int


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    category: str | None = Field(default=None, max_length=100)
    due_date: date | None = None
    status: str | None = None
    progress: float | None = Field(default=None, ge=0.0, le=100.0)
    is_important: bool | None = None


class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    is_important: bool
    is_deleted: bool

    model_config = ConfigDict(from_attributes=True)