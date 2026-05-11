import AppShell from "@/components/AppShell";
import PlaceholderPanel from "@/components/PlaceholderPanel";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Account preferences, local backend connection, and app configuration."
    >
      <PlaceholderPanel eyebrow="Preferences" title="Settings placeholder">
        User and app settings will be added after the core workflows are connected.
      </PlaceholderPanel>
    </AppShell>
  );
}
