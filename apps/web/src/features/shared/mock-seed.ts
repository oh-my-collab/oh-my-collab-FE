import type {
  AppSettings,
  CollabRequest,
  Issue,
  IssueComment,
  Notification,
  Organization,
  RepoActivityPoint,
  Repository,
  User,
} from "./types";

const now = new Date();

function daysAgo(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysAhead(days: number) {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export const seedUsers: User[] = [
  {
    id: "user-owner",
    name: "김오너",
    email: "owner@acme.dev",
    role: "owner",
  },
  {
    id: "user-jordan",
    name: "조단",
    email: "jordan@acme.dev",
    role: "user",
  },
  {
    id: "user-mina",
    name: "미나",
    email: "mina@acme.dev",
    role: "user",
  },
  {
    id: "user-hyun",
    name: "현우",
    email: "hyun@acme.dev",
    role: "user",
  },
];

export const seedOrganizations: Organization[] = [
  {
    id: "org-acme",
    name: "Acme Product",
    slug: "acme-product",
    ownerId: "user-owner",
    memberIds: ["user-owner", "user-jordan", "user-mina", "user-hyun"],
    createdAt: daysAgo(90),
  },
  {
    id: "org-labs",
    name: "Acme Labs",
    slug: "acme-labs",
    ownerId: "user-owner",
    memberIds: ["user-owner", "user-jordan"],
    createdAt: daysAgo(40),
  },
];

export const seedRepositories: Repository[] = [
  {
    id: "repo-web",
    orgId: "org-acme",
    name: "web-app",
    slug: "web-app",
    description: "고객용 웹 애플리케이션",
    language: "TypeScript",
    openIssueCount: 7,
    weeklyCommits: 34,
    weeklyMerges: 12,
    activityScore: 78,
  },
  {
    id: "repo-api",
    orgId: "org-acme",
    name: "core-api",
    slug: "core-api",
    description: "협업 백엔드 API",
    language: "Go",
    openIssueCount: 4,
    weeklyCommits: 22,
    weeklyMerges: 9,
    activityScore: 69,
  },
  {
    id: "repo-ml",
    orgId: "org-labs",
    name: "ai-reporter",
    slug: "ai-reporter",
    description: "AI 난이도 판별 파이프라인",
    language: "Python",
    openIssueCount: 3,
    weeklyCommits: 17,
    weeklyMerges: 6,
    activityScore: 74,
  },
];

export const seedIssues: Issue[] = [
  {
    id: "ISS-101",
    orgId: "org-acme",
    repoId: "repo-web",
    title: "보드에서 이슈 카드 드래그 앤 드롭 개선",
    description: "키보드 접근성을 포함한 컬럼 이동을 지원합니다.",
    status: "in_progress",
    assigneeId: "user-jordan",
    labelIds: ["frontend", "ux"],
    priority: "high",
    dueDate: daysAhead(2),
    estimatePoints: 5,
    difficultyScore: 72,
    impactScore: 81,
    createdBy: "user-owner",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(1),
    order: 200,
  },
  {
    id: "ISS-102",
    orgId: "org-acme",
    repoId: "repo-web",
    title: "이슈 리스트 필터 성능 최적화",
    description: "상태, 담당자, 기간 필터를 조합해도 100ms 이내로 응답하도록 합니다.",
    status: "backlog",
    assigneeId: "user-mina",
    labelIds: ["performance"],
    priority: "medium",
    dueDate: daysAhead(5),
    estimatePoints: 3,
    difficultyScore: 55,
    impactScore: 64,
    createdBy: "user-owner",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    order: 100,
  },
  {
    id: "ISS-103",
    orgId: "org-acme",
    repoId: "repo-api",
    title: "레포 활동 요약 API 계약 정리",
    description: "커밋/머지/오픈이슈 메트릭 스키마를 고정합니다.",
    status: "review",
    assigneeId: "user-hyun",
    labelIds: ["backend", "api"],
    priority: "high",
    dueDate: daysAhead(1),
    estimatePoints: 8,
    difficultyScore: 84,
    impactScore: 77,
    createdBy: "user-owner",
    createdAt: daysAgo(14),
    updatedAt: daysAgo(0),
    order: 300,
  },
  {
    id: "ISS-104",
    orgId: "org-labs",
    repoId: "repo-ml",
    title: "난이도 판별 프롬프트 v2 실험",
    description: "판단 근거 섹션 품질 향상을 위해 프롬프트를 개선합니다.",
    status: "done",
    assigneeId: "user-jordan",
    labelIds: ["ai", "report"],
    priority: "urgent",
    dueDate: daysAgo(2),
    estimatePoints: 13,
    difficultyScore: 91,
    impactScore: 88,
    createdBy: "user-owner",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
    order: 400,
  },
  {
    id: "ISS-105",
    orgId: "org-acme",
    repoId: "repo-web",
    title: "협업 요청 인박스 탭 UX 개선",
    description: "받은 요청/보낸 요청 전환을 1클릭으로 단순화합니다.",
    status: "done",
    assigneeId: "user-mina",
    labelIds: ["frontend", "requests"],
    priority: "low",
    dueDate: daysAgo(1),
    estimatePoints: 2,
    difficultyScore: 34,
    impactScore: 45,
    createdBy: "user-owner",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(1),
    order: 500,
  },
];

export const seedIssueComments: IssueComment[] = [
  {
    id: "comment-1",
    issueId: "ISS-101",
    userId: "user-owner",
    body: "접근성 검증은 키보드 시나리오까지 포함해 주세요.",
    createdAt: daysAgo(1),
  },
  {
    id: "comment-2",
    issueId: "ISS-103",
    userId: "user-jordan",
    body: "응답 스키마에 trend 필드가 필요해 보입니다.",
    createdAt: daysAgo(0),
  },
];

export const seedRequests: CollabRequest[] = [
  {
    id: "REQ-201",
    orgId: "org-acme",
    fromUserId: "user-jordan",
    toUserId: "user-hyun",
    type: "review",
    message: "API 계약 리뷰 부탁드립니다.",
    fromDate: daysAhead(1),
    toDate: daysAhead(3),
    status: "pending",
    emailSent: true,
    comments: [],
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
  },
  {
    id: "REQ-202",
    orgId: "org-acme",
    fromUserId: "user-mina",
    toUserId: "user-jordan",
    type: "pair_programming",
    message: "보드 필터 성능 튜닝 같이 봐주세요.",
    fromDate: daysAhead(2),
    toDate: daysAhead(2),
    status: "accepted",
    emailSent: true,
    comments: [
      {
        id: "REQ-202-C1",
        userId: "user-jordan",
        body: "좋아요. 14:00~15:00으로 잡겠습니다.",
        createdAt: daysAgo(1),
      },
    ],
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
];

export const seedNotifications: Notification[] = [
  {
    id: "NOTI-1",
    userId: "user-owner",
    type: "issue_status",
    title: "ISS-103 상태 변경",
    body: "ISS-103이 Review로 이동했습니다.",
    relatedId: "ISS-103",
    isRead: false,
    createdAt: daysAgo(0),
  },
  {
    id: "NOTI-2",
    userId: "user-jordan",
    type: "request",
    title: "새 협업 요청 도착",
    body: "현우님에게 리뷰 요청을 보냈습니다.",
    relatedId: "REQ-201",
    isRead: true,
    createdAt: daysAgo(0),
  },
];

export const seedRepoActivity: Record<string, RepoActivityPoint[]> = {
  "repo-web": [
    { date: daysAgo(6), commits: 5, merges: 2 },
    { date: daysAgo(5), commits: 3, merges: 1 },
    { date: daysAgo(4), commits: 4, merges: 2 },
    { date: daysAgo(3), commits: 6, merges: 2 },
    { date: daysAgo(2), commits: 8, merges: 3 },
    { date: daysAgo(1), commits: 4, merges: 1 },
    { date: daysAgo(0), commits: 4, merges: 1 },
  ],
  "repo-api": [
    { date: daysAgo(6), commits: 2, merges: 1 },
    { date: daysAgo(5), commits: 3, merges: 1 },
    { date: daysAgo(4), commits: 4, merges: 1 },
    { date: daysAgo(3), commits: 2, merges: 1 },
    { date: daysAgo(2), commits: 5, merges: 2 },
    { date: daysAgo(1), commits: 3, merges: 1 },
    { date: daysAgo(0), commits: 3, merges: 2 },
  ],
  "repo-ml": [
    { date: daysAgo(6), commits: 1, merges: 0 },
    { date: daysAgo(5), commits: 2, merges: 1 },
    { date: daysAgo(4), commits: 3, merges: 1 },
    { date: daysAgo(3), commits: 2, merges: 1 },
    { date: daysAgo(2), commits: 4, merges: 2 },
    { date: daysAgo(1), commits: 2, merges: 1 },
    { date: daysAgo(0), commits: 3, merges: 1 },
  ],
};

export const seedSettings: AppSettings = {
  defaultOrgId: "org-acme",
  defaultRepoId: "repo-web",
  emailNotifications: true,
  mentionNotifications: true,
  issueStatusNotifications: true,
};
