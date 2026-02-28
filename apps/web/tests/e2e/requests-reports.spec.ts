import { expect, test } from "@playwright/test";

type User = { id: string; name: string; email: string; role: "owner" | "user" };

test("협업 요청과 리포트 화면이 동작한다", async ({ page }) => {
  const users: User[] = [
    { id: "user-owner", name: "김오너", email: "owner@example.com", role: "owner" },
    { id: "user-jordan", name: "조단", email: "jordan@example.com", role: "user" },
    { id: "user-mina", name: "미나", email: "mina@example.com", role: "user" },
  ];

  const organizations = [
    {
      id: "org-acme",
      name: "Acme Product",
      slug: "acme-product",
      ownerId: "user-owner",
      memberIds: users.map((user) => user.id),
      createdAt: "2026-02-01T00:00:00.000Z",
    },
  ];

  const repositories = [
    {
      id: "repo-web",
      orgId: "org-acme",
      name: "web-app",
      slug: "web-app",
      description: "웹 프론트엔드",
      language: "TypeScript",
      openIssueCount: 2,
      weeklyCommits: 12,
      weeklyMerges: 5,
      activityScore: 78,
    },
  ];

  const requests: Array<Record<string, unknown>> = [
    {
      id: "REQ-101",
      orgId: "org-acme",
      fromUserId: "user-jordan",
      toUserId: "user-owner",
      type: "review",
      message: "이슈 설계 리뷰 부탁드립니다.",
      fromDate: "2026-03-01",
      toDate: "2026-03-03",
      status: "pending",
      emailSent: true,
      comments: [],
      createdAt: "2026-02-27T09:00:00.000Z",
      updatedAt: "2026-02-27T09:00:00.000Z",
    },
  ];

  const teamReport = {
    period: "week",
    summary: "최근 1주 동안 핵심 이슈 3건을 진행했고 평균 난이도는 63점입니다.",
    totalTasks: 3,
    completedTasks: 1,
    avgDifficulty: 63,
    timeline: [
      { date: "2026-02-24", created: 1, completed: 0 },
      { date: "2026-02-25", created: 1, completed: 1 },
      { date: "2026-02-26", created: 1, completed: 0 },
    ],
    contributors: [
      {
        userId: "user-jordan",
        userName: "조단",
        taskCount: 2,
        difficultyScore: 72,
        impactScore: 81,
        highlights: ["고난도 리팩터링 수행", "리뷰 코멘트 12건 처리"],
      },
    ],
    evidence: {
      model: "gpt-4.1-mini",
      promptVersion: "jira-report-v1",
      reasoning: ["이슈 난이도 및 상태 전이 반영"],
      activityTypes: ["issue_update", "comment"],
    },
    risks: [
      {
        id: "risk-1",
        title: "리뷰 대기 증가",
        severity: "medium",
        description: "Review 상태 이슈가 증가 추세입니다.",
      },
    ],
    nextActions: [
      {
        id: "action-1",
        title: "리뷰 대기 이슈 48시간 내 정리",
        owner: "김오너",
      },
    ],
  };

  const userReport = {
    userId: "user-jordan",
    userName: "조단",
    summary: "고난도 작업 중심으로 영향도가 높습니다.",
    taskCount: 2,
    completedTaskCount: 1,
    avgDifficulty: 72,
    impactScore: 81,
    byRepo: [
      { repoId: "repo-web", repoName: "web-app", taskCount: 2, difficultyAvg: 72 },
    ],
    recentIssues: [
      {
        id: "ISS-101",
        orgId: "org-acme",
        repoId: "repo-web",
        title: "보드에서 이슈 카드 드래그 앤 드롭 개선",
        description: "보드 DnD 접근성 개선",
        status: "in_progress",
        assigneeId: "user-jordan",
        labelIds: ["frontend"],
        priority: "high",
        dueDate: "2026-03-02",
        estimatePoints: 5,
        difficultyScore: 70,
        impactScore: 80,
        createdBy: "user-owner",
        createdAt: "2026-02-25T10:00:00.000Z",
        updatedAt: "2026-02-25T10:00:00.000Z",
        order: 1,
      },
    ],
    evidence: {
      model: "gpt-4.1-mini",
      promptVersion: "jira-report-v1",
      reasoning: ["난이도 상위 이슈 비중이 높습니다."],
      activityTypes: ["issue_update", "comment"],
    },
    risks: [],
    nextActions: [
      {
        id: "action-2",
        title: "고난도 이슈 pair slot 확보",
        owner: "팀 리드",
      },
    ],
  };

  await page.route("**/__mock_api__/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/__mock_api__", "");

    if (request.method() === "GET" && path === "/auth/session") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: users[0] }),
      });
    }

    if (request.method() === "GET" && path === "/orgs") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ organizations, defaultOrgId: organizations[0].id }),
      });
    }

    if (request.method() === "GET" && path === `/orgs/${organizations[0].id}/repos`) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ repositories }),
      });
    }

    if (request.method() === "GET" && path === "/notifications") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ notifications: [] }),
      });
    }

    if (request.method() === "GET" && path === "/requests") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ requests, users }),
      });
    }

    if (request.method() === "POST" && path === "/requests") {
      const payload = request.postDataJSON() as Record<string, unknown>;
      const now = new Date().toISOString();
      const nextRequest = {
        id: `REQ-${200 + requests.length}`,
        orgId: payload.orgId,
        fromUserId: payload.fromUserId,
        toUserId: payload.toUserId,
        type: payload.type,
        message: payload.message,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
        status: "pending",
        emailSent: true,
        comments: [],
        createdAt: now,
        updatedAt: now,
      };
      requests.push(nextRequest);

      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ request: nextRequest }),
      });
    }

    if (request.method() === "GET" && path === "/reports/summary") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ report: teamReport }),
      });
    }

    if (request.method() === "GET" && path.startsWith("/reports/users/")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ report: userReport }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: `NOT_MOCKED:${request.method()} ${path}` }),
    });
  });

  await page.context().addCookies([
    {
      name: "auth_session",
      value: "session-token",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/requests");
  await expect(page.getByRole("heading", { name: "협업 요청" })).toBeVisible();
  await page.getByRole("button", { name: "협업 요청 보내기" }).click();
  await page.getByLabel("요청 메시지").fill("E2E 요청 메시지 테스트");
  await page.getByLabel("시작일").fill("2026-03-01");
  await page.getByLabel("종료일").fill("2026-03-02");
  await page.getByRole("button", { name: "요청 전송" }).click();
  await expect(page.getByRole("dialog", { name: "협업 요청 작성" })).toBeHidden();
  await page.getByRole("tab", { name: "보낸 요청" }).click();
  await expect(page.getByText("이메일 알림 발송됨").first()).toBeVisible();

  await page.goto("/reports");
  await expect(page.getByRole("heading", { name: "AI 기여도/난이도 리포트" })).toBeVisible();
  await expect(page.getByText("AI 판단 근거")).toBeVisible();
  await page.getByRole("link", { name: "근거 보기" }).first().click();
  await expect(page).toHaveURL(/\/reports\/users\//);
  await expect(page.getByRole("heading", { name: /리포트$/, level: 2 })).toBeVisible();
});
