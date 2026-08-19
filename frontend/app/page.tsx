"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Star,
  Trash2,
  BarChart3,
 
  Settings,
  Plus,
  Bell,
} from "lucide-react";

import { getAnalyticsSummary } from "@/lib/api";

type Analytics = {
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  pending_tasks: number;
  average_progress: number;
  important_tasks: number;
  total_quizzes: number;
};

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    name: "My Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    name: "Important",
    icon: Star,
    href: "/tasks/important",
  },
  {
    name: "Trash",
    icon: Trash2,
    href: "/tasks/trash",
  },
  {
    name: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },

];

export default function Home() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setAnalytics)
      .catch((error) =>
        console.error("Analytics error:", error)
      );
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 h-screen w-64 border-r border-slate-200 bg-white px-4 py-6">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-3 px-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            L
          </div>

          <div>
            <h1 className="text-lg font-bold">
              LearnFlow AI
            </h1>

            <p className="text-xs text-slate-400">
              Learning Tracker
            </p>
          </div>

        </div>

        {/* Add New Task */}
        <Link
          href="/tasks/create"
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Add New Task
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}

        </nav>

        {/* Settings */}
        <div className="absolute bottom-6 left-4 right-4">

          <Link
            href="/settings"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Settings size={19} />
            Settings
          </Link>

        </div>

      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">

        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

          <div>
            <h2 className="text-xl font-bold">
              Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              Track your learning progress
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            title="Notifications"
          >
            <Bell size={20} />
          </button>

        </header>

        <div className="p-8">

          {/* Welcome */}
          <section className="mb-8 rounded-2xl bg-indigo-600 p-7 text-white shadow-sm">

            <p className="mb-2 text-sm text-indigo-100">
              Welcome back 👋
            </p>

            <h1 className="text-3xl font-bold">
              Keep learning, keep growing.
            </h1>

            <p className="mt-2 max-w-xl text-sm text-indigo-100">
              Stay on top of your tasks and monitor your
              learning progress from one place.
            </p>

          </section>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <StatCard
              title="Total Tasks"
              value={analytics?.total_tasks ?? 0}
              icon={<CheckSquare size={20} />}
            />

            <StatCard
              title="Completed"
              value={analytics?.completed_tasks ?? 0}
              icon={<CheckSquare size={20} />}
            />

            <StatCard
              title="In Progress"
              value={analytics?.in_progress_tasks ?? 0}
              icon={<BarChart3 size={20} />}
            />

            <StatCard
              title="Average Progress"
              value={`${analytics?.average_progress ?? 0}%`}
             icon={<BarChart3 size={20} />}
            />

          </section>

          {/* Lower Cards */}
          <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Learning Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h3 className="font-bold">
                    Learning Progress
                  </h3>

                  <p className="text-sm text-slate-500">
                    Your current overall progress
                  </p>
                </div>

                <span className="text-2xl font-bold text-indigo-600">
                  {analytics?.average_progress ?? 0}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-indigo-600 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        analytics?.average_progress ?? 0,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            {/* Quick Stats */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h3 className="font-bold">
                Quick Stats
              </h3>

              <div className="mt-5 space-y-4">

                <QuickStat
                  label="Pending Tasks"
                  value={analytics?.pending_tasks ?? 0}
                />

                <QuickStat
                  label="Important Tasks"
                  value={analytics?.important_tasks ?? 0}
                />

                <QuickStat
                  label="AI Quizzes"
                  value={analytics?.total_quizzes ?? 0}
                />

              </div>

            </div>

          </section>

        </div>
      </main>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-4 flex items-center justify-between">

        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          {icon}
        </div>

      </div>

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

    </div>
  );
}

function QuickStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-bold text-slate-900">
        {value}
      </span>

    </div>
  );
}