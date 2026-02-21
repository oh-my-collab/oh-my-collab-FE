const TEAM_HEALTH = [
  { team: "Backend", docs: 4, done: 7, goals: 5, status: "On Track" },
  { team: "Frontend", docs: 6, done: 5, goals: 4, status: "Watch" },
  { team: "Ops", docs: 2, done: 3, goals: 3, status: "On Track" },
] as const;

export default function InsightsPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Insights</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          작업, 문서, 목표 업데이트를 주기 단위로 집계해 팀 운영 신호를 제공합니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          ["Weekly Done Tasks", "15"],
          ["Goal Achievement Rate", "68%"],
          ["Review Drafts", "4"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-xs uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="overflow-x-auto border border-[var(--border)] bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Docs</th>
              <th className="px-4 py-3">Done Tasks</th>
              <th className="px-4 py-3">Goal Updates</th>
              <th className="px-4 py-3">Health</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_HEALTH.map((item) => (
              <tr key={item.team} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-medium text-slate-900">{item.team}</td>
                <td className="px-4 py-3 text-slate-700">{item.docs}</td>
                <td className="px-4 py-3 text-slate-700">{item.done}</td>
                <td className="px-4 py-3 text-slate-700">{item.goals}</td>
                <td className="px-4 py-3">
                  <span className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
