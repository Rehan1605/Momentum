import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function MoodPage() {
  return (
    <AppShell
      title="Mood + Journal"
      description="One daily mood entry and one journal entry, both scoped to your account."
    >
      <PlaceholderPanel eyebrow="Wellbeing" title="Mood and journal placeholder">
        This route will connect to /api/mood and /api/journal.
      </PlaceholderPanel>
    </AppShell>
  );
}
