import {
  seedIssueComments,
  seedIssues,
  seedNotifications,
  seedOrganizations,
  seedRepoActivity,
  seedRepositories,
  seedRequests,
  seedSettings,
  seedUsers,
} from "./mock-seed";
import type {
  AiEvidence,
  AppSettings,
  CollabRequest,
  Issue,
  IssueComment,
  Notification,
  Organization,
  RepoActivityPoint,
  Repository,
  RiskItem,
  TeamReport,
  User,
  UserReport,
} from "./types";

type MockState = {
  users: User[];
  organizations: Organization[];
  repositories: Repository[];
  issues: Issue[];
  issueComments: IssueComment[];
  requests: CollabRequest[];
  notifications: Notification[];
  repoActivity: Record<string, RepoActivityPoint[]>;
  settings: AppSettings;
  counters: {
    issue: number;
    comment: number;
    request: number;
    notification: number;
    org: number;
  };
};

declare global {
  var __jiraMockState: MockState | undefined;
}

function createInitialState(): MockState {
  return {
    users: JSON.parse(JSON.stringify(seedUsers)) as User[],
    organizations: JSON.parse(JSON.stringify(seedOrganizations)) as Organization[],
    repositories: JSON.parse(JSON.stringify(seedRepositories)) as Repository[],
    issues: JSON.parse(JSON.stringify(seedIssues)) as Issue[],
    issueComments: JSON.parse(JSON.stringify(seedIssueComments)) as IssueComment[],
    requests: JSON.parse(JSON.stringify(seedRequests)) as CollabRequest[],
    notifications: JSON.parse(JSON.stringify(seedNotifications)) as Notification[],
    repoActivity: JSON.parse(
      JSON.stringify(seedRepoActivity)
    ) as Record<string, RepoActivityPoint[]>,
    settings: JSON.parse(JSON.stringify(seedSettings)) as AppSettings,
    counters: {
      issue: 300,
      comment: 50,
      request: 400,
      notification: 400,
      org: 50,
    },
  };
}

function getState() {
  if (!globalThis.__jiraMockState) {
    globalThis.__jiraMockState = createInitialState();
  }
  return globalThis.__jiraMockState;
}

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix: string, counter: number) {
  return `${prefix}-${counter}`;
}

export type IssueFilters = {
  orgId?: string;
  repoId?: string;
  status?: Issue["status"];
  assigneeId?: string;
  label?: string;
  fromDate?: string;
  toDate?: string;
  q?: string;
};

export function getUserById(userId: string) {
  return getState().users.find((user) => user.id === userId) ?? null;
}

export function listUsers() {
  return [...getState().users];
}

export function listOrganizationsForUser(userId: string) {
  return getState().organizations.filter((org) => org.memberIds.includes(userId));
}

export function createOrganization(userId: string, name: string) {
  const state = getState();
  state.counters.org += 1;
  const org: Organization = {
    id: nextId("org", state.counters.org),
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    ownerId: userId,
    memberIds: [userId],
    createdAt: nowIso(),
  };
  state.organizations.push(org);
  return org;
}

export function getOrganizationById(orgId: string) {
  return getState().organizations.find((org) => org.id === orgId) ?? null;
}

export function listRepositoriesByOrg(orgId: string) {
  return getState().repositories.filter((repo) => repo.orgId === orgId);
}

export function getRepositoryById(repoId: string) {
  return getState().repositories.find((repo) => repo.id === repoId) ?? null;
}

export function listRepoActivity(repoId: string) {
  const entries = getState().repoActivity[repoId] ?? [];
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function listIssues(filters: IssueFilters = {}) {
  const state = getState();
  return state.issues
    .filter((issue) => {
      if (filters.orgId && issue.orgId !== filters.orgId) return false;
      if (filters.repoId && issue.repoId !== filters.repoId) return false;
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.assigneeId && issue.assigneeId !== filters.assigneeId) return false;
      if (filters.label && !issue.labelIds.includes(filters.label)) return false;
      if (filters.fromDate && issue.updatedAt < filters.fromDate) return false;
      if (filters.toDate && issue.updatedAt > filters.toDate) return false;
      if (filters.q) {
        const query = filters.q.toLowerCase();
        const target = `${issue.id} ${issue.title} ${issue.description}`.toLowerCase();
        if (!target.includes(query)) return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);
}

export function getIssueById(issueId: string) {
  return getState().issues.find((issue) => issue.id === issueId) ?? null;
}

export function listIssueComments(issueId: string) {
  return getState().issueComments
    .filter((comment) => comment.issueId === issueId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addIssueComment(issueId: string, userId: string, body: string) {
  const state = getState();
  state.counters.comment += 1;
  const comment: IssueComment = {
    id: nextId("comment", state.counters.comment),
    issueId,
    userId,
    body,
    createdAt: nowIso(),
  };
  state.issueComments.push(comment);
  return comment;
}

export function createIssue(
  payload: Omit<Issue, "id" | "createdAt" | "updatedAt" | "order">
) {
  const state = getState();
  state.counters.issue += 1;
  const nextOrder =
    Math.max(
      0,
      ...state.issues
        .filter(
          (issue) =>
            issue.orgId === payload.orgId &&
            issue.repoId === payload.repoId &&
            issue.status === payload.status
        )
        .map((issue) => issue.order)
    ) + 100;

  const issue: Issue = {
    ...payload,
    id: `ISS-${state.counters.issue}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    order: nextOrder,
  };
  state.issues.push(issue);

  state.notifications.push({
    id: nextId("NOTI", ++state.counters.notification),
    userId: payload.assigneeId ?? payload.createdBy,
    type: "issue_status",
    title: "새 이슈가 생성되었습니다",
    body: `${issue.id} ${issue.title}`,
    relatedId: issue.id,
    isRead: false,
    createdAt: nowIso(),
  });

  return issue;
}

export function updateIssue(issueId: string, patch: Partial<Issue>) {
  const state = getState();
  const issue = state.issues.find((item) => item.id === issueId);
  if (!issue) return null;

  const prevStatus = issue.status;
  Object.assign(issue, patch);
  issue.updatedAt = nowIso();

  if (patch.status && patch.status !== prevStatus) {
    issue.order =
      Math.max(
        0,
        ...state.issues
          .filter(
            (item) =>
              item.id !== issue.id &&
              item.orgId === issue.orgId &&
              item.repoId === issue.repoId &&
              item.status === issue.status
          )
          .map((item) => item.order)
      ) + 100;

    state.notifications.push({
      id: nextId("NOTI", ++state.counters.notification),
      userId: issue.assigneeId ?? issue.createdBy,
      type: "issue_status",
      title: `${issue.id} 상태 변경`,
      body: `${prevStatus} → ${issue.status}`,
      relatedId: issue.id,
      isRead: false,
      createdAt: nowIso(),
    });
  }

  return issue;
}

export function reorderIssues(
  orgId: string,
  repoId: string,
  buckets: Record<Issue["status"], string[]>
) {
  const state = getState();
  const allIds = new Set(
    state.issues
      .filter((issue) => issue.orgId === orgId && issue.repoId === repoId)
      .map((issue) => issue.id)
  );
  const movedIds = Object.values(buckets).flat();

  if (movedIds.some((id) => !allIds.has(id))) {
    throw new Error("INVALID_INPUT");
  }

  (Object.keys(buckets) as Issue["status"][]).forEach((status) => {
    buckets[status].forEach((issueId, index) => {
      const issue = state.issues.find((item) => item.id === issueId);
      if (!issue) return;
      issue.status = status;
      issue.order = (index + 1) * 100;
      issue.updatedAt = nowIso();
    });
  });

  return listIssues({ orgId, repoId });
}

export function listRequests(orgId: string, userId: string) {
  return getState().requests
    .filter(
      (request) =>
        request.orgId === orgId &&
        (request.fromUserId === userId || request.toUserId === userId)
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function createRequest(
  payload: Omit<CollabRequest, "id" | "createdAt" | "updatedAt" | "status" | "emailSent" | "comments">
) {
  const state = getState();
  state.counters.request += 1;
  const request: CollabRequest = {
    ...payload,
    id: `REQ-${state.counters.request}`,
    status: "pending",
    emailSent: true,
    comments: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  state.requests.push(request);

  state.notifications.push({
    id: nextId("NOTI", ++state.counters.notification),
    userId: payload.toUserId,
    type: "request",
    title: "새 협업 요청",
    body: `${payload.fromUserId}님이 협업을 요청했습니다.`,
    relatedId: request.id,
    isRead: false,
    createdAt: nowIso(),
  });

  return request;
}

export function updateRequest(
  requestId: string,
  userId: string,
  patch: {
    status?: CollabRequest["status"];
    comment?: string;
  }
) {
  const state = getState();
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) return null;

  if (patch.status) request.status = patch.status;
  if (patch.comment) {
    request.comments.push({
      id: `${request.id}-C${request.comments.length + 1}`,
      userId,
      body: patch.comment,
      createdAt: nowIso(),
    });
  }
  request.updatedAt = nowIso();

  state.notifications.push({
    id: nextId("NOTI", ++state.counters.notification),
    userId: request.fromUserId,
    type: "request",
    title: `${request.id} 상태 업데이트`,
    body: `요청 상태: ${request.status}`,
    relatedId: request.id,
    isRead: false,
    createdAt: nowIso(),
  });

  return request;
}

export function listNotifications(userId: string) {
  return getState().notifications
    .filter((notification) => notification.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string, userId: string) {
  const notification = getState().notifications.find(
    (item) => item.id === id && item.userId === userId
  );
  if (!notification) return null;
  notification.isRead = true;
  return notification;
}

export function getSettings() {
  return { ...getState().settings };
}

export function updateSettings(patch: Partial<AppSettings>) {
  const state = getState();
  state.settings = {
    ...state.settings,
    ...patch,
  };
  return { ...state.settings };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildEvidence(
  issues: Issue[],
  period: TeamReport["period"],
  ownerName: string
): AiEvidence {
  const difficultCount = issues.filter((issue) => issue.difficultyScore >= 70).length;
  const highImpactCount = issues.filter((issue) => issue.impactScore >= 70).length;

  return {
    model: "gpt-4.1-mini-mock",
    promptVersion: `jira-report-${period}-v1`,
    reasoning: [
      `난이도 70점 이상 이슈 ${difficultCount}건`,
      `영향도 70점 이상 이슈 ${highImpactCount}건`,
      `상태 이동 기록과 코멘트 활동을 결합해 기여도를 산정했습니다.`,
      `${ownerName} 오너 기준 우선순위와 마감 임박도를 반영했습니다.`,
    ],
    activityTypes: ["issue_created", "issue_moved", "issue_commented", "request_response"],
  };
}

function buildRisks(issues: Issue[]): RiskItem[] {
  const overdueCandidates = issues.filter((issue) => {
    if (!issue.dueDate || issue.status === "done") return false;
    return new Date(issue.dueDate).getTime() < Date.now();
  });

  if (overdueCandidates.length === 0) {
    return [
      {
        id: "risk-default-1",
        title: "지연 위험 낮음",
        severity: "low",
        description: "현재 마감 지연 이슈가 감지되지 않았습니다.",
      },
    ];
  }

  return overdueCandidates.slice(0, 3).map((issue, index) => ({
    id: `risk-${index + 1}`,
    title: `${issue.id} 마감 지연 가능성`,
    severity: issue.priority === "urgent" ? "high" : "medium",
    description: `${issue.title}의 마감일이 경과했지만 완료되지 않았습니다.`,
  }));
}

export function getTeamReport(orgId: string, period: TeamReport["period"]) {
  const state = getState();
  const org = state.organizations.find((item) => item.id === orgId);
  if (!org) return null;

  const issues = state.issues.filter((issue) => issue.orgId === orgId);
  const totalTasks = issues.length;
  const completedTasks = issues.filter((issue) => issue.status === "done").length;
  const avgDifficulty = average(issues.map((issue) => issue.difficultyScore));

  const contributors = org.memberIds
    .map((userId) => {
      const user = state.users.find((item) => item.id === userId);
      if (!user) return null;
      const userIssues = issues.filter((issue) => issue.assigneeId === userId);
      if (userIssues.length === 0) {
        return {
          userId,
          userName: user.name,
          taskCount: 0,
          difficultyScore: 0,
          impactScore: 0,
          highlights: ["활동 데이터 없음"],
        };
      }
      return {
        userId,
        userName: user.name,
        taskCount: userIssues.length,
        difficultyScore: Number(average(userIssues.map((issue) => issue.difficultyScore)).toFixed(1)),
        impactScore: Number(average(userIssues.map((issue) => issue.impactScore)).toFixed(1)),
        highlights: [
          `완료 ${userIssues.filter((issue) => issue.status === "done").length}건`,
          `고난도 ${userIssues.filter((issue) => issue.difficultyScore >= 70).length}건`,
        ],
      };
    })
    .filter((item): item is TeamReport["contributors"][number] => Boolean(item))
    .sort((a, b) => b.impactScore - a.impactScore);

  const timeline = Array.from({ length: 7 }).map((_, index) => {
    const pointDate = new Date();
    pointDate.setDate(pointDate.getDate() - (6 - index));
    const yyyy = pointDate.getUTCFullYear();
    const mm = String(pointDate.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(pointDate.getUTCDate()).padStart(2, "0");
    const date = `${yyyy}-${mm}-${dd}`;
    const created = issues.filter((issue) => issue.createdAt.slice(0, 10) === date).length;
    const completed = issues.filter(
      (issue) => issue.updatedAt.slice(0, 10) === date && issue.status === "done"
    ).length;
    return { date, created, completed };
  });

  const ownerName = state.users.find((user) => user.id === org.ownerId)?.name ?? "오너";

  return {
    period,
    summary: `최근 ${period === "week" ? "1주" : "1개월"} 동안 ${completedTasks}건을 완료했고, 평균 난이도는 ${avgDifficulty.toFixed(
      1
    )}점입니다.`,
    totalTasks,
    completedTasks,
    avgDifficulty: Number(avgDifficulty.toFixed(1)),
    timeline,
    contributors,
    evidence: buildEvidence(issues, period, ownerName),
    risks: buildRisks(issues),
    nextActions: [
      {
        id: "action-1",
        title: "Review 열 이슈를 48시간 내 정리",
        owner: ownerName,
      },
      {
        id: "action-2",
        title: "고난도 이슈 pair programming 슬롯 확보",
        owner: "팀 리드",
      },
    ],
  } satisfies TeamReport;
}

export function getUserReport(orgId: string, userId: string, period: TeamReport["period"]) {
  const state = getState();
  const org = state.organizations.find((item) => item.id === orgId);
  const user = state.users.find((item) => item.id === userId);
  if (!org || !user) return null;

  const issues = state.issues.filter(
    (issue) => issue.orgId === orgId && issue.assigneeId === userId
  );

  const completedTaskCount = issues.filter((issue) => issue.status === "done").length;
  const avgDifficulty = average(issues.map((issue) => issue.difficultyScore));
  const impactScore = average(issues.map((issue) => issue.impactScore));

  const byRepo = Array.from(
    issues.reduce((acc, issue) => {
      const repo = state.repositories.find((item) => item.id === issue.repoId);
      if (!repo) return acc;
      const bucket = acc.get(repo.id) ?? {
        repoId: repo.id,
        repoName: repo.name,
        taskCount: 0,
        difficultyValues: [] as number[],
      };
      bucket.taskCount += 1;
      bucket.difficultyValues.push(issue.difficultyScore);
      acc.set(repo.id, bucket);
      return acc;
    }, new Map<string, { repoId: string; repoName: string; taskCount: number; difficultyValues: number[] }>())
  ).map(([, value]) => ({
    repoId: value.repoId,
    repoName: value.repoName,
    taskCount: value.taskCount,
    difficultyAvg: Number(average(value.difficultyValues).toFixed(1)),
  }));

  return {
    userId: user.id,
    userName: user.name,
    summary: `${period === "week" ? "주간" : "월간"} 기준으로 ${issues.length}건을 처리했고, 완료율은 ${
      issues.length === 0 ? 0 : Math.round((completedTaskCount / issues.length) * 100)
    }%입니다.`,
    taskCount: issues.length,
    completedTaskCount,
    avgDifficulty: Number(avgDifficulty.toFixed(1)),
    impactScore: Number(impactScore.toFixed(1)),
    byRepo,
    recentIssues: [...issues].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6),
    evidence: {
      model: "gpt-4.1-mini-mock",
      promptVersion: `jira-user-${period}-v1`,
      reasoning: [
        `담당 이슈 ${issues.length}건`,
        `평균 난이도 ${avgDifficulty.toFixed(1)}점`,
        `완료 이슈 ${completedTaskCount}건`,
      ],
      activityTypes: ["issue_assignment", "issue_completion", "request_collaboration"],
    },
    risks: buildRisks(issues),
    nextActions: [
      {
        id: "user-action-1",
        title: "진행 중 고난도 이슈를 리뷰 단계로 이동",
        owner: user.name,
      },
      {
        id: "user-action-2",
        title: "협업 요청 코멘트 응답 속도 개선",
        owner: user.name,
      },
    ],
  } satisfies UserReport;
}
