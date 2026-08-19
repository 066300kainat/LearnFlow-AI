\# LearnFlow AI



\### AI-Powered Learning \& Progress Tracker



LearnFlow AI is a dashboard-based learning task and progress tracking application designed to help students organize their learning activities, track progress, store notes and attachments, and test their knowledge through AI-generated quizzes.



> \*\*LearnFlow AI is a learning task tracker, not a traditional course-management LMS.\*\*



\## Features



\* 📊 \*\*Dashboard\*\*



&#x20; \* Total tasks

&#x20; \* Completed tasks

&#x20; \* In-progress tasks

&#x20; \* Average learning progress

&#x20; \* Learning progress overview



\* 📝 \*\*Task Management\*\*



&#x20; \* Create learning tasks

&#x20; \* Edit tasks

&#x20; \* Track task status

&#x20; \* Set task progress

&#x20; \* Add categories

&#x20; \* Set due dates



\* ⭐ \*\*Important Tasks\*\*



&#x20; \* Mark tasks as important

&#x20; \* View important tasks separately



\* 🗑️ \*\*Trash\*\*



&#x20; \* Move tasks to trash

&#x20; \* View deleted tasks

&#x20; \* Restore deleted tasks

&#x20; \* Permanently delete tasks



\* 📚 \*\*Task Details\*\*



&#x20; \* View complete task information

&#x20; \* Add and manage learning notes

&#x20; \* Upload attachments

&#x20; \* View progress history



\* 🤖 \*\*AI Quiz Generation\*\*



&#x20; \* Generate quizzes from task descriptions

&#x20; \* Use learning notes as quiz context

&#x20; \* Use attachment information

&#x20; \* Store generated quizzes in the database



\* 📈 \*\*Progress Tracking\*\*



&#x20; \* Track learning progress

&#x20; \* Store progress history

&#x20; \* Monitor task status changes



\## Technology Stack



\### Frontend



\* Next.js

\* TypeScript

\* Tailwind CSS

\* Lucide React



\### Backend



\* Python

\* FastAPI

\* SQLAlchemy

\* Alembic

\* Uvicorn



\### Database



\* PostgreSQL



\### AI



\* AI-powered quiz generation

\* Task-based learning content generation



\## Project Structure



```text

LearnFlow-AI/

│

├── frontend/

│   ├── app/

│   │   ├── tasks/

│   │   ├── analytics/

│   │   ├── settings/

│   │   └── ...

│   └── ...

│

├── backend/

│   ├── app/

│   │   ├── models/

│   │   ├── schemas/

│   │   ├── routes/

│   │   └── ...

│   ├── migrations/

│   └── ...

│

├── uploads/

│

└── README.md

```



\## Main Application Flow



```text

Dashboard

&#x20;  │

&#x20;  ├── My Tasks

&#x20;  │      │

&#x20;  │      ├── Create Task

&#x20;  │      ├── Edit Task

&#x20;  │      ├── Important

&#x20;  │      ├── Trash

&#x20;  │      └── Task Details

&#x20;  │             │

&#x20;  │             ├── Notes

&#x20;  │             ├── Attachments

&#x20;  │             ├── Progress History

&#x20;  │             └── AI Quiz

&#x20;  │

&#x20;  └── Analytics

```



\## Backend API



The FastAPI backend provides APIs for:



\* Tasks

\* Important tasks

\* Trash and restore

\* Notes

\* Attachments

\* Progress history

\* AI quizzes



FastAPI interactive documentation is available at:



```text

http://127.0.0.1:8000/docs

```



\## Running the Project



\### 1. Clone the repository



```bash

git clone https://github.com/YOUR-USERNAME/LearnFlow-AI.git

cd LearnFlow-AI

```



\### 2. Start the Backend



```bash

cd backend

```



Create and activate a virtual environment:



```bash

python -m venv venv

```



Windows:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Install dependencies:



```bash

pip install -r requirements.txt

```



Run FastAPI:



```bash

uvicorn app.main:app --reload

```



Backend will run on:



```text

http://127.0.0.1:8000

```



\### 3. Start the Frontend



Open another terminal:



```powershell

cd frontend

npm install

npm run dev

```



Frontend will run on:



```text

http://localhost:3000

```



\## Database



LearnFlow AI uses PostgreSQL as its database.



Database migrations are managed using Alembic.



Run migrations with:



```bash

alembic upgrade head

```



\## Current Modules



| Module                | Status |

| --------------------- | ------ |

| Dashboard             | ✅      |

| My Tasks              | ✅      |

| Create Task           | ✅      |

| Edit Task             | ✅      |

| Important Tasks       | ✅      |

| Trash                 | ✅      |

| Restore Task          | ✅      |

| Permanent Delete      | ✅      |

| Task Details          | ✅      |

| Notes                 | ✅      |

| Attachments           | ✅      |

| Progress History      | ✅      |

| AI Quiz Generation    | ✅      |

| Analytics             | 🔄     |

| Quiz Result / Scoring | 🔄     |

| AI Study Assistant    | 🔄     |



\## Future Improvements



\* AI Study Assistant

\* Advanced analytics

\* Quiz result and scoring system

\* Authentication and user-specific dashboards

\* Improved attachment preview

\* More detailed learning insights

\* Responsive UI improvements



\## Purpose



LearnFlow AI aims to provide students with a single workspace where they can manage learning tasks, record study material, track progress, and use AI to reinforce their learning through automatically generated quizzes.



\## License



This project is developed for educational and portfolio purposes.



