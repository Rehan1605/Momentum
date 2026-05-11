import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function HabitsPage() {
  return (
    <AppShell
      title="Habits"
      description="Create, edit, pause, resume, and organize habits by category and schedule."
    >
      <PlaceholderPanel eyebrow="Habit management" title="Habits placeholder">
        Forms and habit lists will connect to the protected /api/habits endpoints.
      </PlaceholderPanel>
    </AppShell>
  );
}
