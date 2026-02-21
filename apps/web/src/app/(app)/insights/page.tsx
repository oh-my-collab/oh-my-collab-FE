import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type InsightsPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function calcTone(score: number) {
  if (score >= 0.67) return "success";
  if (score >= 0.34) return "warn";
  return "danger";
}

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  const summary = workspaceId
    ? await (await getRuntimeCollabStore()).getInsights(workspaceId)
    : null;

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">인사이트</p>
        <h1 className="page-title">운영 신호 대시보드</h1>
        <p className="page-subtitle">
          작업 완료, 목표 진척, 협업 기여도를 주기 단위로 확인합니다. 이 화면의 지표는
          관리자 리뷰에서 참고용 데이터로 활용됩니다.
        </p>
      </header>

      {!summary ? (
        <p className="empty-note">
          조회 가능한 워크스페이스가 없습니다. 설정 화면에서 워크스페이스를 준비한 뒤
          다시 확인해 주세요.
        </p>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="kpi-card">
              <p className="kpi-label">주간 완료 작업</p>
              <p className="kpi-value">{summary.weeklyDoneTaskCount}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">목표 달성률</p>
              <p className="kpi-value">{summary.goalAchievementRate}%</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">마감 임박 작업</p>
              <p className="kpi-value">{summary.upcomingDueCount}</p>
            </article>
            <article className="kpi-card">
              <p className="kpi-label">기여 구성원</p>
              <p className="kpi-value">{summary.contribution.length}</p>
            </article>
          </section>

          <section className="section-shell">
            <div className="section-head">
              <h2 className="section-title">구성원 기여도</h2>
              <span className="chip">관리자 참고</span>
            </div>

            {summary.contribution.length === 0 ? (
              <p className="empty-note">
                집계할 활동이 없습니다. 작업 완료/문서 수정/목표 업데이트가 누적되면
                자동으로 표시됩니다.
              </p>
            ) : (
              <div className="list-table-wrap">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th>구성원</th>
                      <th>기여 점수</th>
                      <th>작업</th>
                      <th>문서</th>
                      <th>목표</th>
                      <th>협업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.contribution.map((member) => (
                      <tr key={member.userId}>
                        <td className="font-semibold text-[var(--ink-strong)]">{member.userId}</td>
                        <td>
                          <span className="status-chip" data-tone={calcTone(member.contributionScore)}>
                            {member.contributionScore.toFixed(4)}
                          </span>
                        </td>
                        <td>{member.raw.taskScore}</td>
                        <td>{member.raw.docsScore}</td>
                        <td>{member.raw.goalScore}</td>
                        <td>{member.raw.collabScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
