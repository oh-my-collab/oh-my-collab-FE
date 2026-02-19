export default function InsightsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Insights</h1>
        <p className="mt-2 text-sm text-slate-600">
          Weekly performance, goal progress, and contribution transparency.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm text-slate-500">Weekly Done Tasks</h2>
          <p className="mt-2 text-2xl font-semibold">-</p>
        </article>
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm text-slate-500">Goal Achievement Rate</h2>
          <p className="mt-2 text-2xl font-semibold">-</p>
        </article>
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm text-slate-500">Upcoming Due</h2>
          <p className="mt-2 text-2xl font-semibold">-</p>
        </article>
      </section>
    </main>
  );
}
