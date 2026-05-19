"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";

export default function AuthRedirect({ children }) {
  const router = useRouter();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, router]);

  if (authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Opening dashboard...</p>
      </main>
    );
  }

  return children;
}
