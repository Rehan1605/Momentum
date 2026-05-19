"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Edit3, Loader2, Pause, Play, Plus, Trash2, X } from "lucide-react";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const categories = ["Fitness", "Learning", "Mindset", "Health", "Productivity", "Personal"];
const difficulties = ["easy", "medium", "hard"];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emptyForm = {
  name: "",
  description: "",
  category: "Fitness",
  difficulty: "easy",
  scheduleType: "daily",
  days: [],
  active: true,
};

const difficultyStyles = {
  easy: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  medium: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  hard: "border-rose-400/30 bg-rose-400/10 text-rose-200",
};

function HabitFormModal({ mode, form, setForm, onClose, onSubmit, saving, error }) {
  const selectedDays = new Set(form.days);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day) => {
    setForm((current) => {
      const exists = current.days.includes(day);
      return {
        ...current,
        days: exists ? current.days.filter((item) => item !== day) : [...current.days, day],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md border border-white/10 bg-zinc-950 p-5 shadow-2xl shadow-black"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-50">
              {mode === "edit" ? "Edit Habit" : "Add Habit"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Shape the schedule, difficulty, and category for this habit.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-zinc-400 hover:bg-white/5">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm text-zinc-300">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              minLength={2}
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              placeholder="Workout"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm text-zinc-300">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
              placeholder="Optional details"
            />
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Category</span>
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm text-zinc-300">Difficulty</span>
            <select
              value={form.difficulty}
              onChange={(event) => updateField("difficulty", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-emerald-400"
            >
              {difficulties.map((difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          <span className="text-sm text-zinc-300">Schedule</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              ["daily", "Daily"],
              ["selected_days", "Selected weekdays"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => updateField("scheduleType", value)}
                className={`rounded-md border px-3 py-3 text-left text-sm ${
                  form.scheduleType === value
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-100"
                    : "border-white/10 bg-zinc-900 text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {form.scheduleType === "selected_days" ? (
          <div className="mt-5">
            <span className="text-sm text-zinc-300">Weekdays</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {weekdays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`h-10 rounded-md border px-3 text-sm ${
                    selectedDays.has(day)
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-zinc-900 text-zinc-400"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="h-11 rounded-md border border-white/10 px-4 text-sm text-zinc-300 hover:bg-white/5">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex h-11 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-300 disabled:opacity-70"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {mode === "edit" ? "Save Habit" : "Create Habit"}
          </button>
        </div>
      </motion.form>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const activeCount = useMemo(() => habits.filter((habit) => habit.active).length, [habits]);

  const loadHabits = () => {
    setLoading(true);
    setError("");

    api
      .get("/habits")
      .then(({ data }) => setHabits(data.habits || []))
      .catch(() => setError("Could not load habits. Make sure the backend is running."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let mounted = true;

    api
      .get("/habits")
      .then(({ data }) => {
        if (!mounted) return;
        setHabits(data.habits || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load habits. Make sure the backend is running.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (habit) => {
    setMode("edit");
    setEditingId(habit._id);
    setForm({
      name: habit.name,
      description: habit.description || "",
      category: habit.category,
      difficulty: habit.difficulty,
      scheduleType: habit.scheduleType,
      days: habit.days || [],
      active: habit.active,
    });
    setFormError("");
    setModalOpen(true);
  };

  const validateForm = () => {
    if (form.name.trim().length < 2) return "Habit name must be at least 2 characters.";
    if (form.scheduleType === "selected_days" && form.days.length === 0) {
      return "Choose at least one weekday.";
    }
    return "";
  };

  const submitHabit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError("");

    const payload = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      days: form.scheduleType === "daily" ? [] : form.days,
    };

    try {
      if (mode === "edit") {
        const { data } = await api.put(`/habits/${editingId}`, payload);
        setHabits((current) => current.map((habit) => (habit._id === editingId ? data.habit : habit)));
      } else {
        const { data } = await api.post("/habits", payload);
        setHabits((current) => [data.habit, ...current]);
      }
      setModalOpen(false);
    } catch (requestError) {
      setFormError(requestError?.response?.data?.errors?.[0] || requestError?.response?.data?.message || "Could not save habit.");
    } finally {
      setSaving(false);
    }
  };

  const togglePause = async (habit) => {
    const nextActive = !habit.active;
    setHabits((current) =>
      current.map((item) => (item._id === habit._id ? { ...item, active: nextActive } : item))
    );

    try {
      const { data } = await api.patch(`/habits/${habit._id}/pause`, { active: nextActive });
      setHabits((current) => current.map((item) => (item._id === habit._id ? data.habit : item)));
    } catch {
      setHabits((current) =>
        current.map((item) => (item._id === habit._id ? { ...item, active: habit.active } : item))
      );
      setError("Could not update habit status.");
    }
  };

  const deleteHabit = async (habit) => {
    const confirmed = window.confirm(`Delete "${habit.name}"?`);
    if (!confirmed) return;

    const previous = habits;
    setHabits((current) => current.filter((item) => item._id !== habit._id));

    try {
      await api.delete(`/habits/${habit._id}`);
    } catch {
      setHabits(previous);
      setError("Could not delete habit.");
    }
  };

  return (
    <AppShell
      title="Habits"
      description={`${activeCount} active habit${activeCount === 1 ? "" : "s"} in your current system.`}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-400">Create, edit, pause, resume, and remove habits.</p>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 hover:bg-emerald-300"
        >
          <Plus className="size-4" />
          Add Habit
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-44 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <section className="rounded-md border border-white/10 bg-zinc-900/70 p-6">
          <h2 className="text-xl font-semibold text-zinc-100">No habits yet</h2>
          <p className="mt-2 text-sm text-zinc-400">Create your first habit and it will appear in Today when scheduled.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Create your first habit
          </button>
        </section>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {habits.map((habit, index) => (
            <motion.article
              key={habit._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="rounded-md border border-white/10 bg-zinc-900/75 p-4 shadow-xl shadow-black/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold text-zinc-50">{habit.name}</h2>
                  <p className="mt-2 min-h-10 text-sm leading-5 text-zinc-400">
                    {habit.description || "No description added."}
                  </p>
                </div>
                <span className={`rounded-md px-2 py-1 text-xs ${habit.active ? "bg-emerald-400/10 text-emerald-200" : "bg-zinc-700 text-zinc-300"}`}>
                  {habit.active ? "Active" : "Paused"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
                  {habit.category}
                </span>
                <span className={`rounded-md border px-2 py-1 text-xs ${difficultyStyles[habit.difficulty]}`}>
                  {habit.difficulty}
                </span>
                <span className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300">
                  <CalendarDays className="size-3" />
                  {habit.scheduleType === "daily" ? "Daily" : habit.days.join(", ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(habit)}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
                >
                  <Edit3 className="size-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => togglePause(habit)}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 text-sm text-zinc-300 hover:bg-white/5"
                >
                  {habit.active ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {habit.active ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteHabit(habit)}
                  className="flex h-10 items-center justify-center gap-2 rounded-md border border-red-400/20 text-sm text-red-200 hover:bg-red-500/10"
                >
                  <Trash2 className="size-4" />
                  Delete
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {modalOpen ? (
        <HabitFormModal
          mode={mode}
          form={form}
          setForm={setForm}
          onClose={() => setModalOpen(false)}
          onSubmit={submitHabit}
          saving={saving}
          error={formError}
        />
      ) : null}
    </AppShell>
  );
}
