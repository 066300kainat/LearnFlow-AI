from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProgressHistoryBase(BaseModel):
    task_id: int
    progress: float
    status: str


class ProgressHistoryCreate(ProgressHistoryBase):
    pass


class ProgressHistoryResponse(ProgressHistoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)