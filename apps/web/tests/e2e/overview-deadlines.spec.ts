import { expect, test } from "@playwright/test";

const E2E_USER_COOKIE = "e2e-user-id=e2e-user-1";

test("요약 페이지와 데드라인 페이지가 운영 데이터를 표시한다", async ({
  page,
  request,
}) => {
  const headers = {
    "content-type": "application/json",
    cookie: E2E_USER_COOKIE,
  };

  const workspaceRes = await request.post("/api/workspaces", {
    headers,
    data: { name: "Overview Team" },
  });
  expect(workspaceRes.status()).toBe(201);
  const workspaceId = ((await workspaceRes.json()).workspace.id ?? "") as string;

  const dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const taskRes = await request.post("/api/tasks", {
    headers,
    data: {
      workspaceId,
      title: "데드라인 검증 작업",
      assigneeId: "e2e-user-1",
      status: "todo",
      sprintKey: "S-Overview",
      isBlocked: true,
      blockedReason: "외부 승인 대기",
      dueDate,
      sortOrder: 100,
    },
  });
  expect(taskRes.status()).toBe(201);

  await page.context().addCookies([
    {
      name: "e2e-user-id",
      value: "e2e-user-1",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto(`/overview?workspaceId=${encodeURIComponent(workspaceId)}`);
  await expect(page.getByRole("heading", { name: "팀 운영 요약" })).toBeVisible();
  await expect(page.getByText("블로커 작업")).toBeVisible();

  await page.goto(`/deadlines?workspaceId=${encodeURIComponent(workspaceId)}`);
  await expect(page.getByRole("heading", { name: "데드라인 대시보드" })).toBeVisible();
  await expect(page.getByText("데드라인 검증 작업")).toBeVisible();
});
