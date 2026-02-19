const COLUMNS = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function TasksPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Kanban Tasks</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage team priorities with assignees, due dates, and progress states.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((column) => (
          <article key={column.key} className="rounded-xl border border-slate-200 p-4">
            <h2 className="mb-3 text-lg font-medium">{column.label}</h2>
            <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              No tasks yet
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
