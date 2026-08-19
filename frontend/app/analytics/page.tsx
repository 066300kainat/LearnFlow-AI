"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  ListTodo,
  Star,
  Brain,
  TrendingUp,
  Circle,
} from "lucide-react";

type AnalyticsSummary = {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  average_progress: number;
  important_tasks: number;
  total_quizzes: number;
};

type CategoryAnalytics = {
  category: string;
  task_count: number;
};

const API_URL = "http://127.0.0.1:8000";

export default function AnalyticsPage() {
  const [summary, setSummary] =
    useState<AnalyticsSummary | null>(null);

  const [categories, setCategories] =
    useState<CategoryAnalytics[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);

        const [summaryResponse, categoriesResponse] =
          await Promise.all([
            fetch(`${API_URL}/analytics/summary`),
            fetch(`${API_URL}/analytics/categories`),
          ]);

        if (!summaryResponse.ok) {
          throw new Error("Failed to load analytics summary");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Failed to load category analytics");
        }

        const summaryData =
          await summaryResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        setSummary(summaryData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Analytics error:", error);
        setError("Unable to load analytics.");
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          Loading analytics...
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] p-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-red-500">
          {error || "Analytics data not available."}
        </div>
      </div>
    );
  }

  const maxCategoryCount =
    categories.length > 0
      ? Math.max(
          ...categories.map(
            (item) => item.task_count
          )
        )
      : 1;

  const completionRate =
    summary.total_tasks > 0
      ? Math.round(
          (summary.completed_tasks /
            summary.total_tasks) *
            100
        )
      : 0;

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
                Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Track your learning activity and progress
              </p>
            </div>

          </div>

          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
            <BarChart3 size={22} />
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl p-8">

        {/* Overview Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Tasks
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.total_tasks}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ListTodo size={22} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Active learning tasks
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed
                </p>

                <p className="mt-2 text-3xl font-bold text-green-600">
                  {summary.completed_tasks}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <CheckCircle2 size={22} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {completionRate}% completion rate
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {summary.in_progress_tasks}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Clock3 size={22} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Currently learning
            </p>
          </div>

          {/* Average Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Average Progress
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {summary.average_progress}%
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <TrendingUp size={22} />
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              Overall learning progress
            </p>
          </div>

        </div>

        {/* Second Stats Row */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                <Circle size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Pending Tasks
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {summary.pending_tasks}
                </p>
              </div>

            </div>

          </div>

          {/* Important */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                <Star size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Important Tasks
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {summary.important_tasks}
                </p>
              </div>

            </div>

          </div>

          {/* Quizzes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <Brain size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  AI Quizzes
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {summary.total_quizzes}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Progress Overview */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* Task Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <BarChart3 size={21} />
              </div>

              <div>
                <h2 className="font-bold">
                  Task Status
                </h2>

                <p className="text-xs text-slate-500">
                  Distribution of your tasks
                </p>
              </div>

            </div>

            <div className="mt-7 space-y-5">

              {/* Completed */}
              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-medium text-slate-600">
                    Completed
                  </span>

                  <span className="font-semibold text-green-600">
                    {summary.completed_tasks}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width:
                        summary.total_tasks > 0
                          ? `${
                              (summary.completed_tasks /
                                summary.total_tasks) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              {/* In Progress */}
              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-medium text-slate-600">
                    In Progress
                  </span>

                  <span className="font-semibold text-indigo-600">
                    {summary.in_progress_tasks}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{
                      width:
                        summary.total_tasks > 0
                          ? `${
                              (summary.in_progress_tasks /
                                summary.total_tasks) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

              {/* Pending */}
              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-medium text-slate-600">
                    Pending
                  </span>

                  <span className="font-semibold text-yellow-600">
                    {summary.pending_tasks}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{
                      width:
                        summary.total_tasks > 0
                          ? `${
                              (summary.pending_tasks /
                                summary.total_tasks) *
                              100
                            }%`
                          : "0%",
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Overall Learning Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <TrendingUp size={21} />
              </div>

              <div>
                <h2 className="font-bold">
                  Learning Progress
                </h2>

                <p className="text-xs text-slate-500">
                  Overall progress across your tasks
                </p>
              </div>

            </div>

            <div className="mt-8 flex items-center justify-center">

              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-[18px] border-slate-100">

                <div
                  className="absolute inset-[-18px] rounded-full border-[18px] border-purple-500"
                  style={{
                    clipPath: `polygon(
                      50% 0%,
                      100% 0%,
                      100% 100%,
                      0% 100%,
                      0% 0%,
                      ${
                        summary.average_progress >= 50
                          ? "50% 0%"
                          : `${summary.average_progress}% 0%`
                      }
                    )`,
                  }}
                />

                <div className="text-center">

                  <p className="text-4xl font-bold text-purple-600">
                    {summary.average_progress}%
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Average Progress
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-7 rounded-xl bg-purple-50 p-4 text-center">

              <p className="text-sm font-medium text-purple-700">
                Keep learning and improving!
              </p>

              <p className="mt-1 text-xs text-purple-500">
                Your overall task progress is{" "}
                {summary.average_progress}%.
              </p>

            </div>

          </div>

        </div>

        {/* Category Analytics */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <BarChart3 size={21} />
            </div>

            <div>
              <h2 className="font-bold">
                Tasks by Category
              </h2>

              <p className="text-xs text-slate-500">
                See how your learning tasks are distributed
              </p>
            </div>

          </div>

          <div className="mt-7">

            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">

                <BarChart3
                  size={32}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-600">
                  No category data yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Create categorized tasks to see analytics.
                </p>

              </div>
            ) : (
              <div className="space-y-5">

                {categories.map((item) => {

                  const percentage =
                    maxCategoryCount > 0
                      ? (item.task_count /
                          maxCategoryCount) *
                        100
                      : 0;

                  return (
                    <div key={item.category}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-sm font-medium text-slate-700">
                          {item.category}
                        </span>

                        <span className="text-sm font-semibold text-slate-500">
                          {item.task_count}{" "}
                          {item.task_count === 1
                            ? "task"
                            : "tasks"}
                        </span>

                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </div>

        {/* Navigation */}
        <div className="mt-6 flex flex-wrap gap-3">

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Dashboard
          </Link>

          <Link
            href="/tasks"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            My Tasks
          </Link>

        </div>

      </main>
    </div>
  );
}