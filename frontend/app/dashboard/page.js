import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      description="Your score, streaks, best habits, and recent progress will live here."
    >
      <PlaceholderPanel eyebrow="Overview" title="Dashboard foundation ready">
        Analytics cards and charts will connect to the Phase 5 stats endpoints in the next frontend pass.
      </PlaceholderPanel>
    </AppShell>
  );
}
