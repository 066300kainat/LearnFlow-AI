"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  Trash2,
  FileText,
  Paperclip,
  History,
  Brain,
} from "lucide-react";

type Task = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  category: string | null;
  due_date: string | null;
  status: string;
  progress: number;
  is_important: boolean;
  is_deleted: boolean;
};

type Note = {
  id: number;
  task_id: number;
  title: string;
  content: string;
  created_at: string;
};

type Attachment = {
  id: number;
  task_id: number;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  created_at: string;
};

type ProgressHistory = {
  id: number;
  task_id: number;
  progress: number;
  status: string;
  created_at: string;
};

const API_URL = "http://127.0.0.1:8000";

export default function TaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [task, setTask] = useState<Task | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [progressHistory, setProgressHistory] = useState<
    ProgressHistory[]
  >([]);
  const [progressHistoryLoading, setProgressHistoryLoading] =
    useState(false);

  const [quizGenerating, setQuizGenerating] = useState(false);

  // =========================
// LOAD TASK
// =========================

useEffect(() => {
  async function loadTask() {
    try {
      const { id } = await params;
      const numericId = Number(id);

      if (!Number.isFinite(numericId)) {
        throw new Error("Invalid task ID");
      }

      setTaskId(numericId);

      const response = await fetch(
        `${API_URL}/tasks/${numericId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch task");
      }

      const data: Task = await response.json();
      setTask(data);

    } catch (err) {
      console.error("Task details error:", err);
      setError("Unable to load task details.");
    } finally {
      setLoading(false);
    }
  }

  loadTask();
}, [params]);
  // =========================
  // LOAD NOTES
  // =========================

  async function loadNotes(id: number) {
    try {
      setNotesLoading(true);

      const response = await fetch(
        `${API_URL}/notes/?task_id=${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error("Notes error:", err);
    } finally {
      setNotesLoading(false);
    }
  }

  // =========================
  // LOAD ATTACHMENTS
  // =========================

  async function loadAttachments(id: number) {
    try {
      setAttachmentsLoading(true);

      const response = await fetch(
        `${API_URL}/attachments/task/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attachments");
      }

      const data = await response.json();
      setAttachments(data);
    } catch (err) {
      console.error("Attachments error:", err);
    } finally {
      setAttachmentsLoading(false);
    }
  }

  // =========================
  // LOAD PROGRESS HISTORY
  // =========================

  async function loadProgressHistory(id: number) {
    try {
      setProgressHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/progress-history/task/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch progress history");
      }

      const data = await response.json();
      setProgressHistory(data);
    } catch (err) {
      console.error("Progress history error:", err);
    } finally {
      setProgressHistoryLoading(false);
    }
  }

  // =========================
  // LOAD ALL TASK DATA
  // =========================

  useEffect(() => {
    if (!taskId) return;

    loadNotes(taskId);
    loadAttachments(taskId);
    loadProgressHistory(taskId);
  }, [taskId]);

  // =========================
  // CREATE NOTE
  // =========================

  async function createNote() {
    if (
      !taskId ||
      !noteTitle.trim() ||
      !noteContent.trim()
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          title: noteTitle.trim(),
          content: noteContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      setNoteTitle("");
      setNoteContent("");
      setShowNoteModal(false);

      await loadNotes(taskId);
    } catch (err) {
      console.error("Create note error:", err);
      alert("Failed to create note.");
    }
  }

  // =========================
  // DELETE NOTE
  // =========================

  async function deleteNote(noteId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/notes/${noteId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      if (taskId) {
        await loadNotes(taskId);
      }
    } catch (err) {
      console.error("Delete note error:", err);
      alert("Failed to delete note.");
    }
  }

  // =========================
  // UPLOAD ATTACHMENT
  // =========================

  async function uploadAttachment(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !taskId) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("task_id", String(taskId));
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/attachments/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload attachment");
      }

      await loadAttachments(taskId);

      event.target.value = "";
    } catch (err) {
      console.error("Upload attachment error:", err);
      alert("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  }

  // =========================
  // DELETE ATTACHMENT
  // =========================

  async function deleteAttachment(attachmentId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attachment?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/attachments/${attachmentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete attachment");
      }

      if (taskId) {
        await loadAttachments(taskId);
      }
    } catch (err) {
      console.error("Delete attachment error:", err);
      alert("Failed to delete attachment.");
    }
  }

  // =========================
  // GENERATE AI QUIZ
  // =========================

async function generateQuiz() {
  if (!taskId || !task) return;

  try {
    setQuizGenerating(true);

    let content = `TASK DESCRIPTION:
${task.description || ""}

LEARNING NOTES:
`;

    if (notes.length > 0) {
      notes.forEach((note) => {
        content += `
NOTE TITLE: ${note.title}
NOTE CONTENT: ${note.content}
`;
      });
    } else {
      content += "No notes available.\n";
    }

    content += `
ATTACHMENTS:
`;

    if (attachments.length > 0) {
      attachments.forEach((attachment) => {
        content += `
ATTACHMENT: ${attachment.file_name}
FILE TYPE: ${attachment.file_type || "unknown"}
`;
      });
    } else {
      content += "No attachments available.\n";
    }

    console.log("Generating quiz...");
    console.log("Content length:", content.length);

    const response = await fetch(
      `${API_URL}/quizzes/generate?task_id=${taskId}&content=${encodeURIComponent(
        content
      )}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    console.log("Quiz response:", data);

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to generate quiz"
      );
    }

    alert("Quiz generated successfully!");

    // Open generated quiz screen
    window.location.href = `/quiz/${data.id}`;

  } catch (error) {
    console.error("Generate quiz error:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to generate quiz."
    );
  } finally {
    setQuizGenerating(false);
  }
}

  // =========================
  // FORMAT FILE SIZE
  // =========================

  function formatFileSize(size: number | null) {
    if (!size) return "Unknown size";

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  // =========================
  // FORMAT DATE
  // =========================

  function formatHistoryDate(date: string) {
    return new Date(date).toLocaleString();
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading task...
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !task) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <Link
          href="/tasks"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to My Tasks
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-500">
          {error || "Task not found."}
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <Link
              href="/tasks"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
              title="Back"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold">
                Task Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and manage your learning task
              </p>
            </div>

          </div>

          <Link
            href="/tasks"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Pencil size={17} />
            Edit Task
          </Link>

        </div>
      </header>

      <main className="mx-auto max-w-6xl p-8">

        {/* Task Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div className="flex items-start gap-4">

              <div className="mt-1">
                {task.status === "completed" ? (
                  <CheckCircle2
                    size={26}
                    className="text-green-500"
                  />
                ) : (
                  <Clock3
                    size={26}
                    className="text-indigo-500"
                  />
                )}
              </div>

              <div>

                <h2 className="text-2xl font-bold">
                  {task.title}
                </h2>

                {task.description && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {task.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">

                  {task.category && (
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                      {task.category}
                    </span>
                  )}

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                    {task.status.replace("_", " ")}
                  </span>

                  {task.due_date && (
                    <span className="text-xs text-slate-400">
                      Due: {task.due_date}
                    </span>
                  )}

                </div>

              </div>

            </div>

            {task.is_important && (
              <div className="rounded-xl bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-600">
                ⭐ Important
              </div>
            )}

          </div>

          {/* Progress */}
          <div className="mt-7">

            <div className="mb-2 flex justify-between text-sm">

              <span className="font-medium text-slate-600">
                Progress
              </span>

              <span className="font-bold text-indigo-600">
                {task.progress}%
              </span>

            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${task.progress}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* Feature Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          {/* Notes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <FileText size={21} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Notes
                  </h3>

                  <p className="text-xs text-slate-500">
                    Keep your learning notes here
                  </p>
                </div>

              </div>

              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={15} />
                Add Note
              </button>

            </div>

            <div className="mt-5">

              {notesLoading ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">

                  <FileText
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No notes yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add notes related to this task.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {note.title}
                          </h4>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">
                            {note.content}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteNote(note.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                          title="Delete note"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <Paperclip size={21} />
                </div>

                <div>
                  <h3 className="font-bold">
                    Attachments
                  </h3>

                  <p className="text-xs text-slate-500">
                    Files related to this task
                  </p>
                </div>

              </div>

              <label
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 ${
                  uploading
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                <Plus size={15} />
                {uploading ? "Uploading..." : "Upload"}

                <input
                  type="file"
                  className="hidden"
                  disabled={uploading}
                  onChange={uploadAttachment}
                />
              </label>

            </div>

            <div className="mt-5">

              {attachmentsLoading ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Loading attachments...
                </div>
              ) : attachments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">

                  <Paperclip
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No attachments yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Upload PDFs, documents or other files.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                          <Paperclip size={18} />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-700">
                            {attachment.file_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatFileSize(
                              attachment.file_size
                            )}

                            {attachment.file_type
                              ? ` • ${attachment.file_type}`
                              : ""}
                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          deleteAttachment(attachment.id)
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        title="Delete attachment"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* Progress History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <History size={21} />
              </div>

              <div>
                <h3 className="font-bold">
                  Progress History
                </h3>

                <p className="text-xs text-slate-500">
                  Track your progress changes
                </p>
              </div>

            </div>

            <div className="mt-5">

              {progressHistoryLoading ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                  Loading progress history...
                </div>
              ) : progressHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">

                  <History
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No progress history yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your progress updates will appear here.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {progressHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4"
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                          <div className="rounded-lg bg-green-50 p-2 text-green-600">
                            <History size={17} />
                          </div>

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Progress updated to{" "}
                              {item.progress}%
                            </p>

                            <p className="mt-1 text-xs capitalize text-slate-400">
                              Status:{" "}
                              {item.status.replace(
                                "_",
                                " "
                              )}
                            </p>

                          </div>

                        </div>

                        <span className="text-right text-xs text-slate-400">
                          {formatHistoryDate(
                            item.created_at
                          )}
                        </span>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                item.progress,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  ))}

                </div>
              )}

            </div>

          </div>

          {/* AI Quiz */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Brain size={21} />
              </div>

              <div>
                <h3 className="font-bold">
                  AI Quiz
                </h3>

                <p className="text-xs text-slate-500">
                  Test your knowledge
                </p>
              </div>

            </div>

            <div className="mt-5 rounded-xl bg-orange-50/50 p-6">

              <p className="text-sm font-medium text-slate-700">
                Ready to test yourself?
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Generate a 10-question AI quiz using
                your task description, notes and
                attachment information.
              </p>

              <button
                onClick={generateQuiz}
                disabled={quizGenerating}
                className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Brain size={17} />

                {quizGenerating
                  ? "Generating..."
                  : "Generate Quiz"}
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  Add Note
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Save a learning note for this task
                </p>
              </div>

              <button
                onClick={() =>
                  setShowNoteModal(false)
                }
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Note title"
                value={noteTitle}
                onChange={(e) =>
                  setNoteTitle(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) =>
                  setNoteContent(e.target.value)
                }
                className="h-36 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteTitle("");
                  setNoteContent("");
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createNote}
                disabled={
                  !noteTitle.trim() ||
                  !noteContent.trim()
                }
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save Note
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}