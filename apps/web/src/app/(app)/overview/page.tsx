import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { TASK_STATUS_COPY } from "@/lib/ui/copy";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type OverviewPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isDueSoon(dueDate: string | undefined, now: Date) {
  if (!dueDate) return false;
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return false;
  const diff = due - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= 3 * dayMs;
}

function isOverdue(dueDate: string | undefined, now: Date) {
  if (!dueDate) return false;
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return false;
  return due < now.getTime();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  if (!workspaceId) {
    return (
      <main className="space-y-8">
        <header className="border-b border-[var(--line-default)] pb-5">
          <p className="page-kicker">요약</p>
          <h1 className="page-title">팀 운영 요약</h1>
          <p className="page-subtitle">
            워크스페이스가 연결되지 않아 요약 데이터를 표시할 수 없습니다.
          </p>
        </header>
        <p className="empty-note">
          설정 페이지에서 워크스페이스를 준비한 뒤 다시 확인해 주세요.
        </p>
      </main>
    );
  }

  const store = await getRuntimeCollabStore();
  const [tasks, goals, docs, insights, memberships, cycles] = await Promise.all([
    store.listTasksByWorkspace(workspaceId),
    store.listGoalsByWorkspace(workspaceId),
    store.listDocsByWorkspace(workspaceId),
    store.getInsights(workspaceId),
    store.listMembershipsByWorkspace(workspaceId),
    workspaceContext.canViewAdmin
      ? store.listPerformanceCyclesByWorkspace(workspaceId)
      : Promise.resolve([]),
  ]);

  const now = new Date();
  const overdueCount = tasks.filter(
    (task) => task.status !== "done" && isOverdue(task.dueDate, now)
  ).length;
  const dueSoonCount = tasks.filter(
    (task) => task.status !== "done" && isDueSoon(task.dueDate, now)
  ).length;
  const blockedCount = tasks.filter((task) => Boolean(task.isBlocked)).length;
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const sprintCount = new Set(
    tasks.map((task) => task.sprintKey).filter((value): value is string => Boolean(value))
  ).size;
  const totalTaskCount = tasks.length;
  const completionRate =
    totalTaskCount === 0 ? 0 : Math.round((doneCount / totalTaskCount) * 100);

  const statusDistribution = [
    {
      status: "todo",
      label: TASK_STATUS_COPY.todo,
      count: todoCount,
      tone: "warn" as const,
    },
    {
      status: "in_progress",
      label: TASK_STATUS_COPY.in_progress,
      count: inProgressCount,
      tone: "success" as const,
    },
    {
      status: "done",
      label: TASK_STATUS_COPY.done,
      count: doneCount,
      tone: "default" as const,
    },
  ].map((item) => ({
    ...item,
    ratio: totalTaskCount === 0 ? 0 : Math.round((item.count / totalTaskCount) * 100),
  }));

  const doneSeries = Array.from({ length: 7 }).map((_, index) => {
    const target = new Date(now);
    target.setDate(now.getDate() - (6 - index));
    const dayStart = startOfDay(target);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const count = tasks.filter((task) => {
      if (task.status !== "done") return false;
      const updated = new Date(task.updatedAt).getTime();
      return updated >= dayStart.getTime() && updated < dayEnd.getTime();
    }).length;

    return {
      label: formatDayLabel(target),
      count,
    };
  });

  const peakDoneCount = Math.max(1, ...doneSeries.map((item) => item.count));
  const blockedBySprint = Array.from(
    tasks
      .filter((task) => Boolean(task.isBlocked))
      .reduce((acc, task) => {
        const key = task.sprintKey?.trim() || "스프린트 미지정";
        acc.set(key, (acc.get(key) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
      .entries()
  )
    .map(([sprintKey, count]) => ({ sprintKey, count }))
    .sort((a, b) => b.count - a.count);

  const roleCounter = memberships.reduce(
    (acc, membership) => {
      acc[membership.role] += 1;
      return acc;
    },
    { owner: 0, admin: 0, member: 0 }
  );

  const topContributors = insights.contribution.slice(0, 5);

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">요약</p>
        <h1 className="page-title">팀 운영 요약</h1>
        <p className="page-subtitle">
          실행, 마감 위험, 협업 기여도를 한 화면에서 확인합니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">진행 중 작업</p>
          <p className="kpi-value">{inProgressCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">완료 작업</p>
          <p className="kpi-value">{doneCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">임박/지연</p>
          <p className="kpi-value">
            {dueSoonCount} / {overdueCount}
          </p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">블로커 작업</p>
          <p className="kpi-value">{blockedCount}</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="section-shell">
          <div className="section-head">
            <h2 className="section-title">실행 리포트</h2>
            <span className="chip">Jira형 보고</span>
          </div>
          <ul className="space-y-3">
            {statusDistribution.map((item) => (
              <li key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-[var(--ink-strong)]">{item.label}</p>
                  <p className="text-[var(--ink-subtle)]">
                    {item.count}건 · {item.ratio}%
                  </p>
                </div>
                <div className="progress-track">
                  <span className="progress-fill" style={{ width: `${item.ratio}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">전체 완료율</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {completionRate}%
              </p>
            </article>
            <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">임박+지연 위험도</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {dueSoonCount + overdueCount}건
              </p>
            </article>
          </div>
        </article>

        <article className="section-shell">
          <div className="section-head">
            <h2 className="section-title">최근 7일 완료 추이</h2>
            <span className="chip">완료 추세</span>
          </div>
          <ul className="space-y-2">
            {doneSeries.map((item) => (
              <li key={item.label} className="grid grid-cols-[3rem_1fr_2.6rem] items-center gap-2">
                <span className="text-xs text-[var(--ink-subtle)]">{item.label}</span>
                <div className="progress-track">
                  <span
                    className="progress-fill"
                    style={{ width: `${Math.round((item.count / peakDoneCount) * 100)}%` }}
                  />
                </div>
                <span className="text-right text-xs font-semibold text-[var(--ink-default)]">
                  {item.count}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[var(--line-soft)] pt-3">
            <p className="text-xs text-[var(--ink-subtle)]">스프린트별 블로커 집중도</p>
            {blockedBySprint.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--ink-muted)]">블로커가 없습니다.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {blockedBySprint.slice(0, 4).map((item) => (
                  <li key={item.sprintKey} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-default)]">{item.sprintKey}</span>
                    <span className="status-chip" data-tone="warn">
                      {item.count}건
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <article className="section-shell">
          <div className="section-head">
            <h2 className="section-title">팀 상태</h2>
            <span className="chip">실시간 요약</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">역할 분포</p>
              <p className="mt-2 text-sm text-[var(--ink-default)]">
                오너 {roleCounter.owner} · 관리자 {roleCounter.admin} · 구성원 {roleCounter.member}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">스프린트 수</p>
              <p className="mt-2 text-sm text-[var(--ink-default)]">{sprintCount}개</p>
            </div>
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">목표 수</p>
              <p className="mt-2 text-sm text-[var(--ink-default)]">{goals.length}개</p>
            </div>
            <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">문서 수</p>
              <p className="mt-2 text-sm text-[var(--ink-default)]">{docs.length}건</p>
            </div>
          </div>
        </article>

        <article className="section-shell">
          <div className="section-head">
            <h2 className="section-title">기여도 상위</h2>
            <span className="chip">인사이트</span>
          </div>
          {topContributors.length === 0 ? (
            <p className="empty-note">집계할 활동이 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {topContributors.map((member) => (
                <li
                  key={member.userId}
                  className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2"
                >
                  <p className="text-sm font-semibold text-[var(--ink-strong)]">
                    {member.userId}
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                    기여 점수 {member.contributionScore.toFixed(4)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {workspaceContext.canViewAdmin && (
        <section className="section-shell">
          <div className="section-head">
            <h2 className="section-title">관리자 참고</h2>
            <span className="chip">권한 기반</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">평가 주기 수</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {cycles.length}개
              </p>
            </article>
            <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">주간 완료 작업</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {insights.weeklyDoneTaskCount}건
              </p>
            </article>
            <article className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3">
              <p className="text-xs text-[var(--ink-subtle)]">목표 달성률</p>
              <p className="mt-2 text-sm font-semibold text-[var(--ink-strong)]">
                {insights.goalAchievementRate}%
              </p>
            </article>
          </div>
        </section>
      )}
    </main>
  );
}
