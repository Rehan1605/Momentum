"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, Dumbbell, GraduationCap, Lock, Medal, Sparkles, Trophy } from "lucide-react";

import AppShell from "@/components/AppShell";
import api from "@/services/api";

const badgeMeta = {
  consistency_starter: { icon: Sparkles, group: "Consistency" },
  seven_day_streak: { icon: Trophy, group: "Consistency" },
  thirty_day_streak: { icon: Trophy, group: "Consistency" },
  century_club: { icon: Medal, group: "Milestones" },
  weekend_warrior: { icon: Award, group: "Milestones" },
  learning_machine: { icon: GraduationCap, group: "Learning" },
  fitness_fighter: { icon: Dumbbell, group: "Fitness" },
};

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(value))
    : null;

export default function AchievementsPage() {
  const [badges, setBadges] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([api.get("/badges"), api.get("/badges/unlocked")])
      .then(([allBadges, unlockedBadges]) => {
        if (!mounted) return;
        setBadges(allBadges.data || []);
        setUnlocked(unlockedBadges.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Could not load achievements.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const unlockedCount = badges.filter((badge) => badge.unlocked).length;
    const total = badges.length;
    const lockedCount = Math.max(total - unlockedCount, 0);
    const completion = total ? Math.round((unlockedCount / total) * 100) : 0;

    return { unlockedCount, lockedCount, total, completion };
  }, [badges]);

  const groups = useMemo(() => {
    return badges.reduce((collection, badge) => {
      const group = badgeMeta[badge.badgeKey]?.group || "Other";
      collection[group] = [...(collection[group] || []), badge];
      return collection;
    }, {});
  }, [badges]);

  return (
    <AppShell
      title="Achievements"
      description="A gallery of the badges Momentum unlocks from your real habit performance."
    >
      {error ? (
        <p className="mb-4 rounded-md border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-md border border-white/10 bg-zinc-900/70" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-3 rounded-md border border-white/10 bg-zinc-900/75 p-5 sm:grid-cols-3">
            <div>
              <p className="text-sm text-zinc-400">Unlocked</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-50">
                {summary.unlockedCount} / {summary.total}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Locked</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-50">{summary.lockedCount}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Completion</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-300">{summary.completion}%</p>
            </div>
          </section>

          {Object.entries(groups).map(([group, groupBadges]) => (
            <section key={group}>
              <h2 className="mb-3 text-xl font-semibold text-zinc-100">{group}</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {groupBadges.map((badge, index) => {
                  const Icon = badgeMeta[badge.badgeKey]?.icon || Medal;

                  return (
                    <motion.article
                      key={badge.badgeKey}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{ delay: index * 0.03 }}
                      className={`rounded-md border p-5 transition ${
                        badge.unlocked
                          ? "border-emerald-400/40 bg-emerald-400/10 shadow-2xl shadow-emerald-950/30"
                          : "border-white/10 bg-zinc-900/60 opacity-65"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`flex size-12 items-center justify-center rounded-md ${
                            badge.unlocked ? "bg-emerald-400 text-zinc-950" : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {badge.unlocked ? <Icon className="size-6" /> : <Lock className="size-5" />}
                        </div>
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            badge.unlocked ? "bg-emerald-400/20 text-emerald-100" : "bg-white/5 text-zinc-500"
                          }`}
                        >
                          {badge.unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold text-zinc-100">{badge.badgeName}</h3>
                      <p className="mt-2 text-sm text-zinc-400">
                        {badge.unlocked
                          ? `Unlocked ${formatDate(badge.unlockedAt)}`
                          : "Keep building momentum to unlock this badge."}
                      </p>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          ))}

          {badges.length === 0 ? (
            <section className="rounded-md border border-white/10 bg-zinc-900/75 p-6">
              <h2 className="text-xl font-semibold text-zinc-100">No badges available</h2>
              <p className="mt-2 text-sm text-zinc-400">Badge definitions will appear here when the backend returns them.</p>
            </section>
          ) : null}

          <section className="rounded-md border border-white/10 bg-zinc-900/75 p-5">
            <h2 className="text-lg font-semibold text-zinc-100">Unlocked Preview</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {unlocked.length
                ? unlocked.map((badge) => badge.badgeName).join(", ")
                : "No unlocked badges yet."}
            </p>
          </section>
        </div>
      )}
    </AppShell>
  );
}
