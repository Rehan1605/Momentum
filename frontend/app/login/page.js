import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md rounded-md border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
        <p className="text-xs font-medium uppercase text-emerald-300">
          Momentum
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-50">Login</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Auth UI is intentionally not implemented yet. This page is the frontend foundation placeholder.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/register"
            className="rounded-md border border-white/10 px-4 py-2 text-sm text-zinc-200 hover:bg-white/5"
          >
            Register
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
