"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Star,
  Trash2,
  Pencil,
   Eye,
  CheckCircle2,
  Clock3,
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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "",
    due_date: "",
    status: "pending",
    progress: 0,
    user_id: 1,
  });

  async function loadTasks() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/tasks/`);

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Tasks error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function toggleImportant(taskId: number) {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}/important`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update important status");
      }

      await loadTasks();
    } catch (error) {
      console.error(error);
    }
  }

  async function moveToTrash(taskId: number) {
    try {
      const response = await fetch(
        `${API_URL}/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await loadTasks();
    } catch (error) {
      console.error(error);
    }
  }

  async function createTask() {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      setShowAddTask(false);

      setNewTask({
        title: "",
        description: "",
        category: "",
        due_date: "",
        status: "pending",
        progress: 0,
        user_id: 1,
      });

      await loadTasks();
    } catch (error) {
      console.error("Create task error:", error);
    }
  }

  // FIXED: updateTask is now outside createTask
  async function updateTask() {
    if (!editingTask) return;

    try {
      const response = await fetch(
        `${API_URL}/tasks/${editingTask.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editingTask.title,
            description: editingTask.description,
            category: editingTask.category,
            due_date: editingTask.due_date || null,
            status: editingTask.status,
            progress: editingTask.progress,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      setEditingTask(null);

      await loadTasks();
    } catch (error) {
      console.error("Update task error:", error);
    }
  }

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-8 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              My Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and track your learning tasks
            </p>
          </div>

          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add Task
          </button>

        </div>
      </header>

      <main className="p-8">

        {/* Search + Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">

          <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 md:max-w-md">

            <Search
              size={19}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />

          </div>

          <div className="flex gap-2">

            <button className="rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              All
            </button>

            <button className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-50">
              Pending
            </button>

            <button className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-50">
              Completed
            </button>

          </div>

        </div>

        {/* Task Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            {filteredTasks.length} task
            {filteredTasks.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tasks */}
        {loading ? (

          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading tasks...
          </div>

        ) : filteredTasks.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <CheckCircle2
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h2 className="font-semibold">
              No tasks found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a task to start tracking your learning.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredTasks.map((task) => (

              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                  {/* Task Info */}
                  <div className="flex-1">

                    <div className="flex items-start gap-3">

                      <div className="mt-1">

                        {task.status === "completed" ? (

                          <CheckCircle2
                            size={21}
                            className="text-green-500"
                          />

                        ) : (

                          <Clock3
                            size={21}
                            className="text-indigo-500"
                          />

                        )}

                      </div>

                      <div>

                        <h2 className="text-lg font-semibold">
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

                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
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
                          className="h-full rounded-full bg-indigo-600"
                          style={{
                            width: `${task.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">

                    {/* Important */}
                    <button
                      onClick={() => toggleImportant(task.id)}
                      className={`rounded-xl border p-2.5 transition ${
                        task.is_important
                          ? "border-yellow-200 bg-yellow-50 text-yellow-500"
                          : "border-slate-200 text-slate-400 hover:bg-slate-50"
                      }`}
                      title="Important"
                    >

                      <Star
                        size={18}
                        fill={
                          task.is_important
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>
{/* View */}
<button
  onClick={() => {
    window.location.href = `/tasks/${task.id}`;
  }}
  className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-slate-50 hover:text-indigo-600"
  title="View Task"
>
  <Eye size={18} />
</button>

                    {/* Edit */}
                    <button
                      onClick={() => setEditingTask(task)}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-slate-50"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Trash */}
                    <button
                      onClick={() => moveToTrash(task.id)}
                      className="rounded-xl border border-slate-200 p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Move to Trash"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* ================= CREATE TASK MODAL ================= */}

        {showAddTask && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Create New Task
                  </h2>

                  <p className="text-sm text-slate-500">
                    Add a new learning task
                  </p>

                </div>

                <button
                  onClick={() => setShowAddTask(false)}
                  className="text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>

              </div>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <textarea
                  placeholder="Description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      description: e.target.value,
                    })
                  }
                  className="h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <input
                  type="text"
                  placeholder="Category e.g. Backend"
                  value={newTask.category}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          due_date: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Status
                    </label>

                    <select
                      value={newTask.status}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          status: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                    </select>

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Progress: {newTask.progress}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newTask.progress}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        progress: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />

                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() => setShowAddTask(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={createTask}
                  disabled={!newTask.title.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Create Task
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================= EDIT TASK MODAL ================= */}

        {editingTask && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold">
                    Edit Task
                  </h2>

                  <p className="text-sm text-slate-500">
                    Update your learning task
                  </p>

                </div>

                <button
                  onClick={() => setEditingTask(null)}
                  className="text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>

              </div>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Task title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      title: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <textarea
                  placeholder="Description"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  className="h-24 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={editingTask.category || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      category: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Due Date
                    </label>

                    <input
                      type="date"
                      value={editingTask.due_date || ""}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          due_date: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />

                  </div>

                  <div>

                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Status
                    </label>

                    <select
                      value={editingTask.status}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          status: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                    </select>

                  </div>

                </div>

                <div>

                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Progress: {editingTask.progress}%
                  </label>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        progress: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />

                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={updateTask}
                  disabled={!editingTask.title.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}