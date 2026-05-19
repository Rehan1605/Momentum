"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  Gauge,
  HeartPulse,
  ListChecks,
  LogOut,
  Medal,
  Settings,
  Target,
} from "lucide-react";

import RouteGuard from "@/components/RouteGuard";
import { removeToken } from "@/lib/auth";
import api from "@/services/api";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Today", href: "/today", icon: CalendarCheck },
  { label: "Habits", href: "/habits", icon: ListChecks },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Mood + Journal", href: "/mood", icon: HeartPulse },
  { label: "Achievements", href: "/achievements", icon: Medal },
  { label: "AI Coach", href: "/ai", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function AppShell({ title, description, children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Stateless JWT logout is local-first; backend call is best effort.
    } finally {
      removeToken();
      router.replace("/login");
    }
  };

  return (
    <RouteGuard>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-zinc-950/95 px-4 py-5 lg:block">
            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="flex size-10 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
                <Target className="size-5" />
              </div>
              <div>
                <p className="text-base font-semibold">Momentum</p>
                <p className="text-xs text-zinc-500">Local habit OS</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                      active
                        ? "bg-emerald-400 text-zinc-950"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/90 px-4 py-3 backdrop-blur md:px-6 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
                  <Target className="size-4" />
                </div>
                <p className="font-semibold">Momentum</p>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs ${
                        active
                          ? "bg-emerald-400 text-zinc-950"
                          : "bg-white/5 text-zinc-300"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-white/5 px-3 text-xs text-zinc-300"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </button>
              </nav>
            </header>

            <main className="flex-1 bg-[linear-gradient(180deg,#0a0a0a_0%,#101312_100%)] px-4 py-6 md:px-8 lg:px-10">
              <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex flex-col gap-2">
                  <p className="text-xs font-medium uppercase text-emerald-300">
                    Momentum
                  </p>
                  <h1 className="text-3xl font-semibold text-zinc-50 md:text-4xl">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </div>
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
