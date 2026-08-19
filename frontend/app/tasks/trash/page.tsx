"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  RotateCcw,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

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

export default function TrashPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // =========================
  // LOAD TRASH
  // =========================

  async function loadTrash() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/tasks/trash`);

      if (!response.ok) {
        throw new Error("Failed to fetch trash");
      }

      const data: Task[] = await response.json();

      setTasks(data);
    } catch (error) {
      console.error("Trash error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTrash();
  }, []);

  // =========================
  // RESTORE TASK
  // =========================

  async function restoreTask(taskId: number) {
    try {
      setActionLoading(taskId);

      const response = await fetch(
        `${API_URL}/tasks/${taskId}/restore`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to restore task.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      // Remove restored task from Trash immediately
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );

    } catch (error) {
      console.error("Restore error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to restore task."
      );
    } finally {
      setActionLoading(null);
    }
  }

  // =========================
  // PERMANENT DELETE
  // =========================

  async function permanentlyDelete(taskId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this task? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(taskId);

      const response = await fetch(
        `${API_URL}/tasks/${taskId}/permanent`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to permanently delete task.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      // Remove permanently deleted task from UI
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );

    } catch (error) {
      console.error("Permanent delete error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete task."
      );
    } finally {
      setActionLoading(null);
    }
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
              title="Back to My Tasks"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold">
                Trash
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Deleted tasks are kept here until permanently removed
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
            <Trash2 size={17} />

            {tasks.length} task
            {tasks.length !== 1 ? "s" : ""}
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="p-8">

        {/* Loading */}
        {loading ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading trash...
          </div>

        ) : tasks.length === 0 ? (

          /* Empty Trash */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">

            <Trash2
              size={48}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="text-lg font-semibold">
              Trash is empty
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Deleted tasks will appear here.
            </p>

            <Link
              href="/tasks"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeft size={17} />
              Back to My Tasks
            </Link>

          </div>

        ) : (

          /* Deleted Tasks */
          <div className="space-y-4">

            {tasks.map((task) => {

              const isActionLoading =
                actionLoading === task.id;

              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
                >

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* Task Information */}
                    <div className="flex-1">

                      <div className="flex items-start gap-3">

                        <div className="rounded-xl bg-red-50 p-3 text-red-500">
                          <Trash2 size={20} />
                        </div>

                        <div>

                          <h2 className="text-lg font-semibold text-slate-800">
                            {task.title}
                          </h2>

                          {task.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">

                            {task.category && (
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                {task.category}
                              </span>
                            )}

                            

                            {task.due_date && (
                              <span className="text-xs text-slate-400">
                                Due: {task.due_date}
                              </span>
                            )}

                          </div>

                        </div>

                      </div>

                      {/* Progress */}
                      <div className="mt-5 max-w-xl">

                        <div className="mb-2 flex justify-between text-xs">

                          <span className="text-slate-500">
                            Progress
                          </span>

                          <span className="font-semibold text-slate-700">
                            {task.progress}%
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                          <div
                            className="h-full rounded-full bg-slate-400"
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

                    {/* Actions */}
                    <div className="flex items-center gap-2">

                      {/* Restore */}
                      <button
                        onClick={() =>
                          restoreTask(task.id)
                        }
                        disabled={isActionLoading}
                        className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Restore"
                      >
                        <RotateCcw size={17} />

                        {isActionLoading
                          ? "Processing..."
                          : "Restore"}
                      </button>

                      {/* Permanently Delete */}
                      <button
                        onClick={() =>
                          permanentlyDelete(task.id)
                        }
                        disabled={isActionLoading}
                        className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete Permanently"
                      >
                        <X size={17} />

                        Delete Permanently
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </main>

    </div>
  );
}