from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    in_progress_tasks: int
    pending_tasks: int
    average_progress: float
    important_tasks: int
    total_quizzes: int


class CategoryAnalytics(BaseModel):
    category: str
    task_count: int