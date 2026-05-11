import { test as base, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const STORAGE_STATE_PATH = resolve(".auth/user.json");

type AuthFixtures = {
  authenticatedPage: Page;
};

/**
 * 인증된 페이지 fixture.
 *
 * globalSetup이 .auth/user.json에 저장한 storageState를 사용한다.
 * 파일이 없으면(globalSetup 미실행 또는 자격증명 미설정) 명확한 에러로 실패.
 *
 * 사용:
 * ```ts
 * import { test, expect } from "@/e2e/fixtures/auth";
 *
 * test("로그인 상태에서 GNB 닉네임", async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto("/");
 *   // ...
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    if (!existsSync(STORAGE_STATE_PATH)) {
      throw new Error(
        `storageState 없음: ${STORAGE_STATE_PATH}\n` +
          "globalSetup이 실행되었는지, .env.local에 E2E_TEST_EMAIL/E2E_TEST_PASSWORD가 있는지 확인.",
      );
    }
    const context = await browser.newContext({
      storageState: STORAGE_STATE_PATH,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from "@playwright/test";
