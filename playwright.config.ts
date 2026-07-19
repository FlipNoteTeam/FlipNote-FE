import { defineConfig, devices } from "@playwright/test";

const PORT = 5173;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // `npm run dev`는 MSW 없이 실서버 프록시로 뜬다(모킹은 dev:mock 전용).
    // E2E는 Playwright page.route로 API를 모킹하는데, MSW 서비스워커가 켜지면
    // 앱의 모든 fetch를 SW가 가로채고 page.route는 SW 발생 요청을 인터셉트하지
    // 못해 mock이 전부 실서버로 새어나간다. env로 한 번 더 못박아 격리한다.
    command: "npm run dev",
    env: { ...process.env, VITE_USE_MOCK: "false" },
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
