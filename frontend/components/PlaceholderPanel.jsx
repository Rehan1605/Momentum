export default function PlaceholderPanel({ eyebrow, title, children }) {
  return (
    <section className="rounded-md border border-white/10 bg-zinc-900/70 p-5 shadow-2xl shadow-black/20">
      <p className="text-xs font-medium uppercase text-cyan-300">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-zinc-100">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{children}</p>
    </section>
  );
}
