import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  // Next dev (Turbopack) can flake when multiple workers trigger concurrent
  // cold compiles of the same route for the first time; this suite is small
  // enough that running serially is worth the reliability.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  // Next dev (Turbopack) compiles each route lazily on first visit, which can
  // take a few seconds and make the default 5s expect timeout flaky.
  expect: { timeout: 15_000 },
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  webServer: [
    {
      command: "node e2e/mock-backend.mjs",
      port: 8080,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "bun ./node_modules/.bin/next dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
