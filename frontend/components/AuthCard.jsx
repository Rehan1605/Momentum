import { Target } from "lucide-react";

export default function AuthCard({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground">
      <section className="w-full max-w-md rounded-md border border-white/10 bg-zinc-900/85 p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-md bg-emerald-400 text-zinc-950">
            <Target className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Momentum</p>
            <p className="text-xs text-zinc-500">Local habit dashboard</p>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-zinc-50">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
