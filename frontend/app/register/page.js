import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-md rounded-md border border-white/10 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30">
        <p className="text-xs font-medium uppercase text-cyan-300">
          Momentum
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-50">Register</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Registration UI will be built in the auth UI phase. The backend connection utilities are ready.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-medium text-zinc-950"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
