export default function GoalsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Goals & Key Results</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track semester goals with measurable key results and weekly progress.
        </p>
      </header>

      <section className="rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-medium">No goals yet</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create your first goal and attach key results to monitor execution.
        </p>
      </section>
    </main>
  );
}
