import { test, expect } from "@playwright/test";
import { VALID_EMAIL, VALID_PASSWORD } from "./fixtures.mjs";

test.describe("Authentication", () => {
  test("redirects an unauthenticated user from /dashboard to /signin", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/signin/);
  });

  test("shows validation errors when the form is submitted empty", async ({
    page,
  }) => {
    await page.goto("/signin");

    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page.getByText("Format email tidak valid")).toBeVisible();
    await expect(page.getByText("Password minimal 6 karakter")).toBeVisible();
  });

  test("shows an error message for invalid credentials", async ({ page }) => {
    await page.goto("/signin");

    await page.getByLabel("Email").fill(VALID_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page.getByText("Email atau password salah.")).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("logs in with valid credentials and reaches the dashboard", async ({
    page,
  }) => {
    await page.goto("/signin");

    await page.getByLabel("Email").fill(VALID_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(VALID_EMAIL)).toBeVisible();
  });

  test("logs out and is redirected back to /signin", async ({ page }) => {
    await page.goto("/signin");
    await page.getByLabel("Email").fill(VALID_EMAIL);
    await page.getByLabel("Password", { exact: true }).fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Masuk" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    // Let the dashboard's own data fetch settle first: it calls getSession()
    // under the hood, and NextAuth's rolling session refresh can otherwise
    // race with sign-out and resurrect the session cookie right after it's
    // cleared.
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Keluar" }).first().click();
    await page
      .getByRole("button", { name: "Keluar", exact: true })
      .last()
      .click();

    await expect(page).toHaveURL(/\/signin/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin/);
  });
});
