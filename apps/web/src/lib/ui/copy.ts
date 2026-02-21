import type {
  PerformanceCycleStatus,
  TaskStatus,
  WorkspaceMembership,
} from "@/lib/data/collab-store";

export type AppNavItem = {
  path: string;
  label: string;
  shortLabel: string;
  shortcut: string;
  adminOnly?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: "/tasks", label: "작업", shortLabel: "작", shortcut: "G T" },
  { path: "/goals", label: "목표", shortLabel: "목", shortcut: "G G" },
  { path: "/docs", label: "문서", shortLabel: "문", shortcut: "G D" },
  { path: "/insights", label: "인사이트", shortLabel: "인", shortcut: "G I" },
  { path: "/setup", label: "설정", shortLabel: "설", shortcut: "G S" },
  { path: "/admin", label: "관리", shortLabel: "관", shortcut: "G A", adminOnly: true },
];

export const ROLE_COPY: Record<WorkspaceMembership["role"], string> = {
  owner: "오너",
  admin: "관리자",
  member: "구성원",
};

export const TASK_STATUS_COPY: Record<TaskStatus, string> = {
  todo: "할 일",
  in_progress: "진행 중",
  done: "완료",
};

export const CYCLE_STATUS_COPY: Record<PerformanceCycleStatus, string> = {
  draft: "초안",
  open: "진행",
  closed: "종료",
};
