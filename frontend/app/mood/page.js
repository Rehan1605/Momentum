"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Edit3, Loader2, Save, Trash2 } from "lucide-react";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const moods = [
  { key: "great", label: "Great", icon: "😄", color: "border-emerald-300 bg-emerald-400/10 text-emerald-100" },
  { key: "good", label: "Good", icon: "🙂", color: "border-cyan-300 bg-cyan-400/10 text-cyan-100" },
  { key: "okay", label: "Okay", icon: "😐", color: "border-zinc-300 bg-zinc-400/10 text-zinc-100" },
  { key: "bad", label: "Bad", icon: "😔", color: "border-amber-300 bg-amber-400/10 text-amber-100" },
  { key: "terrible", label: "Terrible", icon: "😭", color: "border-rose-300 bg-rose-400/10 text-rose-100" },
];

const todayKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const preview = (text, limit = 110) =>
  text?.length > limit ? `${text.slice(0, limit)}...` : text || "";

export default function MoodPage() {
  const today = useMemo(() => todayKey(), []);
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [moodId, setMoodId] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [journalContent, setJournalContent] = useState("");
  const [journalId, setJournalId] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMood, setSavingMood] = useState(false);
  const [savingJournal, setSavingJournal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadWellbeing = () => {
    setLoading(true);
    setError("");

    Promise.all([api.get("/mood/history"), api.get("/journal")])
      .then(([moodResponse, journalResponse]) => {
        const moodsData = moodResponse.data.moodLogs || [];
        const journalsData = journalResponse.data.journalEntries || [];
        const todaysMood = moodsData.find((entry) => entry.date?.slice(0, 10) === today);
        const todaysJournal = journalsData.find((entry) => entry.date?.slice(0, 10) === today);

        setMoodHistory(moodsData);
        setJournalEntries(journalsData);
        setMood(todaysMood?.mood || "");
        setNote(todaysMood?.note || "");
        setMoodId(todaysMood?._id || null);
        setJournalContent(todaysJournal?.content || "");
        setJournalId(todaysJournal?._id || null);
      })
      .catch(() => {
        setError("Could not load mood and journal data.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([api.get("/mood/history"), api.get("/journal")])
      .then(([moodResponse, journalResponse]) => {
        if (!mounted) return;
        const moodsData = moodResponse.data.moodLogs || [];
        const journalsData = journalResponse.data.journalEntries || [];
        const todaysMood = moodsData.find((entry) => entry.date?.slice(0, 10) === today);
        const todaysJournal = journalsData.find((entry) => entry.date?.slice(0, 10) === today);

        setMoodHistory(moodsData);
        setJournalEntries(journalsData);
        setMood(todaysMood?.mood || "");
        setNote(todaysMood?.note || "");
        setMoodId(todaysMood?._id || null);
        setJournalContent(todaysJournal?.content || "");
        setJournalId(todaysJournal?._id || null);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load mood and journal data.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [today]);

  const saveMood = async () => {
    setError("");
    setMessage("");

    if (!mood) {
      setError("Choose a mood before saving.");
      return;
    }

    if (note.length > 300) {
      setError("Mood note must be 300 characters or fewer.");
      return;
    }

    setSavingMood(true);

    try {
      const { data } = await api.post("/mood", { date: today, mood, note });
      setMoodId(data.moodLog._id);
      setMessage("Mood saved.");
      loadWellbeing();
    } catch (requestError) {
      setError(requestError?.response?.data?.errors?.[0] || "Could not save mood.");
    } finally {
      setSavingMood(false);
    }
  };

  const saveJournal = async () => {
    setError("");
    setMessage("");

    if (!journalContent.trim()) {
      setError("Journal content is required.");
      return;
    }

    if (journalContent.length > 2000) {
      setError("Journal entry must be 2000 characters or fewer.");
      return;
    }

    setSavingJournal(true);

    try {
      const { data } = await api.post("/journal", {
        date: today,
        content: journalContent,
      });
      setJournalId(data.journalEntry._id);
      setMessage("Journal saved.");
      loadWellbeing();
    } catch (requestError) {
      setError(requestError?.response?.data?.errors?.[0] || "Could not save journal.");
    } finally {
      setSavingJournal(false);
    }
  };

  const editJournal = (entry) => {
    setJournalId(entry._id);
    setJournalContent(entry.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJournal = async (entry) => {
    if (!window.confirm("Delete this journal entry?")) return;
    setError("");
    setMessage("");

    try {
      await api.delete(`/journal/${entry._id}`);
      if (journalId === entry._id) {
        setJournalId(null);
        setJournalContent("");
      }
      setJournalEntries((current) => current.filter((item) => item._id !== entry._id));
      setMessage("Journal deleted.");
    } catch {
      setError("Could not delete journal entry.");
    }
  };

  const updateMoodFromHistory = async (entry) => {
    setMoodId(entry._id);
    setMood(entry.mood);
    setNote(entry.note || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell
      title="Mood + Journal"
      description="Log one mood and one journal entry per day, then review the pattern over time."
    >
      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="mb-4 rounded-md border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
          <div className="h-80 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="space-y-4">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-white/10 bg-zinc-900/75 p-5"
            >
              <h2 className="text-xl font-semibold text-zinc-100">Today&apos;s Mood</h2>
              <p className="mt-1 text-sm text-zinc-400">{today}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-2">
                {moods.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMood(item.key)}
                    className={`rounded-md border p-3 text-left transition hover:bg-white/5 ${
                      mood === item.key ? item.color : "border-white/10 bg-zinc-950 text-zinc-300"
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="mt-2 block text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <label className="mt-5 block">
                <span className="text-sm text-zinc-300">Note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={300}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-400"
                  placeholder="What influenced your mood today?"
                />
              </label>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-zinc-500">{note.length}/300</p>
                <button
                  type="button"
                  onClick={saveMood}
                  disabled={savingMood}
                  className="flex h-10 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 disabled:opacity-70"
                >
                  {savingMood ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Mood
                </button>
              </div>
            </motion.article>

            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-xl font-semibold text-zinc-100">Mood History</h2>
              <div className="mt-4 space-y-2">
                {moodHistory.length ? (
                  moodHistory.slice(0, 8).map((entry) => {
                    const moodInfo = moods.find((item) => item.key === entry.mood);
                    return (
                      <button
                        type="button"
                        key={entry._id}
                        onClick={() => updateMoodFromHistory(entry)}
                        className="w-full rounded-md bg-white/5 px-3 py-3 text-left hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-zinc-100">
                            {moodInfo?.icon} {moodInfo?.label || entry.mood}
                          </p>
                          <p className="text-xs text-zinc-500">{formatDate(entry.date)}</p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">{preview(entry.note, 90) || "No note"}</p>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-400">No mood logged yet.</p>
                )}
              </div>
            </article>
          </section>

          <section className="space-y-4">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-white/10 bg-zinc-900/75 p-5"
            >
              <h2 className="text-xl font-semibold text-zinc-100">Today&apos;s Journal</h2>
              <textarea
                value={journalContent}
                onChange={(event) => setJournalContent(event.target.value)}
                maxLength={2000}
                rows={12}
                className="mt-5 w-full rounded-md border border-white/10 bg-zinc-950 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none focus:border-emerald-400"
                placeholder="Write what happened, what you learned, or what you want to remember."
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-zinc-500">{journalContent.length}/2000</p>
                <button
                  type="button"
                  onClick={saveJournal}
                  disabled={savingJournal}
                  className="flex h-10 items-center gap-2 rounded-md bg-emerald-400 px-4 text-sm font-medium text-zinc-950 disabled:opacity-70"
                >
                  {savingJournal ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save Journal
                </button>
              </div>
            </motion.article>

            <article className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
              <h2 className="text-xl font-semibold text-zinc-100">Journal History</h2>
              <div className="mt-4 space-y-2">
                {journalEntries.length ? (
                  journalEntries.slice(0, 8).map((entry) => (
                    <div key={entry._id} className="rounded-md bg-white/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-100">{formatDate(entry.date)}</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editJournal(entry)}
                            className="rounded-md p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
                          >
                            <Edit3 className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteJournal(entry)}
                            className="rounded-md p-2 text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{preview(entry.content)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-400">No journal entries yet.</p>
                )}
              </div>
            </article>
          </section>
        </div>
      )}
    </AppShell>
  );
}
