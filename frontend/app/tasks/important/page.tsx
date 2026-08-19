"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Star,
  Trash2,
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

const API_URL = "http://127.0.0.1:8000";

export default function ImportantTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadImportantTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/tasks/important`
      );

      if (!response.ok) {
        throw new Error("Failed to load important tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Important tasks error:", error);
      setError("Unable to load important tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImportantTasks();
  }, []);

  async function removeFromImportant(taskId: number) {
    const confirmed = window.confirm(
      "Remove this task from Important?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}/important`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_important: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      await loadImportantTasks();
    } catch (error) {
      console.error("Remove important error:", error);
      alert("Failed to remove task from Important.");
    }
  }

  function getStatusIcon(status: string) {
    if (status === "completed") {
      return (
        <CheckCircle2
          size={22}
          className="text-green-500"
        />
      );
    }

    return (
      <Clock3
        size={22}
        className="text-indigo-500"
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-8 py-5">

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
              title="Back to Dashboard"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold">
                Important Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Tasks you marked as important
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-yellow-50 px-4 py-2 text-sm font-semibold text-yellow-700">
            <Star size={17} fill="currentColor" />
            {tasks.length} Important
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl p-8">

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading important tasks...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-500">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <Star
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-bold text-slate-700">
              No Important Tasks
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Tasks that you mark as important will appear here.
            </p>

            <Link
              href="/tasks"
              className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Go to My Tasks
            </Link>

          </div>
        ) : (
          <div className="space-y-4">

            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-start justify-between gap-5">

                  {/* Task Info */}
                  <Link
                    href={`/tasks/${task.id}`}
                    className="flex min-w-0 flex-1 items-start gap-4"
                  >

                    <div className="mt-1">
                      {getStatusIcon(task.status)}
                    </div>

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <h2 className="truncate text-lg font-bold text-slate-800">
                          {task.title}
                        </h2>

                        <Star
                          size={17}
                          className="shrink-0 text-yellow-500"
                          fill="currentColor"
                        />

                      </div>

                      {task.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">

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

                  </Link>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      onClick={() =>
                        removeFromImportant(task.id)
                      }
                      className="rounded-xl p-2.5 text-yellow-500 hover:bg-yellow-50"
                      title="Remove from Important"
                    >
                      <Star
                        size={18}
                        fill="currentColor"
                      />
                    </button>

                    <Link
                      href={`/tasks/${task.id}`}
                      className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      View
                    </Link>

                  </div>

                </div>

                {/* Progress */}
                <div className="mt-5">

                  <div className="mb-2 flex justify-between text-xs">

                    <span className="font-medium text-slate-500">
                      Progress
                    </span>

                    <span className="font-bold text-indigo-600">
                      {task.progress}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{
                        width: `${Math.min(
                          Math.max(task.progress, 0),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}