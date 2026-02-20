const METRICS = [
  { label: "Weekly Done Tasks", value: "-" },
  { label: "Goal Achievement Rate", value: "-" },
  { label: "Upcoming Due", value: "-" },
] as const;

export default function InsightsPage() {
  return (
    <main className="space-y-6">
      <header className="surface-card px-6 py-7 md:px-8">
        <p className="page-kicker">Performance</p>
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">
          Weekly performance, goal progress, and contribution transparency.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {METRICS.map((metric) => (
          <article key={metric.label} className="surface-card p-5">
            <h2 className="text-sm text-slate-500">{metric.label}</h2>
            <p className="stat-value">{metric.value}</p>
          </article>
        ))}
      </section>

      <section className="surface-card p-6">
        <h2 className="section-title">Contribution Snapshot</h2>
        <p className="muted-copy mt-2 text-sm">
          팀원별 기여도 점수와 원본 지표는 API 연동 후 이 영역에 표시됩니다.
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-slate-500">
          No contribution data yet
        </div>
      </section>
    </main>
  );
}
