from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.routes.tasks import router as tasks_router
from app.routes.notes import router as notes_router
from app.routes.progress_history import router as progress_history_router
from app.routes.attachments import router as attachments_router
from app.routes.quiz import router as quiz_router
from app.routes.analytics import router as analytics_router



app = FastAPI(
    title="LearnFlow AI API",
    description="AI-powered learning task and progress tracking platform",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(progress_history_router)

app.include_router(tasks_router)
app.include_router(notes_router)
app.include_router(attachments_router)
app.include_router(quiz_router)
app.include_router(analytics_router)



@app.get("/")
def root():
    return {
        "message": "LearnFlow AI API is running"
    }