"use client";

import { useMemo, useState, useTransition } from "react";

import type { Task, TaskStatus } from "@/lib/data/collab-store";
import { TASK_STATUS_COPY } from "@/lib/ui/copy";

type TasksWorkbenchProps = {
  workspaceId: string;
  initialTasks: Task[];
};

type Mode = "backlog" | "sprint" | "board" | "blockers";

const MODE_TABS: Array<{ mode: Mode; label: string }> = [
  { mode: "backlog", label: "백로그" },
  { mode: "sprint", label: "스프린트" },
  { mode: "board", label: "칸반" },
  { mode: "blockers", label: "블로커" },
];

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function sortBacklog(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const sortDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortDiff !== 0) return sortDiff;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function TasksWorkbench({ workspaceId, initialTasks }: TasksWorkbenchProps) {
  const [mode, setMode] = useState<Mode>("backlog");
  const [tasks, setTasks] = useState(sortBacklog(initialTasks));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const backlogTasks = useMemo(() => sortBacklog(tasks), [tasks]);
  const sprintGroups = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    tasks.forEach((task) => {
      const key = task.sprintKey?.trim() || "백로그";
      const bucket = grouped.get(key) ?? [];
      bucket.push(task);
      grouped.set(key, bucket);
    });
    return Array.from(grouped.entries()).map(([key, value]) => ({
      key,
      tasks: sortBacklog(value),
    }));
  }, [tasks]);

  const blockerTasks = useMemo(
    () => sortBacklog(tasks.filter((task) => Boolean(task.isBlocked))),
    [tasks]
  );

  const moveBacklogTask = (taskId: string, direction: "up" | "down") => {
    const current = sortBacklog(tasks);
    const index = current.findIndex((task) => task.id === taskId);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= current.length) return;

    const next = [...current];
    const [moved] = next.splice(index, 1);
    next.splice(swapIndex, 0, moved);

    setTasks(
      next.map((task, taskIndex) => ({
        ...task,
        sortOrder: (taskIndex + 1) * 100,
      }))
    );

    startTransition(async () => {
      const res = await fetch("/api/tasks/reorder", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          orderedTaskIds: next.map((task) => task.id),
        }),
      });
      if (!res.ok) {
        setMessage("백로그 순서 저장에 실패했습니다.");
        return;
      }
      const body = (await res.json()) as { tasks?: Task[] };
      if (Array.isArray(body.tasks)) {
        setTasks(sortBacklog(body.tasks));
      }
      setMessage("백로그 순서를 저장했습니다.");
    });
  };

  return (
    <section className="section-shell space-y-4">
      <div className="section-head">
        <h2 className="section-title">작업 워크벤치</h2>
        <span className="chip">Jira형 실행</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MODE_TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            onClick={() => setMode(tab.mode)}
            className={mode === tab.mode ? "btn-primary py-1.5 text-xs" : "btn-secondary py-1.5 text-xs"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "backlog" && (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>정렬</th>
                <th>작업</th>
                <th>스프린트</th>
                <th>마감</th>
                <th>담당</th>
              </tr>
            </thead>
            <tbody>
              {backlogTasks.map((task, index) => (
                <tr key={task.id}>
                  <td>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        disabled={index === 0 || pending}
                        onClick={() => moveBacklogTask(task.id, "up")}
                      >
                        위
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        disabled={index === backlogTasks.length - 1 || pending}
                        onClick={() => moveBacklogTask(task.id, "down")}
                      >
                        아래
                      </button>
                    </div>
                  </td>
                  <td className="font-semibold text-[var(--ink-strong)]">{task.title}</td>
                  <td>{task.sprintKey ?? "백로그"}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>{task.assigneeId ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === "sprint" && (
        <div className="grid gap-3 md:grid-cols-2">
          {sprintGroups.map((group) => (
            <article
              key={group.key}
              className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] p-3"
            >
              <div className="mb-2 flex items-center justify-between border-b border-[var(--line-soft)] pb-2">
                <h3 className="text-sm font-semibold text-[var(--ink-strong)]">{group.key}</h3>
                <span className="status-chip">{group.tasks.length}건</span>
              </div>
              <ul className="space-y-2">
                {group.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-lg border border-[var(--line-default)] bg-[var(--surface-raised)] px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-[var(--ink-strong)]">{task.title}</p>
                    <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                      {TASK_STATUS_COPY[task.status]} · 마감 {formatDate(task.dueDate)}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {mode === "board" && (
        <div className="grid gap-4 xl:grid-cols-3">
          {STATUS_ORDER.map((status) => (
            <article key={status} className="kanban-lane">
              <div className="mb-2 flex items-center justify-between border-b border-[var(--line-soft)] pb-2">
                <h3 className="text-sm font-semibold text-[var(--ink-strong)]">
                  {TASK_STATUS_COPY[status]}
                </h3>
                <span className="status-chip">
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
                        담당 {task.assigneeId ?? "-"} · 마감 {formatDate(task.dueDate)}
                      </p>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      {mode === "blockers" && (
        <div className="list-table-wrap">
          <table className="list-table">
            <thead>
              <tr>
                <th>작업</th>
                <th>상태</th>
                <th>블로커 사유</th>
                <th>담당</th>
              </tr>
            </thead>
            <tbody>
              {blockerTasks.map((task) => (
                <tr key={task.id}>
                  <td className="font-semibold text-[var(--ink-strong)]">{task.title}</td>
                  <td>{TASK_STATUS_COPY[task.status]}</td>
                  <td>{task.blockedReason ?? "사유 미입력"}</td>
                  <td>{task.assigneeId ?? "-"}</td>
                </tr>
              ))}
              {blockerTasks.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-[var(--ink-subtle)]">
                    블로커 작업이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {message && (
        <p className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
          {message}
        </p>
      )}
    </section>
  );
}
