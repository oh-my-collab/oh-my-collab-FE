const COLUMNS = [
  {
    key: "todo",
    label: "To do",
    description: "아직 시작하지 않은 작업을 우선순위로 정리합니다.",
  },
  {
    key: "in_progress",
    label: "In progress",
    description: "현재 담당자가 진행 중인 작업을 추적합니다.",
  },
  {
    key: "done",
    label: "Done",
    description: "완료된 결과물을 검토하고 기록을 남깁니다.",
  },
];

const SUMMARY = [
  { label: "Open tasks", value: "-" },
  { label: "Due this week", value: "-" },
  { label: "Blocked", value: "-" },
] as const;

export default function TasksPage() {
  return (
    <main className="space-y-6">
      <header className="surface-card px-6 py-7 md:px-8">
        <p className="page-kicker">Task Board</p>
        <h1 className="page-title">Kanban Tasks</h1>
        <p className="page-subtitle">
          Manage team priorities with assignees, due dates, and progress states.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {SUMMARY.map((item) => (
            <article key={item.label} className="rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="stat-value">{item.value}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        {COLUMNS.map((column) => (
          <article key={column.key} className="surface-card p-5">
            <span className="chip">{column.key.replace("_", " ")}</span>
            <h2 className="section-title mt-3">{column.label}</h2>
            <p className="muted-copy mt-2 text-sm">{column.description}</p>
            <div className="mt-4 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center text-sm text-slate-500">
              No tasks yet
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
