"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CalendarCheck,
  Flame,
  Gauge,
  Medal,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const chartColors = ["#34d399", "#22d3ee", "#f43f5e", "#a78bfa", "#fbbf24", "#60a5fa"];

const summaryConfig = [
  { key: "todayScore", label: "Today Score", suffix: "%", icon: Gauge },
  { key: "weeklyCompletion", label: "Weekly Completion", suffix: "%", icon: CalendarCheck },
  { key: "monthlyCompletion", label: "Monthly Completion", suffix: "%", icon: TrendingUp },
  { key: "overallCurrentStreak", label: "Current Streak", suffix: " days", icon: Flame },
  { key: "overallLongestStreak", label: "Longest Streak", suffix: " days", icon: Trophy },
  { key: "growthScore", label: "Growth Score", suffix: "%", icon: Target },
  { key: "completedToday", label: "Completed Today", suffix: "", icon: CalendarCheck },
  { key: "totalHabits", label: "Total Habits", suffix: "", icon: Target },
];

const formatValue = (value, suffix) => `${value ?? 0}${suffix}`;

const heatIntensity = (count) => {
  if (count >= 4) return "bg-emerald-300";
  if (count === 3) return "bg-emerald-500";
  if (count === 2) return "bg-emerald-700";
  if (count === 1) return "bg-emerald-900";
  return "bg-zinc-800";
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
        <div className="h-72 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState({
    dashboard: null,
    streaks: [],
    categories: [],
    heatmap: [],
    badges: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.get("/stats/dashboard"),
      api.get("/stats/streaks"),
      api.get("/stats/categories"),
      api.get("/stats/heatmap"),
      api.get("/stats/growth-score"),
      api.get("/badges/unlocked"),
    ])
      .then(([dashboard, streaks, categories, heatmap, growth, badges]) => {
        if (!mounted) return;
        setData({
          dashboard: {
            ...dashboard.data,
            growthScore: growth.data.score,
          },
          streaks: streaks.data || [],
          categories: categories.data || [],
          heatmap: heatmap.data || [],
          badges: badges.data || [],
        });
        setError("");
      })
      .catch((requestError) => {
        if (!mounted) return;
        const status = requestError?.response?.status;
        setError(
          status === 401
            ? "Your session expired. Please log in again."
            : "Could not load dashboard analytics. Make sure the backend is running."
        );
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recentHeatmap = useMemo(() => data.heatmap.slice(-70), [data.heatmap]);

  return (
    <AppShell
      title="Dashboard"
      description="A live readout of your momentum, streaks, categories, and unlocked milestones."
    >
      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryConfig.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.article
                  key={item.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-md border border-white/10 bg-zinc-900/75 p-4 shadow-xl shadow-black/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-zinc-400">{item.label}</p>
                    <Icon className="size-4 text-emerald-300" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-zinc-50">
                    {formatValue(data.dashboard?.[item.key], item.suffix)}
                  </p>
                </motion.article>
              );
            })}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-emerald-300" />
                <h2 className="text-lg font-semibold text-zinc-100">Best Habit</h2>
              </div>
              {data.dashboard?.bestHabit ? (
                <div className="mt-5">
                  <p className="text-2xl font-semibold text-zinc-50">{data.dashboard.bestHabit.name}</p>
                  <p className="mt-2 text-sm text-zinc-400">{data.dashboard.bestHabit.category}</p>
                  <p className="mt-5 text-4xl font-semibold text-emerald-300">
                    {data.dashboard.bestHabit.completionPercent}%
                  </p>
                </div>
              ) : (
                <p className="mt-5 text-sm text-zinc-400">Complete a few habits and your best performer will appear here.</p>
              )}
            </article>

            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-lg font-semibold text-zinc-100">Per-Habit Streaks</h2>
              <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                {data.streaks.length ? (
                  data.streaks.map((habit) => (
                    <div key={habit.habitId} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-3">
                      <p className="min-w-0 truncate text-sm font-medium text-zinc-100">{habit.name}</p>
                      <div className="flex gap-2 text-xs text-zinc-400">
                        <span>{habit.currentStreak} current</span>
                        <span>{habit.longestStreak} best</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">No streaks yet.</p>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-lg font-semibold text-zinc-100">Category Breakdown</h2>
              <div className="mt-4 h-72">
                {data.categories.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      />
                      <Pie data={data.categories} dataKey="completionPercent" nameKey="category" innerRadius={60} outerRadius={95}>
                        {data.categories.map((entry, index) => (
                          <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-zinc-400">No category data yet.</p>
                )}
              </div>
            </article>

            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-lg font-semibold text-zinc-100">Completion Bars</h2>
              <div className="mt-4 h-72">
                {data.categories.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.categories}>
                      <XAxis dataKey="category" stroke="#a1a1aa" tickLine={false} axisLine={false} />
                      <YAxis stroke="#a1a1aa" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                      />
                      <Bar dataKey="completionPercent" radius={[6, 6, 0, 0]} fill="#34d399" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-zinc-400">Category bars will appear after completions.</p>
                )}
              </div>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-lg font-semibold text-zinc-100">Activity Heatmap</h2>
              <div className="mt-4 grid grid-cols-10 gap-1 sm:grid-cols-14">
                {recentHeatmap.map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${day.completedCount}`}
                    className={`aspect-square rounded-sm ${heatIntensity(day.completedCount)}`}
                  />
                ))}
              </div>
            </article>

            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <div className="flex items-center gap-2">
                <Award className="size-5 text-cyan-300" />
                <h2 className="text-lg font-semibold text-zinc-100">Achievements</h2>
              </div>
              <div className="mt-4 space-y-2">
                {data.badges.length ? (
                  data.badges.slice(0, 5).map((badge) => (
                    <div key={badge.badgeKey} className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-3">
                      <Medal className="size-4 text-emerald-300" />
                      <p className="text-sm text-zinc-100">{badge.badgeName}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">Unlocked badges will show here.</p>
                )}
              </div>
            </article>
          </section>
        </div>
      )}
    </AppShell>
  );
}
