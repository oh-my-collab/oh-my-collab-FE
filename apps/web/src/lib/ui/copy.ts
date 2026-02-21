import type {
  PerformanceCycleStatus,
  TaskStatus,
  WorkspaceMembership,
} from "@/lib/data/collab-store";

export type AppNavItem = {
  path: string;
  label: string;
  adminOnly?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { path: "/overview", label: "요약" },
  { path: "/tasks", label: "작업" },
  { path: "/deadlines", label: "마감" },
  { path: "/team", label: "팀" },
  { path: "/goals", label: "목표" },
  { path: "/docs", label: "문서" },
  { path: "/insights", label: "인사이트" },
  { path: "/setup", label: "설정" },
  { path: "/admin", label: "관리", adminOnly: true },
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
