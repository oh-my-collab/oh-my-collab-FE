import type {
  AppSettings,
  CollabRequest,
  Issue,
  Notification,
  Organization,
  Repository,
  SessionPayload,
  TeamReport,
  User,
  UserReport,
} from "@/features/shared/types";

type ApiError = {
  message: string;
  issues?: unknown;
};

async function parseResponse<T>(responseLike: Response | Promise<Response>): Promise<T> {
  const response = await responseLike;
  const body = (await response.json()) as T | ApiError;
  if (!response.ok) {
    const error = body as ApiError;
    throw new Error(error.message || "API_ERROR");
  }
  return body as T;
}

export const mockClient = {
  getSession: () => parseResponse<SessionPayload>(fetch("/api/mock/session", { cache: "no-store" })),
  login: (userId: string) =>
    parseResponse<{ user: User }>(
      fetch("/api/mock/session/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      })
    ),
  logout: () =>
    parseResponse<{ success: boolean }>(
      fetch("/api/mock/session/logout", {
        method: "POST",
      })
    ),
  listOrgs: () =>
    parseResponse<{ organizations: Organization[]; defaultOrgId?: string }>(
      fetch("/api/mock/orgs", { cache: "no-store" })
    ),
  createOrg: (name: string) =>
    parseResponse<{ organization: Organization }>(
      fetch("/api/mock/orgs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      })
    ),
  getOrg: (orgId: string) =>
    parseResponse<{
      organization: Organization;
      summary: {
        repositoryCount: number;
        openIssueCount: number;
        inProgressCount: number;
        weeklyCommits: number;
        weeklyMerges: number;
      };
    }>(fetch(`/api/mock/orgs/${orgId}`, { cache: "no-store" })),
  listReposByOrg: (orgId: string) =>
    parseResponse<{ repositories: Repository[] }>(
      fetch(`/api/mock/orgs/${orgId}/repos`, { cache: "no-store" })
    ),
  getRepo: (repoId: string) =>
    parseResponse<{
      repository: Repository;
      summary: { openIssueCount: number; doneIssueCount: number; highPriorityCount: number };
    }>(fetch(`/api/mock/repos/${repoId}`, { cache: "no-store" })),
  getRepoActivity: (repoId: string) =>
    parseResponse<{ activity: Array<{ date: string; commits: number; merges: number }> }>(
      fetch(`/api/mock/repos/${repoId}/activity`, { cache: "no-store" })
    ),
  listIssues: (params: URLSearchParams) =>
    parseResponse<{ issues: Issue[]; users: User[] }>(
      fetch(`/api/mock/issues?${params.toString()}`, { cache: "no-store" })
    ),
  createIssue: (input: Record<string, unknown>) =>
    parseResponse<{ issue: Issue }>(
      fetch("/api/mock/issues", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
  getIssue: (issueId: string) =>
    parseResponse<{
      issue: Issue;
      comments: Array<{ id: string; issueId: string; userId: string; body: string; createdAt: string }>;
      users: User[];
    }>(fetch(`/api/mock/issues/${issueId}`, { cache: "no-store" })),
  updateIssue: (issueId: string, patch: Record<string, unknown>) =>
    parseResponse<{ issue: Issue }>(
      fetch(`/api/mock/issues/${issueId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
    ),
  reorderIssues: (payload: Record<string, unknown>) =>
    parseResponse<{ issues: Issue[] }>(
      fetch("/api/mock/issues/reorder", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
    ),
  listRequests: (orgId: string) =>
    parseResponse<{ requests: CollabRequest[]; users: User[] }>(
      fetch(`/api/mock/requests?orgId=${encodeURIComponent(orgId)}`, {
        cache: "no-store",
      })
    ),
  createRequest: (input: Record<string, unknown>) =>
    parseResponse<{ request: CollabRequest }>(
      fetch("/api/mock/requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
  updateRequest: (requestId: string, input: Record<string, unknown>) =>
    parseResponse<{ request: CollabRequest }>(
      fetch(`/api/mock/requests/${requestId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
  getTeamReport: (orgId: string, period: "week" | "month") =>
    parseResponse<{ report: TeamReport }>(
      fetch(`/api/mock/reports/summary?orgId=${encodeURIComponent(orgId)}&period=${period}`, {
        cache: "no-store",
      })
    ),
  getUserReport: (orgId: string, userId: string, period: "week" | "month") =>
    parseResponse<{ report: UserReport }>(
      fetch(
        `/api/mock/reports/users/${userId}?orgId=${encodeURIComponent(orgId)}&period=${period}`,
        { cache: "no-store" }
      )
    ),
  listNotifications: () =>
    parseResponse<{ notifications: Notification[] }>(
      fetch("/api/mock/notifications", { cache: "no-store" })
    ),
  markNotificationRead: (id: string) =>
    parseResponse<{ notification: Notification }>(
      fetch(`/api/mock/notifications/${id}/read`, {
        method: "PATCH",
      })
    ),
  getSettings: () =>
    parseResponse<{ settings: AppSettings }>(
      fetch("/api/mock/settings", { cache: "no-store" })
    ),
  updateSettings: (input: Record<string, unknown>) =>
    parseResponse<{ settings: AppSettings }>(
      fetch("/api/mock/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
};
