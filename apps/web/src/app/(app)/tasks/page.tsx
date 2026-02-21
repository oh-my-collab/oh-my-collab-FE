import Link from "next/link";

import type { Task } from "@/lib/data/collab-store";
import { getRuntimeCollabStore } from "@/lib/data/store-provider";
import { resolveWorkspaceContext } from "@/lib/workspace/resolve-workspace-context";
import { TasksWorkbench } from "@/components/tasks/tasks-workbench";

type SearchParams = Record<string, string | string[] | undefined>;

type TasksPageProps = {
  searchParams: Promise<SearchParams>;
};

function pickSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isDueSoon(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  const diff = due - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= 3 * dayMs;
}

function isOverdue(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  return due < now.getTime();
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedParams = await searchParams;
  const preferredWorkspaceId = pickSingleParam(resolvedParams.workspaceId);
  const workspaceContext = await resolveWorkspaceContext(preferredWorkspaceId);
  const workspaceId = workspaceContext.workspaceId;

  let tasks: Task[] = [];
  if (workspaceId) {
    tasks = await (await getRuntimeCollabStore()).listTasksByWorkspace(workspaceId);
  }

  const now = new Date();
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const blockedCount = tasks.filter((task) => task.isBlocked).length;
  const overdueCount = tasks.filter((task) => isOverdue(task, now)).length;
  const dueSoonCount = tasks.filter((task) => isDueSoon(task, now)).length;

  return (
    <main className="space-y-8">
      <header className="border-b border-[var(--line-default)] pb-5">
        <p className="page-kicker">실행</p>
        <h1 className="page-title">작업 실행 허브</h1>
        <p className="page-subtitle">
          백로그, 스프린트, 칸반, 블로커를 단일 워크벤치에서 운영합니다.
        </p>
        {workspaceId && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/deadlines?workspaceId=${encodeURIComponent(workspaceId)}`} className="btn-secondary py-1.5 text-xs">
              마감 대시보드 이동
            </Link>
            <Link href={`/overview?workspaceId=${encodeURIComponent(workspaceId)}`} className="btn-secondary py-1.5 text-xs">
              팀 요약 이동
            </Link>
          </div>
        )}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="kpi-card">
          <p className="kpi-label">백로그</p>
          <p className="kpi-value">{todoCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">진행 중</p>
          <p className="kpi-value">{inProgressCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">완료</p>
          <p className="kpi-value">{doneCount}</p>
        </article>
        <article className="kpi-card">
          <p className="kpi-label">블로커 / 임박·지연</p>
          <p className="kpi-value">
            {blockedCount} / {dueSoonCount + overdueCount}
          </p>
        </article>
      </section>

      {!workspaceId ? (
        <p className="empty-note">
          조회 가능한 워크스페이스가 없습니다. 설정 화면에서 워크스페이스를 생성해 주세요.
        </p>
      ) : tasks.length === 0 ? (
        <p className="empty-note">
          등록된 작업이 없습니다. 작업이 생성되면 Jira형 워크벤치에 자동 반영됩니다.
        </p>
      ) : (
        <TasksWorkbench workspaceId={workspaceId} initialTasks={tasks} />
      )}
    </main>
  );
}
