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
import { endpoints } from "@/lib/api/endpoints";

type ApiErrorPayload = {
  message?: string;
  issues?: unknown;
};

export const CONFIG_MISSING_API_BASE_URL = "CONFIG_MISSING_API_BASE_URL";

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error(CONFIG_MISSING_API_BASE_URL);
  }
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(path: string, searchParams?: URLSearchParams) {
  const query = searchParams ? `?${searchParams.toString()}` : "";
  return `${getApiBaseUrl()}${path}${query}`;
}

async function parseResponse<T>(responseLike: Response | Promise<Response>): Promise<T> {
  const response = await responseLike;
  const raw = await response.text();
  let body: unknown = null;

  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }
  }

  if (!response.ok) {
    const errorPayload = (body ?? {}) as ApiErrorPayload;
    const message =
      (typeof errorPayload.message === "string" && errorPayload.message) ||
      `HTTP_${response.status}`;
    const error = new Error(message) as Error & { issues?: unknown };
    error.issues = errorPayload.issues;
    throw error;
  }

  return body as T;
}

export const backendClient = {
  getSession: () =>
    parseResponse<SessionPayload>(fetch(buildUrl(endpoints.session.get), { cache: "no-store" })),
  login: (input: { email: string; password: string }) =>
    parseResponse<{ user: User }>(
      fetch(buildUrl(endpoints.session.login), {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      })
    ),
  logout: () =>
    parseResponse<{ success: boolean }>(
      fetch(buildUrl(endpoints.session.logout), {
        method: "POST",
        credentials: "include",
      })
    ),
  listOrgs: () =>
    parseResponse<{ organizations: Organization[]; defaultOrgId?: string }>(
      fetch(buildUrl(endpoints.orgs.list), { cache: "no-store" })
    ),
  createOrg: (name: string) =>
    parseResponse<{ organization: Organization }>(
      fetch(buildUrl(endpoints.orgs.list), {
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
    }>(fetch(buildUrl(endpoints.orgs.detail(orgId)), { cache: "no-store" })),
  listReposByOrg: (orgId: string) =>
    parseResponse<{ repositories: Repository[] }>(
      fetch(buildUrl(endpoints.orgs.repos(orgId)), { cache: "no-store" })
    ),
  getRepo: (repoId: string) =>
    parseResponse<{
      repository: Repository;
      summary: { openIssueCount: number; doneIssueCount: number; highPriorityCount: number };
    }>(fetch(buildUrl(endpoints.repos.detail(repoId)), { cache: "no-store" })),
  getRepoActivity: (repoId: string) =>
    parseResponse<{ activity: Array<{ date: string; commits: number; merges: number }> }>(
      fetch(buildUrl(endpoints.repos.activity(repoId)), { cache: "no-store" })
    ),
  listIssues: (params: URLSearchParams) =>
    parseResponse<{ issues: Issue[]; users: User[] }>(
      fetch(buildUrl(endpoints.issues.list, params), { cache: "no-store" })
    ),
  createIssue: (input: Record<string, unknown>) =>
    parseResponse<{ issue: Issue }>(
      fetch(buildUrl(endpoints.issues.list), {
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
    }>(fetch(buildUrl(endpoints.issues.detail(issueId)), { cache: "no-store" })),
  updateIssue: (issueId: string, patch: Record<string, unknown>) =>
    parseResponse<{ issue: Issue }>(
      fetch(buildUrl(endpoints.issues.detail(issueId)), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      })
    ),
  reorderIssues: (payload: Record<string, unknown>) =>
    parseResponse<{ issues: Issue[] }>(
      fetch(buildUrl(endpoints.issues.reorder), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
    ),
  listRequests: (orgId: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set("orgId", orgId);
    return parseResponse<{ requests: CollabRequest[]; users: User[] }>(
      fetch(buildUrl(endpoints.requests.list, searchParams), {
        cache: "no-store",
      })
    );
  },
  createRequest: (input: Record<string, unknown>) =>
    parseResponse<{ request: CollabRequest }>(
      fetch(buildUrl(endpoints.requests.list), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
  updateRequest: (requestId: string, input: Record<string, unknown>) =>
    parseResponse<{ request: CollabRequest }>(
      fetch(buildUrl(endpoints.requests.detail(requestId)), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
  getTeamReport: (orgId: string, period: "week" | "month") => {
    const searchParams = new URLSearchParams();
    searchParams.set("orgId", orgId);
    searchParams.set("period", period);
    return parseResponse<{ report: TeamReport }>(
      fetch(buildUrl(endpoints.reports.summary, searchParams), { cache: "no-store" })
    );
  },
  getUserReport: (orgId: string, userId: string, period: "week" | "month") => {
    const searchParams = new URLSearchParams();
    searchParams.set("orgId", orgId);
    searchParams.set("period", period);
    return parseResponse<{ report: UserReport }>(
      fetch(buildUrl(endpoints.reports.user(userId), searchParams), { cache: "no-store" })
    );
  },
  listNotifications: () =>
    parseResponse<{ notifications: Notification[] }>(
      fetch(buildUrl(endpoints.notifications.list), { cache: "no-store" })
    ),
  markNotificationRead: (id: string) =>
    parseResponse<{ notification: Notification }>(
      fetch(buildUrl(endpoints.notifications.read(id)), {
        method: "PATCH",
      })
    ),
  getSettings: () =>
    parseResponse<{ settings: AppSettings }>(
      fetch(buildUrl(endpoints.settings.detail), { cache: "no-store" })
    ),
  updateSettings: (input: Record<string, unknown>) =>
    parseResponse<{ settings: AppSettings }>(
      fetch(buildUrl(endpoints.settings.detail), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      })
    ),
};

