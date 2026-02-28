import { expect, test } from "@playwright/test";

test("이슈 생성 후 보드와 상세 화면에서 확인 가능하다", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "mock-user-id",
      value: "user-owner",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.goto("/issues");
  await page.getByRole("button", { name: "이슈 생성" }).click();

  await page.getByLabel("제목").fill("E2E 생성 이슈");
  await page.getByLabel("설명").fill("E2E 시나리오용 이슈");
  await page.getByRole("button", { name: "생성" }).click();
  await expect(page.getByRole("dialog", { name: "새 이슈 생성" })).toBeHidden();

  await expect(page.getByRole("link", { name: "E2E 생성 이슈" }).first()).toBeVisible();

  await page.goto("/board");
  await expect(page.getByRole("heading", { name: "칸반 보드" })).toBeVisible();
  await expect(page.getByText("E2E 생성 이슈")).toBeVisible();

  await page.goto("/issues");
  await page.getByRole("link", { name: /E2E 생성 이슈/ }).first().click();
  await expect(page).toHaveURL(/\/issues\/ISS-/);
  await expect(page.getByRole("heading", { name: /ISS-\d+/, level: 2 })).toBeVisible();
});
