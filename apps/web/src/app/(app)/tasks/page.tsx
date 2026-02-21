const BOARD_COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
] as const;

const TASK_SAMPLES = [
  {
    id: "task-001",
    title: "요구사항 정리 문서 업데이트",
    assignee: "PM",
    due: "2026-02-23",
    status: "todo",
  },
  {
    id: "task-002",
    title: "API 계약 검토 및 스키마 확정",
    assignee: "Backend",
    due: "2026-02-24",
    status: "in_progress",
  },
  {
    id: "task-003",
    title: "배포 체크리스트 검증 완료",
    assignee: "Ops",
    due: "2026-02-20",
    status: "done",
  },
] as const;

export default function TasksPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Execution
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Tasks</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          팀의 실행 흐름을 보드와 목록으로 동시에 확인합니다. 진행 상태는 관리자 평가
          주기에서 참고 지표로 활용됩니다.
        </p>
      </header>

      <section className="overflow-x-auto border border-[var(--border)] bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {TASK_SAMPLES.map((task) => (
              <tr key={task.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-3 font-medium text-slate-900">{task.title}</td>
                <td className="px-4 py-3 text-slate-600">{task.assignee}</td>
                <td className="px-4 py-3 text-slate-600">{task.due}</td>
                <td className="px-4 py-3 text-slate-700">{task.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {BOARD_COLUMNS.map((column) => (
          <article key={column.key} className="rounded-lg border border-[var(--border)] bg-white p-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h2 className="text-sm font-semibold text-slate-900">{column.label}</h2>
              <span className="text-xs text-slate-500">
                {
                  TASK_SAMPLES.filter((item) => item.status === column.key).length
                }{" "}
                items
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {TASK_SAMPLES.filter((item) => item.status === column.key).map((item) => (
                <li key={item.id} className="rounded border border-[var(--border)] px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.assignee} · due {item.due}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
