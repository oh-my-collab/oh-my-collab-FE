import { DOC_TEMPLATES } from "@/lib/docs/templates";
import type { Doc } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type DocsPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatDateTimeLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

function countUpdatedThisWeek(docs: Doc[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  return docs.filter(
    (doc) => new Date(doc.updatedAt).getTime() >= oneWeekAgo.getTime()
  ).length;
}

function getTemplateTitle(templateKey: Doc["templateKey"]) {
  if (templateKey === "custom") return "사용자 정의";
  return DOC_TEMPLATES[templateKey].title;
}

export default async function DocsPage({ searchParams }: DocsPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  let docs: Doc[] = [];
  if (workspaceId) {
    const store = await getRuntimeCollabStore();
    docs = await store.listDocsByWorkspace(workspaceId);
  }

  const sortedDocs = [...docs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const templateEntries = Object.entries(DOC_TEMPLATES);
  const updatedThisWeek = countUpdatedThisWeek(sortedDocs);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">문서</p>
        <h1 className="page-title">협업 문서 운영</h1>
        <p className="page-subtitle">
          문서 작성 이력과 템플릿 기준을 함께 관리합니다. 문서 변경 기록은 평가
          증거팩의 문서 활동 지표로 자동 반영됩니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">전체 문서</p>
          <p className="kpi-value">{sortedDocs.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">주간 업데이트</p>
          <p className="kpi-value">{updatedThisWeek}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">템플릿 수</p>
          <p className="kpi-value">{templateEntries.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">워크스페이스</p>
          <p className="kpi-value text-base">{workspaceId ?? "-"}</p>
        </article>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">문서 목록</h2>
          <span className="chip">읽기 연동</span>
        </div>

        {!workspaceId ? (
          <p className="empty-note">
            조회 가능한 워크스페이스가 없습니다. 설정 화면에서 워크스페이스를 먼저
            생성해 주세요.
          </p>
        ) : sortedDocs.length === 0 ? (
          <p className="empty-note">
            등록된 문서가 없습니다. API를 통해 문서를 생성하면 자동 반영됩니다.
          </p>
        ) : (
          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>문서 제목</th>
                  <th>템플릿</th>
                  <th>최근 수정</th>
                  <th>수정자</th>
                </tr>
              </thead>
              <tbody>
                {sortedDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <p className="font-semibold text-[var(--ink-strong)]">{doc.title}</p>
                    </td>
                    <td>{getTemplateTitle(doc.templateKey)}</td>
                    <td>{formatDateTimeLabel(doc.updatedAt)}</td>
                    <td>{doc.updatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">문서 템플릿 가이드</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {templateEntries.map(([templateKey, template]) => (
            <article
              key={templateKey}
              className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3"
            >
              <p className="text-sm font-semibold text-[var(--ink-strong)]">{template.title}</p>
              <p className="mt-1 text-xs text-[var(--ink-subtle)]">키: {templateKey}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
