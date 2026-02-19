import { expect, test } from "@playwright/test";

const E2E_USER_COOKIE = "e2e-user-id=e2e-user-1";

test("온보딩 페이지에 5단계 체크리스트가 노출된다", async ({ page }) => {
  await page.goto("/setup");

  await expect(page.getByRole("heading", { name: "15-Minute Team Setup" })).toBeVisible();
  await expect(page.getByText("Fork template")).toBeVisible();
  await expect(page.getByText("Vercel Import")).toBeVisible();
  await expect(page.getByText("Env setup")).toBeVisible();
  await expect(page.getByText("DB migration")).toBeVisible();
  await expect(page.getByText("Workspace init")).toBeVisible();
});

test("workspace -> docs/tasks/goals -> insights CRUD 흐름이 동작한다", async ({
  request,
}) => {
  const headers = {
    "content-type": "application/json",
    cookie: E2E_USER_COOKIE,
  };

  const workspaceRes = await request.post("/api/workspaces", {
    headers,
    data: { name: "E2E Team" },
  });
  expect(workspaceRes.status()).toBe(201);
  const workspaceBody = await workspaceRes.json();
  const workspaceId = workspaceBody.workspace.id as string;

  const docCreateRes = await request.post("/api/docs", {
    headers,
    data: {
      workspaceId,
      title: "E2E Note",
      content: "hello",
      templateKey: "meeting-note",
    },
  });
  expect(docCreateRes.status()).toBe(201);

  const docListRes = await request.get(
    `/api/docs?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: { cookie: E2E_USER_COOKIE } }
  );
  expect(docListRes.status()).toBe(200);
  const docListBody = await docListRes.json();
  expect(docListBody.docs.length).toBeGreaterThanOrEqual(1);

  const taskCreateRes = await request.post("/api/tasks", {
    headers,
    data: {
      workspaceId,
      title: "E2E Task",
      assigneeId: "e2e-user-1",
      priority: "high",
      difficulty: 2,
    },
  });
  expect(taskCreateRes.status()).toBe(201);
  const taskBody = await taskCreateRes.json();
  const taskId = taskBody.task.id as string;

  const taskPatchRes = await request.patch(`/api/tasks/${taskId}`, {
    headers,
    data: {
      workspaceId,
      status: "done",
      assigneeId: "e2e-user-1",
    },
  });
  expect(taskPatchRes.status()).toBe(200);

  const goalCreateRes = await request.post("/api/goals", {
    headers,
    data: {
      workspaceId,
      title: "E2E Goal",
    },
  });
  expect(goalCreateRes.status()).toBe(201);
  const goalBody = await goalCreateRes.json();
  const goalId = goalBody.goal.id as string;

  const krCreateRes = await request.post(`/api/goals/${goalId}/key-results`, {
    headers,
    data: {
      workspaceId,
      title: "KR 1",
      metric: "%",
      targetValue: 100,
    },
  });
  expect(krCreateRes.status()).toBe(201);
  const krBody = await krCreateRes.json();
  const keyResultId = krBody.keyResult.id as string;

  const krUpdateRes = await request.patch(`/api/goals/${goalId}/key-results`, {
    headers,
    data: {
      workspaceId,
      keyResultId,
      progress: 75,
      currentValue: 75,
    },
  });
  expect(krUpdateRes.status()).toBe(200);

  const insightsRes = await request.get(
    `/api/insights?workspaceId=${encodeURIComponent(workspaceId)}`,
    { headers: { cookie: E2E_USER_COOKIE } }
  );
  expect(insightsRes.status()).toBe(200);
  const insightsBody = await insightsRes.json();
  expect(insightsBody.weeklyDoneTaskCount).toBeGreaterThanOrEqual(1);
  expect(insightsBody.goalAchievementRate).toBeGreaterThan(0);
  expect(Array.isArray(insightsBody.contribution)).toBeTruthy();
});
