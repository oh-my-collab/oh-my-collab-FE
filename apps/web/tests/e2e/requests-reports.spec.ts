import { expect, test } from "@playwright/test";

test("협업 요청과 리포트 화면이 동작한다", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "mock-user-id",
      value: "user-owner",
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
