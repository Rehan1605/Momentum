"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function RouteGuard({ children }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = getToken();

    if (token) {
      setAuthenticated(true);
    } else {
      router.replace("/login");
    }

    setMounted(true);
  }, [router]);

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading Momentum...
      </main>
    );
  }

  if (!authenticated) return null;

  return children;
}