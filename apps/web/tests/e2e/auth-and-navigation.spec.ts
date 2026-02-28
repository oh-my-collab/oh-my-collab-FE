import { expect, test } from "@playwright/test";

type User = { id: string; name: string; email: string; role: "owner" | "user" };

test("로그인 페이지와 보호 라우트 접근이 동작한다", async ({ page }) => {
  const users: User[] = [
    { id: "user-owner", name: "김오너", email: "owner@example.com", role: "owner" },
    { id: "user-jordan", name: "조단", email: "jordan@example.com", role: "user" },
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

  const issues = [
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
  ];

  let authenticated = false;

  await page.route("**/__mock_api__/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/__mock_api__", "");

    if (request.method() === "GET" && path === "/auth/session") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: authenticated ? users[0] : null }),
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

    if (request.method() === "GET" && path === "/issues") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ issues, users }),
      });
    }

    if (request.method() === "GET" && path === "/notifications") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ notifications: [] }),
      });
    }

    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ message: `NOT_MOCKED:${request.method()} ${path}` }),
    });
  });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();

  authenticated = true;
  await page.context().addCookies([
    {
      name: "auth_session",
      value: "session-token",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/orgs");
  await expect(page.getByRole("heading", { name: "조직 목록" })).toBeVisible();

  await page.goto("/issues");
  await expect(page.getByRole("heading", { name: "이슈 리스트", level: 2, exact: true })).toBeVisible();
});
