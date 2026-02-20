const METRICS = [
  { label: "Active goals", value: "-" },
  { label: "Average progress", value: "-" },
  { label: "At-risk goals", value: "-" },
] as const;

export default function GoalsPage() {
  return (
    <main className="space-y-6">
      <header className="surface-card px-6 py-7 md:px-8">
        <p className="page-kicker">Goal Tracking</p>
        <h1 className="page-title">Goals & Key Results</h1>
        <p className="page-subtitle">
          Track semester goals with measurable key results and weekly progress.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <article key={metric.label} className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <p className="stat-value">{metric.value}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="surface-card p-6">
        <span className="chip">Goal Board</span>
        <h2 className="section-title mt-3">No goals yet</h2>
        <p className="muted-copy mt-2 text-sm">
          Create your first goal and attach key results to monitor execution.
        </p>
      </section>
    </main>
  );
}
