import type { Goal, KeyResult } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type GoalsPageProps = {
  searchParams: Promise<SearchParams>;
};

type GoalRow = {
  goal: Goal;
  keyResults: KeyResult[];
  progress: number;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function formatDateLabel(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function calcProgress(keyResults: KeyResult[]) {
  if (keyResults.length === 0) return 0;
  const total = keyResults.reduce((sum, keyResult) => sum + keyResult.progress, 0);
  return Math.round((total / keyResults.length) * 100) / 100;
}

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  let goalRows: GoalRow[] = [];
  if (workspaceId) {
    const store = await getRuntimeCollabStore();
    const goals = await store.listGoalsByWorkspace(workspaceId);
    goalRows = await Promise.all(
      goals.map(async (goal) => {
        const keyResults = await store.listKeyResultsByGoal(workspaceId, goal.id);
        return {
          goal,
          keyResults,
          progress: calcProgress(keyResults),
        };
      })
    );
  }

  const totalGoals = goalRows.length;
  const totalKeyResults = goalRows.reduce((sum, row) => sum + row.keyResults.length, 0);
  const averageProgress =
    totalKeyResults === 0
      ? 0
      : Math.round(
          (goalRows.reduce((sum, row) => sum + row.progress, 0) / Math.max(totalGoals, 1)) *
            100
        ) / 100;
  const doneGoals = goalRows.filter((row) => row.progress >= 100).length;

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">계획</p>
        <h1 className="page-title">목표 및 핵심 결과</h1>
        <p className="page-subtitle">
          목표와 KR 진척을 한 화면에서 관리합니다. 변경 이력은 평가 주기의 정량 참고
          지표로 누적됩니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">목표 수</p>
          <p className="kpi-value">{totalGoals}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">KR 수</p>
          <p className="kpi-value">{totalKeyResults}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">평균 진척률</p>
          <p className="kpi-value">{averageProgress}%</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">완료 목표</p>
          <p className="kpi-value">{doneGoals}</p>
        </article>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">목표 요약</h2>
          <span className="chip">읽기 연동</span>
        </div>

        {!workspaceId ? (
          <p className="empty-note">
            조회 가능한 워크스페이스가 없습니다. 설정 페이지에서 워크스페이스를 먼저
            준비해 주세요.
          </p>
        ) : goalRows.length === 0 ? (
          <p className="empty-note">
            등록된 목표가 없습니다. API를 통해 목표와 KR을 생성하면 자동으로 반영됩니다.
          </p>
        ) : (
          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>목표</th>
                  <th>담당</th>
                  <th>목표일</th>
                  <th>KR 수</th>
                  <th>진척률</th>
                </tr>
              </thead>
              <tbody>
                {goalRows.map((row) => (
                  <tr key={row.goal.id}>
                    <td>
                      <p className="font-semibold text-[var(--ink-strong)]">{row.goal.title}</p>
                      {row.goal.description && (
                        <p className="mt-1 text-xs text-[var(--ink-subtle)]">{row.goal.description}</p>
                      )}
                    </td>
                    <td>{row.goal.createdBy}</td>
                    <td>{formatDateLabel(row.goal.targetDate)}</td>
                    <td>{row.keyResults.length}</td>
                    <td>
                      <div className="max-w-[180px]">
                        <div className="progress-track">
                          <span
                            className="progress-fill"
                            style={{ width: `${Math.min(100, row.progress)}%` }}
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-1 text-xs text-[var(--ink-subtle)]">{row.progress}%</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {goalRows.length > 0 && (
        <section className="section-shell">
          <div className="section-head">
            <h2 className="section-title">핵심 결과 상세</h2>
          </div>
          <div className="space-y-3">
            {goalRows.map((row) => (
              <article key={row.goal.id} className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
                <h3 className="text-sm font-semibold text-[var(--ink-strong)]">{row.goal.title}</h3>
                {row.keyResults.length === 0 ? (
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">등록된 KR이 없습니다.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {row.keyResults.map((keyResult) => (
                      <li
                        key={keyResult.id}
                        className="rounded-lg border border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-2"
                      >
                        <p className="text-sm font-medium text-[var(--ink-default)]">
                          {keyResult.title}
                        </p>
                        <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                          지표 {keyResult.metric} · 목표 {keyResult.targetValue} · 현재{" "}
                          {keyResult.currentValue}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
