import Link from "next/link";

import type { Task } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type DeadlinesPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getDueTimestamp(task: Task) {
  if (!task.dueDate) return undefined;
  const time = new Date(task.dueDate).getTime();
  return Number.isNaN(time) ? undefined : time;
}

function formatDate(iso?: string) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function buildFilterHref(
  workspaceId: string,
  filters: Record<string, string | undefined>
) {
  const query = new URLSearchParams();
  query.set("workspaceId", workspaceId);
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  return `/deadlines?${query.toString()}`;
}

export default async function DeadlinesPage({ searchParams }: DeadlinesPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  const assigneeFilter = pickSingleParam(resolvedParams.assigneeId);
  const priorityFilter = pickSingleParam(resolvedParams.priority);
  const statusFilter = pickSingleParam(resolvedParams.status);
  const sprintFilter = pickSingleParam(resolvedParams.sprintKey);

  if (!workspaceId) {
    return (
      <main className="space-y-8">
        <header className="border-b border-[var(--line-default)] pb-5">
          <p className="page-kicker">마감</p>
          <h1 className="page-title">데드라인 대시보드</h1>
          <p className="page-subtitle">
            워크스페이스를 찾을 수 없어 마감 현황을 표시할 수 없습니다.
          </p>
        </header>
        <p className="empty-note">설정 페이지에서 워크스페이스를 먼저 준비해 주세요.</p>
      </main>
    );
  }

  const store = await getRuntimeCollabStore();
  const tasks = await store.listTasksByWorkspace(workspaceId);

  const filteredTasks = tasks.filter((task) => {
    if (assigneeFilter && task.assigneeId !== assigneeFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (sprintFilter && task.sprintKey !== sprintFilter) return false;
    return true;
  });

  const now = Date.now();
  const fourteenDays = now + 14 * 24 * 60 * 60 * 1000;
  const dueTasks = filteredTasks
    .map((task) => ({ task, due: getDueTimestamp(task) }))
    .filter((item): item is { task: Task; due: number } => typeof item.due === "number")
    .sort((a, b) => a.due - b.due);

  const overdue = dueTasks.filter(
    ({ task, due }) => task.status !== "done" && due < now
  );
  const dueSoon = dueTasks.filter(
    ({ task, due }) => task.status !== "done" && due >= now && due <= now + 3 * 24 * 60 * 60 * 1000
  );
  const inWindow = dueTasks.filter(({ due }) => due >= now && due <= fourteenDays);

  const assignees = Array.from(
    new Set(tasks.map((task) => task.assigneeId).filter((item): item is string => Boolean(item)))
  );
  const sprints = Array.from(
    new Set(tasks.map((task) => task.sprintKey).filter((item): item is string => Boolean(item)))
  );

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">마감</p>
        <h1 className="page-title">데드라인 대시보드</h1>
        <p className="page-subtitle">
          14일 마감 타임라인과 위험군(지연/임박/블로커)을 함께 추적합니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">조회 작업</p>
          <p className="kpi-value">{filteredTasks.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">지연</p>
          <p className="kpi-value">{overdue.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">D-3 이내</p>
          <p className="kpi-value">{dueSoon.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">블로커</p>
          <p className="kpi-value">{filteredTasks.filter((task) => task.isBlocked).length}</p>
        </article>
      </section>

      <section className="section-shell space-y-4">
        <div className="section-head">
          <h2 className="section-title">필터</h2>
          <Link
            href={buildFilterHref(workspaceId, {})}
            className="btn-secondary py-1.5 text-xs"
          >
            필터 초기화
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip">담당자</span>
          {assignees.map((assigneeId) => (
            <Link
              key={assigneeId}
              href={buildFilterHref(workspaceId, {
                assigneeId,
                priority: priorityFilter,
                status: statusFilter,
                sprintKey: sprintFilter,
              })}
              className="btn-secondary py-1.5 text-xs"
            >
              {assigneeId}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="chip">스프린트</span>
          {sprints.map((sprintKey) => (
            <Link
              key={sprintKey}
              href={buildFilterHref(workspaceId, {
                sprintKey,
                assigneeId: assigneeFilter,
                priority: priorityFilter,
                status: statusFilter,
              })}
              className="btn-secondary py-1.5 text-xs"
            >
              {sprintKey}
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">14일 타임라인</h2>
          <span className="chip">{inWindow.length}건</span>
        </div>
        {inWindow.length === 0 ? (
          <p className="empty-note">14일 내 마감 작업이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {inWindow.map(({ task }) => (
              <li
                key={task.id}
                className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2"
              >
                <p className="text-sm font-semibold text-[var(--ink-strong)]">{task.title}</p>
                <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                  마감 {formatDate(task.dueDate)} · 담당 {task.assigneeId ?? "-"} · 우선순위{" "}
                  {task.priority}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section-shell">
        <div className="section-head">
          <h2 className="section-title">위험 목록</h2>
          <span className="chip">지연 + 블로커</span>
        </div>
        {overdue.length === 0 && filteredTasks.every((task) => !task.isBlocked) ? (
          <p className="empty-note">현재 위험 항목이 없습니다.</p>
        ) : (
          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>작업</th>
                  <th>상태</th>
                  <th>마감일</th>
                  <th>블로커</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks
                  .filter((task) => task.isBlocked || isOverdue(task.dueDate, new Date()))
                  .map((task) => (
                    <tr key={task.id}>
                      <td className="font-semibold text-[var(--ink-strong)]">{task.title}</td>
                      <td>{task.status}</td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>{task.isBlocked ? task.blockedReason ?? "사유 미입력" : "-"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
