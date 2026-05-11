import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function AICoachPage() {
  return (
    <AppShell
      title="AI Coach"
      description="Local Ollama-powered habit coaching, insights, and weekly summaries."
    >
      <PlaceholderPanel eyebrow="Local AI" title="AI coach placeholder">
        Chat and summary UI will connect to the future /api/ai endpoints.
      </PlaceholderPanel>
    </AppShell>
  );
}
