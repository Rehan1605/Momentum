import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function AnalyticsPage() {
  return (
    <AppShell
      title="Analytics"
      description="Weekly completion, category breakdowns, streaks, and heatmap data."
    >
      <PlaceholderPanel eyebrow="Insights" title="Analytics placeholder">
        Recharts visualizations will be layered over the stats and heatmap endpoints.
      </PlaceholderPanel>
    </AppShell>
  );
}
