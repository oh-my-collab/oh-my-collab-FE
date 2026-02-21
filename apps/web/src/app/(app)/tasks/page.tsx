import Link from "next/link";

import type { Task, TaskStatus } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { TASK_STATUS_COPY } from "@/lib/ui/copy";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";

type SearchParams = Record<string, string | string[] | undefined>;

type TasksPageProps = {
  searchParams: Promise<SearchParams>;
};

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

const PRIORITY_COPY: Record<Task["priority"], string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

const STATUS_TONE: Record<TaskStatus, "warn" | "danger" | "success"> = {
  todo: "warn",
  in_progress: "danger",
  done: "success",
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

function isOverdue(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  return new Date(task.dueDate).getTime() < now.getTime();
}

function isDueSoon(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  const diff = due - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= 3 * dayMs;
}

function buildViewHref(view: "list" | "board", workspaceId?: string | null) {
  const query = new URLSearchParams();
  query.set("view", view);
  if (workspaceId) query.set("workspaceId", workspaceId);
  return `/tasks?${query.toString()}`;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const view = pickSingleParam(resolvedParams.view) === "board" ? "board" : "list";

  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  let tasks: Task[] = [];
  if (workspaceId) {
    const store = await getRuntimeCollabStore();
    tasks = await store.listTasksByWorkspace(workspaceId);
  }

  const now = new Date();
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const overdueCount = tasks.filter((task) => isOverdue(task, now)).length;
  const dueSoonCount = tasks.filter((task) => isDueSoon(task, now)).length;

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">실행</p>
        <h1 className="page-title">작업 운영 보드</h1>
        <p className="page-subtitle">
          리스트와 보드를 전환해 팀 실행 흐름을 추적합니다. 완료/지연 기록은 관리자
          평가 참고 지표로 자동 집계됩니다.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">전체 작업</p>
          <p className="kpi-value">{tasks.length}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">완료</p>
          <p className="kpi-value">{doneCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">진행 중</p>
          <p className="kpi-value">{inProgressCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">임박/지연</p>
          <p className="kpi-value">
            {dueSoonCount} / {overdueCount}
          </p>
        </article>
      </section>

      <section className="section-shell space-y-4">
        <div className="section-head">
          <h2 className="section-title">보기 전환</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildViewHref("list", workspaceId)}
              className={view === "list" ? "btn-primary py-1.5 text-xs" : "btn-secondary py-1.5 text-xs"}
            >
              리스트
            </Link>
            <Link
              href={buildViewHref("board", workspaceId)}
              className={view === "board" ? "btn-primary py-1.5 text-xs" : "btn-secondary py-1.5 text-xs"}
            >
              보드
            </Link>
          </div>
        </div>

        {!workspaceId ? (
          <p className="empty-note">
            조회 가능한 워크스페이스가 없습니다. 먼저 설정 화면에서 워크스페이스를
            생성해 주세요.
          </p>
        ) : tasks.length === 0 ? (
          <p className="empty-note">
            등록된 작업이 없습니다. API를 통해 작업을 생성하면 이 화면에 자동 반영됩니다.
          </p>
        ) : view === "list" ? (
          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>작업</th>
                  <th>담당</th>
                  <th>우선순위</th>
                  <th>마감일</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="font-semibold text-[var(--ink-strong)]">{task.title}</p>
                      {task.description && (
                        <p className="mt-1 text-xs text-[var(--ink-subtle)]">{task.description}</p>
                      )}
                    </td>
                    <td>{task.assigneeId ?? "-"}</td>
                    <td>{PRIORITY_COPY[task.priority]}</td>
                    <td>{formatDateLabel(task.dueDate)}</td>
                    <td>
                      <span className="status-chip" data-tone={STATUS_TONE[task.status]}>
                        {TASK_STATUS_COPY[task.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-3">
            {STATUS_ORDER.map((status) => (
              <article key={status} className="kanban-lane">
                <div className="mb-2 flex items-center justify-between border-b border-[var(--line-soft)] pb-2">
                  <h3 className="text-sm font-semibold text-[var(--ink-strong)]">
                    {TASK_STATUS_COPY[status]}
                  </h3>
                  <span className="status-chip" data-tone={STATUS_TONE[status]}>
                    {tasks.filter((task) => task.status === status).length}건
                  </span>
                </div>
                <ul className="space-y-2">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task) => (
                      <li key={task.id} className="kanban-item">
                        <p className="text-sm font-semibold text-[var(--ink-strong)]">{task.title}</p>
                        <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                          담당 {task.assigneeId ?? "-"} · 마감 {formatDateLabel(task.dueDate)}
                        </p>
                      </li>
                    ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
