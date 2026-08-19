import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=os.getenv("AZURE_OPENAI_ENDPOINT"),
)


def generate_quiz(content: str):
    response = client.responses.create(
        model=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        input=f"""
Create exactly 10 multiple-choice questions from the learning content below.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT use ```json.

The response must be a JSON object with this exact structure:

{{
  "questions": [
    {{
      "question": "Question text",
      "options": {{
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      }},
      "answer": "A"
    }}
  ]
}}

Rules:
- Exactly 10 questions.
- Exactly 4 options per question.
- Only one correct answer per question.
- Use ONLY information present in the learning content.
- Do not invent information.
- The answer must be A, B, C, or D.
- Questions should cover different parts of the learning content.
- Keep questions clear and suitable for a student.

Learning Content:
{content}
""",
    )

    return response.output_text