from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QuizQuestionCreate(BaseModel):
    question: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str


class QuizCreate(BaseModel):
    task_id: int
    title: str
    questions: list[QuizQuestionCreate]


class QuizQuestionResponse(QuizQuestionCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class QuizResponse(BaseModel):
    id: int
    task_id: int
    title: str
    created_at: datetime
    questions: list[QuizQuestionResponse]

    model_config = ConfigDict(from_attributes=True)