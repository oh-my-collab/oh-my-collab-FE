import { DOC_TEMPLATES } from "@/lib/docs/templates";

const REVIEW_QUEUE = [
  { title: "Sprint retrospective", owner: "PM", status: "In Review" },
  { title: "API changelog", owner: "Backend", status: "To Do" },
  { title: "Release report", owner: "Ops", status: "Ready" },
] as const;

export default function DocsPage() {
  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--border)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">
          Documentation
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Team Docs</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          문서 작성 이력과 리뷰 상태를 관리합니다. 문서 업데이트 활동은 평가 증거팩에
          자동으로 집계됩니다.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Templates</h2>
            <button
              type="button"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              New Document
            </button>
          </div>

          <div className="overflow-x-auto border border-[var(--border)] bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Key</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(DOC_TEMPLATES).map(([key, template]) => (
                  <tr key={key} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-medium text-slate-900">{template.title}</td>
                    <td className="px-4 py-3 text-slate-600">{key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Review Queue</h2>
          <ul className="space-y-2">
            {REVIEW_QUEUE.map((item) => (
              <li key={item.title} className="rounded border border-[var(--border)] bg-white px-3 py-2">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{item.owner}</p>
                <span className="mt-2 inline-flex rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
