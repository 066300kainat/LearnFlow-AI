from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
import traceback
import os

from pypdf import PdfReader
from docx import Document

from app.database import SessionLocal
from app.models import Quiz, QuizQuestion, Task, Note, Attachment
from app.schemas.quiz import QuizCreate, QuizResponse
from app.services.quiz_ai import generate_quiz


router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------
# Extract text from attachment
# ---------------------------------------------------------

def extract_attachment_text(attachment: Attachment) -> str:
    if not attachment.file_path:
        return ""

    file_path = attachment.file_path

    if not os.path.exists(file_path):
        return ""

    file_name = attachment.file_name.lower()

    try:

        # PDF
        if file_name.endswith(".pdf"):
            reader = PdfReader(file_path)

            text_parts = []

            for page in reader.pages:
                page_text = page.extract_text()

                if page_text:
                    text_parts.append(page_text)

            return "\n".join(text_parts)

        # DOCX
        elif file_name.endswith(".docx"):
            document = Document(file_path)

            text_parts = []

            for paragraph in document.paragraphs:
                if paragraph.text.strip():
                    text_parts.append(paragraph.text)

            return "\n".join(text_parts)

        # TXT
        elif file_name.endswith(".txt"):
            with open(
                file_path,
                "r",
                encoding="utf-8",
                errors="ignore",
            ) as file:
                return file.read()

        # Unsupported file
        return ""

    except Exception as e:
        print(
            f"Failed to extract text from {attachment.file_name}: {e}"
        )
        return ""


# ---------------------------------------------------------
# Build combined learning content
# ---------------------------------------------------------

def build_learning_content(
    task: Task,
    db: Session,
) -> str:

    content_parts = []

    # 1. Task Description
    if task.description and task.description.strip():

        content_parts.append(
            f"""
TASK DESCRIPTION:

{task.description.strip()}
"""
        )

    # 2. Notes
    notes = (
        db.query(Note)
        .filter(Note.task_id == task.id)
        .order_by(Note.created_at.asc())
        .all()
    )

    for note in notes:

        note_content = ""

        if note.title:
            note_content += f"Title: {note.title}\n"

        if note.content:
            note_content += note.content

        if note_content.strip():

            content_parts.append(
                f"""
LEARNING NOTE:

{note_content.strip()}
"""
            )

    # 3. Attachments
    attachments = (
        db.query(Attachment)
        .filter(Attachment.task_id == task.id)
        .order_by(Attachment.created_at.asc())
        .all()
    )

    for attachment in attachments:

        extracted_text = extract_attachment_text(
            attachment
        )

        if extracted_text.strip():

            content_parts.append(
                f"""
ATTACHMENT: {attachment.file_name}

{extracted_text.strip()}
"""
            )

    # Combine everything
    combined_content = "\n\n".join(content_parts)

    return combined_content.strip()


# ---------------------------------------------------------
# Create manual quiz
# ---------------------------------------------------------

@router.post(
    "/",
    response_model=QuizResponse,
)
def create_quiz(
    data: QuizCreate,
    db: Session = Depends(get_db),
):

    quiz = Quiz(
        task_id=data.task_id,
        title=data.title,
    )

    db.add(quiz)
    db.flush()

    for question_data in data.questions:

        question = QuizQuestion(
            quiz_id=quiz.id,
            question=question_data.question,
            option_a=question_data.option_a,
            option_b=question_data.option_b,
            option_c=question_data.option_c,
            option_d=question_data.option_d,
            correct_answer=question_data.correct_answer,
        )

        db.add(question)

    db.commit()
    db.refresh(quiz)

    return quiz


# ---------------------------------------------------------
# Get quizzes for task
# ---------------------------------------------------------

@router.get(
    "/task/{task_id}",
    response_model=list[QuizResponse],
)
def get_task_quizzes(
    task_id: int,
    db: Session = Depends(get_db),
):

    return (
        db.query(Quiz)
        .filter(Quiz.task_id == task_id)
        .order_by(Quiz.created_at.desc())
        .all()
    )


# ---------------------------------------------------------
# Get single quiz
# ---------------------------------------------------------

@router.get(
    "/{quiz_id}",
    response_model=QuizResponse,
)
def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
):

    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    return quiz


# ---------------------------------------------------------
# Generate AI Quiz
# ---------------------------------------------------------

@router.post("/generate")
def generate_ai_quiz(
    task_id: int,
    db: Session = Depends(get_db),
):

    try:

        print("===================================")
        print("STEP 1: Finding task")
        print("===================================")

        task = (
            db.query(Task)
            .filter(Task.id == task_id)
            .first()
        )

        if not task:

            raise HTTPException(
                status_code=404,
                detail="Task not found",
            )

        print(f"Task found: {task.title}")

        # -------------------------------------------------
        # Build content from description + notes + files
        # -------------------------------------------------

        print("===================================")
        print("STEP 2: Building learning content")
        print("===================================")

        combined_content = build_learning_content(
            task,
            db,
        )

        if not combined_content:

            raise HTTPException(
                status_code=400,
                detail=(
                    "No learning content found. "
                    "Please add a task description, "
                    "note, or supported attachment "
                    "(PDF, DOCX, TXT)."
                ),
            )

        print(
            f"Combined content length: "
            f"{len(combined_content)} characters"
        )

        # -------------------------------------------------
        # Generate AI quiz
        # -------------------------------------------------

        print("===================================")
        print("STEP 3: Calling Azure OpenAI")
        print("===================================")

        ai_quiz = generate_quiz(
            combined_content
        )

        print("STEP 4: AI response received")
        print(ai_quiz)

        # -------------------------------------------------
        # Parse JSON
        # -------------------------------------------------

        try:

            ai_data = json.loads(ai_quiz)

            questions = ai_data["questions"]

        except (
            json.JSONDecodeError,
            KeyError,
        ) as e:

            print("JSON ERROR:", e)

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AI returned invalid quiz format: {e}"
                ),
            )

        # Make sure exactly 10 questions are returned
        if len(questions) != 10:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AI returned {len(questions)} "
                    "questions instead of 10."
                ),
            )

        print("STEP 5: JSON parsed")
        print(
            f"Questions received: {len(questions)}"
        )

        # -------------------------------------------------
        # Save quiz
        # -------------------------------------------------

        quiz = Quiz(
            task_id=task_id,
            title="AI Generated Quiz",
        )

        db.add(quiz)
        db.flush()

        for item in questions:

            options = item["options"]

            question = QuizQuestion(
                quiz_id=quiz.id,
                question=item["question"],
                option_a=options["A"],
                option_b=options["B"],
                option_c=options["C"],
                option_d=options["D"],
                correct_answer=item["answer"],
            )

            db.add(question)

        db.commit()
        db.refresh(quiz)

        print("===================================")
        print("STEP 6: Quiz saved successfully")
        print("===================================")

        return quiz

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        print("===================================")
        print("AI QUIZ ERROR")
        print("===================================")
        print(str(e))
        traceback.print_exc()
        print("===================================")

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


# ---------------------------------------------------------
# Delete quiz
# ---------------------------------------------------------

@router.delete("/{quiz_id}")
def delete_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
):

    quiz = (
        db.query(Quiz)
        .filter(Quiz.id == quiz_id)
        .first()
    )

    if not quiz:

        raise HTTPException(
            status_code=404,
            detail="Quiz not found",
        )

    db.delete(quiz)
    db.commit()

    return {
        "message": "Quiz deleted successfully"
    }