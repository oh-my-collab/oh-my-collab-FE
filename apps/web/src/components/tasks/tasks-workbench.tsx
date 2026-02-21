"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import type { Task, TaskPriority, TaskStatus } from "@/lib/data/collab-store";
import { TASK_STATUS_COPY } from "@/lib/ui/copy";

type TasksWorkbenchProps = {
  workspaceId: string;
  initialTasks: Task[];
};

type Mode = "backlog" | "sprint" | "board" | "blockers";
type RiskFilter = "all" | "due_soon" | "overdue" | "blocked";

type SavedView = {
  id: string;
  name: string;
  mode: Mode;
  assigneeId: string;
  priority: "all" | TaskPriority;
  risk: RiskFilter;
};

const MODE_TABS: Array<{ mode: Mode; label: string }> = [
  { mode: "backlog", label: "백로그" },
  { mode: "sprint", label: "스프린트" },
  { mode: "board", label: "칸반" },
  { mode: "blockers", label: "블로커" },
];

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done"];
const SAVED_VIEW_STORAGE_PREFIX = "omc.tasks.saved-views.";

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

function isDueSoon(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  if (Number.isNaN(due)) return false;
  const diff = due - now.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  return diff >= 0 && diff <= 3 * dayMs;
}

function isOverdue(task: Task, now: Date) {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  if (Number.isNaN(due)) return false;
  return due < now.getTime();
}

function readSavedViews(storageKey: string): SavedView[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedView[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (view) =>
        typeof view?.id === "string" &&
        typeof view?.name === "string" &&
        typeof view?.mode === "string" &&
        typeof view?.assigneeId === "string" &&
        typeof view?.priority === "string" &&
        typeof view?.risk === "string"
    );
  } catch {
    return [];
  }
}

export function TasksWorkbench({ workspaceId, initialTasks }: TasksWorkbenchProps) {
  const [mode, setMode] = useState<Mode>("backlog");
  const [tasks, setTasks] = useState(sortBacklog(initialTasks));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [savedViewName, setSavedViewName] = useState("");

  const storageKey = `${SAVED_VIEW_STORAGE_PREFIX}${workspaceId}`;

  useEffect(() => {
    setSavedViews(readSavedViews(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(savedViews));
  }, [savedViews, storageKey]);

  const hasActiveFilters =
    assigneeFilter !== "all" || priorityFilter !== "all" || riskFilter !== "all";

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      if (assigneeFilter !== "all" && task.assigneeId !== assigneeFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (riskFilter === "due_soon" && !isDueSoon(task, now)) return false;
      if (riskFilter === "overdue" && !isOverdue(task, now)) return false;
      if (riskFilter === "blocked" && !task.isBlocked) return false;
      return true;
    });
  }, [assigneeFilter, priorityFilter, riskFilter, tasks]);

  const backlogTasks = useMemo(() => sortBacklog(filteredTasks), [filteredTasks]);
  const sprintGroups = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    filteredTasks.forEach((task) => {
      const key = task.sprintKey?.trim() || "백로그";
      const bucket = grouped.get(key) ?? [];
      bucket.push(task);
      grouped.set(key, bucket);
    });
    return Array.from(grouped.entries()).map(([key, value]) => ({
      key,
      tasks: sortBacklog(value),
    }));
  }, [filteredTasks]);

  const blockerTasks = useMemo(
    () => sortBacklog(filteredTasks.filter((task) => Boolean(task.isBlocked))),
    [filteredTasks]
  );

  const assigneeOptions = useMemo(
    () =>
      Array.from(
        new Set(tasks.map((task) => task.assigneeId).filter((value): value is string => Boolean(value)))
      ).sort((a, b) => a.localeCompare(b)),
    [tasks]
  );

  const resetFilters = () => {
    setAssigneeFilter("all");
    setPriorityFilter("all");
    setRiskFilter("all");
  };

  const applySavedView = (view: SavedView) => {
    setMode(view.mode);
    setAssigneeFilter(view.assigneeId);
    setPriorityFilter(view.priority);
    setRiskFilter(view.risk);
    setMessage(`저장된 보기 '${view.name}'를 적용했습니다.`);
  };

  const saveCurrentView = () => {
    const name = savedViewName.trim();
    if (!name) {
      setMessage("보기 이름을 입력해 주세요.");
      return;
    }

    const nextView: SavedView = {
      id: `view-${Date.now()}`,
      name,
      mode,
      assigneeId: assigneeFilter,
      priority: priorityFilter,
      risk: riskFilter,
    };

    setSavedViews((prev) => {
      const withoutSameName = prev.filter((view) => view.name !== name);
      return [nextView, ...withoutSameName].slice(0, 8);
    });
    setSavedViewName("");
    setMessage(`현재 조건을 '${name}' 보기로 저장했습니다.`);
  };

  const moveBacklogTask = (taskId: string, direction: "up" | "down") => {
    if (hasActiveFilters) {
      setMessage("정렬 변경은 필터를 해제한 뒤 진행해 주세요.");
      return;
    }

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

      <div className="grid gap-2 xl:grid-cols-[1fr_auto] xl:items-end">
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

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={savedViewName}
            onChange={(event) => setSavedViewName(event.target.value)}
            placeholder="보기 이름 입력"
            className="field-input py-1.5 text-xs"
            aria-label="보기 이름"
          />
          <button type="button" className="btn-secondary py-1.5 text-xs" onClick={saveCurrentView}>
            현재 보기 저장
          </button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-2 py-2 text-xs text-[var(--ink-default)]">
          담당자
          <select
            value={assigneeFilter}
            onChange={(event) => setAssigneeFilter(event.target.value)}
            className="field-input mt-1 w-full py-1 text-xs"
          >
            <option value="all">전체</option>
            {assigneeOptions.map((assigneeId) => (
              <option key={assigneeId} value={assigneeId}>
                {assigneeId}
              </option>
            ))}
          </select>
        </label>

        <label className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-2 py-2 text-xs text-[var(--ink-default)]">
          우선순위
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as "all" | TaskPriority)}
            className="field-input mt-1 w-full py-1 text-xs"
          >
            <option value="all">전체</option>
            <option value="high">높음</option>
            <option value="medium">보통</option>
            <option value="low">낮음</option>
          </select>
        </label>

        <label className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-2 py-2 text-xs text-[var(--ink-default)]">
          위험도
          <select
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value as RiskFilter)}
            className="field-input mt-1 w-full py-1 text-xs"
          >
            <option value="all">전체</option>
            <option value="due_soon">임박</option>
            <option value="overdue">지연</option>
            <option value="blocked">블로커</option>
          </select>
        </label>

        <div className="flex flex-col justify-end gap-2">
          <label className="text-xs text-[var(--ink-subtle)]">저장된 보기 적용</label>
          <div className="flex gap-2">
            <select
              defaultValue=""
              onChange={(event) => {
                const selected = savedViews.find((view) => view.id === event.target.value);
                if (selected) applySavedView(selected);
              }}
              className="field-input w-full py-1 text-xs"
              aria-label="저장된 보기"
            >
              <option value="">선택</option>
              {savedViews.map((view) => (
                <option key={view.id} value={view.id}>
                  {view.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn-secondary py-1.5 text-xs" onClick={resetFilters}>
              초기화
            </button>
          </div>
        </div>
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
                        disabled={index === 0 || pending || hasActiveFilters}
                        onClick={() => moveBacklogTask(task.id, "up")}
                      >
                        위
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1 text-xs"
                        disabled={index === backlogTasks.length - 1 || pending || hasActiveFilters}
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
              {backlogTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-[var(--ink-subtle)]">
                    조건에 맞는 작업이 없습니다.
                  </td>
                </tr>
              )}
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
                {group.tasks.length === 0 && (
                  <li className="text-xs text-[var(--ink-subtle)]">작업이 없습니다.</li>
                )}
              </ul>
            </article>
          ))}
          {sprintGroups.length === 0 && <p className="empty-note">조건에 맞는 스프린트가 없습니다.</p>}
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
                  {filteredTasks.filter((task) => task.status === status).length}건
                </span>
              </div>
              <ul className="space-y-2">
                {filteredTasks
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
