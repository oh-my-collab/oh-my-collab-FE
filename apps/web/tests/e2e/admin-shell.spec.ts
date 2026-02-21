import { expect, test } from "@playwright/test";

test("사이드바 접힘 상태가 localStorage에 저장되고 유지된다", async ({ page }) => {
  await page.goto("/tasks");

  const toggle = page.getByRole("button", { name: "사이드바 접기" });
  await expect(toggle).toBeVisible();

  await toggle.click();
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("omc.sidebar.collapsed"))
    )
    .toBe("1");

  await page.reload();
  await expect
    .poll(async () =>
      page.evaluate(() => window.localStorage.getItem("omc.sidebar.collapsed"))
    )
    .toBe("1");
});

test("워크스페이스 멤버가 아니면 /admin 접근 시 /setup으로 이동한다", async ({ page }) => {
  await page.context().addCookies([
    {
      name: "e2e-user-id",
      value: "e2e-no-membership-user",
      domain: "127.0.0.1",
      path: "/",
    },
  ]);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/setup$/);
});
