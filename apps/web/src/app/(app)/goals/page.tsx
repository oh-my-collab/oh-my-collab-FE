const ROADMAP = [
  {
    goal: "온보딩 전환율 개선",
    owner: "PM",
    targetDate: "2026-03-15",
    progress: 62,
  },
  {
    goal: "작업 API 안정화",
    owner: "Backend",
    targetDate: "2026-03-08",
    progress: 47,
  },
  {
    goal: "운영 문서 체계화",
    owner: "Ops",
    targetDate: "2026-03-22",
    progress: 71,
  },
] as const;

export default function GoalsPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Planning
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Goals &amp; Key Results
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          목표와 KR 진행률을 한 화면에서 추적합니다. 주기별 변경 이력은 관리자 평가 참고
          자료로 자동 반영됩니다.
        </p>
      </header>

      <section className="overflow-x-auto border border-[var(--border)] bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Goal</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Target Date</th>
              <th className="px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {ROADMAP.map((item) => (
              <tr key={item.goal} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-medium text-slate-900">{item.goal}</td>
                <td className="px-4 py-3 text-slate-700">{item.owner}</td>
                <td className="px-4 py-3 text-slate-600">{item.targetDate}</td>
                <td className="px-4 py-3">
                  <div className="w-full max-w-xs">
                    <div className="h-2 w-full overflow-hidden rounded bg-slate-200">
                      <span
                        className="block h-full bg-blue-600"
                        style={{ width: `${item.progress}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.progress}%</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
