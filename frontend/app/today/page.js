import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function TodayPage() {
  return (
    <AppShell
      title="Today"
      description="A focused daily checklist for habits scheduled on the current day."
    >
      <PlaceholderPanel eyebrow="Daily tracking" title="Today view placeholder">
        Checkbox completion will connect to /api/logs/today and /api/logs/check.
      </PlaceholderPanel>
    </AppShell>
  );
}
