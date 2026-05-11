"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function RouteGuard({ children }) {
  const ready = useAuthGuard();

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking session...</p>
      </main>
    );
  }

  return children;
}
