import { expect, test } from "@playwright/test";

test("로그인 페이지와 보호 라우트 접근이 동작한다", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();

  await page.context().addCookies([
    {
      name: "mock-user-id",
      value: "user-owner",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/orgs");
  await expect(page.getByRole("heading", { name: "조직 목록" })).toBeVisible();

  await page.goto("/issues");
  await expect(page.getByRole("heading", { name: "이슈 리스트", level: 2, exact: true })).toBeVisible();
});
