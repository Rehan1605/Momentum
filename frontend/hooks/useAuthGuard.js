"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";

export function useAuthGuard() {
  const router = useRouter();
  const [authenticated] = useState(() => isAuthenticated());

  useEffect(() => {
    if (!authenticated) {
      router.replace("/login");
    }
  }, [authenticated, router]);

  return authenticated;
}
