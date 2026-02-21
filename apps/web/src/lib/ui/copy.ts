import type {
  PerformanceCycleStatus,
  TaskStatus,
  WorkspaceMembership,
} from "@/lib/data/collab-store";

export type AppNavItem = {
  path: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: "/tasks", label: "작업", icon: "작" },
  { path: "/goals", label: "목표", icon: "목" },
  { path: "/docs", label: "문서", icon: "문" },
  { path: "/insights", label: "인사이트", icon: "인" },
  { path: "/setup", label: "설정", icon: "설" },
  { path: "/admin", label: "관리", icon: "관", adminOnly: true },
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
