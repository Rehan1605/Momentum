import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function AchievementsPage() {
  return (
    <AppShell
      title="Achievements"
      description="Unlocked badges and future milestones based on your real habit performance."
    >
      <PlaceholderPanel eyebrow="Badges" title="Achievements placeholder">
        Badge cards will connect to /api/badges and /api/badges/unlocked.
      </PlaceholderPanel>
    </AppShell>
  );
}
