import { DOC_TEMPLATES } from "@/lib/docs/templates";

export default function DocsPage() {
  return (
    <main className="space-y-6">
      <header className="surface-card px-6 py-7 md:px-8">
        <p className="page-kicker">Documentation</p>
        <h1 className="page-title">Team Docs</h1>
        <p className="page-subtitle">
          Meeting notes, weekly reports, and retrospectives in one place.
        </p>
      </header>

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title">Templates</h2>
          <button type="button" className="btn-secondary">
            New Document
          </button>
        </div>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.entries(DOC_TEMPLATES).map(([key, template]) => (
            <li key={key} className="surface-card-muted p-4">
              <p className="section-title text-base">{template.title}</p>
              <p className="muted-copy mt-1 text-xs">template: {key}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
