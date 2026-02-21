import { expect, test } from "@playwright/test";

const E2E_USER_COOKIE = "e2e-user-id=e2e-user-1";

test("팀 역할 관리 페이지에서 멤버 현황을 확인할 수 있다", async ({
  page,
  request,
}) => {
  const workspaceRes = await request.post("/api/workspaces", {
    headers: {
      "content-type": "application/json",
      cookie: E2E_USER_COOKIE,
    },
    data: { name: "Team Roles" },
  });
  expect(workspaceRes.status()).toBe(201);
  const workspaceId = ((await workspaceRes.json()).workspace.id ?? "") as string;

  await page.context().addCookies([
    {
      name: "e2e-user-id",
      value: "e2e-user-1",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto(`/team?workspaceId=${encodeURIComponent(workspaceId)}`);
  await expect(page.getByRole("heading", { name: "협업 역할 관리" })).toBeVisible();
  await expect(page.getByText("오너 고정")).toBeVisible();
  await expect(page.getByText("현재 역할")).toBeVisible();
});
