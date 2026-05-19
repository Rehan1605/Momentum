"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const todayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const displayDate = () =>
  new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

const difficultyStyles = {
  easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  hard: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

export default function TodayPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState({});
  const dateLabel = useMemo(() => displayDate(), []);
  const apiDate = useMemo(() => todayKey(), []);

  const fetchToday = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/logs/today");
      setHabits(data.habits || []);
    } catch {
      setError("Could not load today's habits. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    api
      .get("/logs/today")
      .then(({ data }) => {
        if (!mounted) return;
        setHabits(data.habits || []);
        setError("");
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load today's habits. Check that the backend is running.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleHabit = async (habit) => {
    const nextCompleted = !habit.completed;
    setError("");
    setSaving((current) => ({ ...current, [habit.habitId]: true }));
    setHabits((current) =>
      current.map((item) =>
        item.habitId === habit.habitId ? { ...item, completed: nextCompleted } : item
      )
    );

    try {
      await api.post("/logs/check", {
        habitId: habit.habitId,
        date: apiDate,
        completed: nextCompleted,
      });
    } catch {
      setHabits((current) =>
        current.map((item) =>
          item.habitId === habit.habitId ? { ...item, completed: habit.completed } : item
        )
      );
      setError("Could not save that change. Please try again.");
    } finally {
      setSaving((current) => ({ ...current, [habit.habitId]: false }));
    }
  };

  return (
    <AppShell title="Today" description={dateLabel}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-400">
            Complete the habits scheduled for today.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchToday}
          className="flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-zinc-300 hover:bg-white/5"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-md border border-white/10 bg-zinc-900/70"
            />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <section className="rounded-md border border-white/10 bg-zinc-900/70 p-6">
          <h2 className="text-xl font-semibold text-zinc-100">Nothing scheduled today.</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Add a daily habit or one scheduled for this weekday to see it here.
          </p>
        </section>
      ) : (
        <div className="grid gap-3">
          {habits.map((habit, index) => {
            const pending = saving[habit.habitId];

            return (
              <motion.article
                key={habit.habitId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-md border border-white/10 bg-zinc-900/75 p-4 shadow-xl shadow-black/10"
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleHabit(habit)}
                    disabled={pending}
                    className={`flex size-11 shrink-0 items-center justify-center rounded-md border transition ${
                      habit.completed
                        ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                        : "border-white/15 bg-zinc-950 text-zinc-500 hover:border-emerald-400"
                    }`}
                    aria-label={habit.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {pending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : habit.completed ? (
                      <Check className="size-5" />
                    ) : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h2
                      className={`text-lg font-semibold ${
                        habit.completed ? "text-zinc-400 line-through" : "text-zinc-50"
                      }`}
                    >
                      {habit.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
                        {habit.category}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-1 text-xs ${
                          difficultyStyles[habit.difficulty] || difficultyStyles.easy
                        }`}
                      >
                        {habit.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
