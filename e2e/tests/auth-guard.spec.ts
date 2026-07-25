import { test as anonymousTest, expect, type Page } from "@playwright/test";
import { test as authTest } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";

/**
 * fix-auth 회귀 테스트 (리팩토링 전 선작성).
 *
 * 현재 구조의 문제:
 * - `beforeLoad: ({ context }) => { authGuard(...) }` 는 async 가드를 await/return 하지 않아
 *   `throw redirect()` 가 detached rejected promise가 된다 → 비로그인 직접 진입이 막히지 않음.
 * - `clearUser()` 는 zustand 상태만 바꾸고 라우터를 갱신하지 않아 로그아웃해도 kick되지 않음.
 * - login의 `redirect` search param이 외부 URL이어도 그대로 navigate 대상이 된다.
 *
 * 기대 동작(리팩토링 후):
 * - `_authenticated` pathless layout의 async beforeLoad가 미인증 진입을 /auth/login으로 보낸다.
 * - clearUser → router.invalidate → 보호 라우트에 머물던 사용자 즉시 kick.
 * - redirect는 내부 경로(`/`로 시작, `//`·`/\` 제외)만 허용.
 */

/** 비로그인 상태를 결정적으로 만든다(실서버 응답에 의존하지 않도록 인증 API를 401로 고정). */
const stubAnonymousSession = async (page: Page) => {
  const m = mockApi(page);
  await m.fail("**/api/auth/token/refresh", 401, {
    success: false,
    message: "unauthorized",
  });
  await m.fail("**/api/users/me", 401, {
    success: false,
    message: "unauthorized",
  });
};

const TEST_USER = {
  userId: 1,
  email: "test@example.com",
  nickname: "테스터",
  name: "테스터",
  smsAgree: false,
  createdAt: "2024-01-01T00:00:00",
  modifiedAt: "2024-01-01T00:00:00",
};

/**
 * 로그인 상태를 결정적으로 만든다.
 * storageState 쿠키만 믿으면 실서버의 refresh/users/me 응답 지연·제한에 따라 GNB가
 * 늦게 그려져 플레이키해진다.
 */
const stubAuthenticatedSession = async (page: Page) => {
  const m = mockApi(page);
  await m.succeed("**/api/auth/token/refresh", { success: true });
  await m.succeed("**/api/users/me", { success: true, data: TEST_USER });
};

anonymousTest(
  "비로그인 상태로 보호 라우트 직접 진입 시 로그인 페이지로 리다이렉트된다",
  async ({ page }) => {
    await stubAnonymousSession(page);

    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/auth\/login/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/auth/login");
    expect(url.searchParams.get("redirect")).toBe("/dashboard");
  },
);

anonymousTest(
  "비로그인 상태에서 보호 목록 라우트도 로그인 페이지로 리다이렉트된다",
  async ({ page }) => {
    await stubAnonymousSession(page);

    await page.goto("/group-list");

    await expect(page).toHaveURL(/\/auth\/login/);
    expect(new URL(page.url()).searchParams.get("redirect")).toBe(
      "/group-list",
    );
  },
);

anonymousTest(
  "비로그인 상태에서 공개 라우트는 리다이렉트되지 않는다",
  async ({ page }) => {
    await stubAnonymousSession(page);

    await page.goto("/");
    await expect(page).toHaveURL("/");

    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByLabel("이메일")).toBeVisible();
  },
);

authTest(
  "로그인 상태로 로그인 페이지에 진입하면 홈으로 리다이렉트된다",
  async ({ authenticatedPage }) => {
    await stubAuthenticatedSession(authenticatedPage);

    await authenticatedPage.goto("/auth/login");

    await expect(authenticatedPage).toHaveURL("/");
  },
);

authTest(
  "보호 라우트에서 로그아웃하면 로그인 페이지로 kick된다",
  async ({ authenticatedPage }) => {
    await stubAuthenticatedSession(authenticatedPage);
    await mockApi(authenticatedPage).succeed("**/api/auth/logout", {
      success: true,
    });

    await authenticatedPage.goto("/dashboard");

    // GNB에 닉네임이 뜨면 인증 상태가 확정된 것
    const userMenu = authenticatedPage.getByRole("button", {
      name: `${TEST_USER.nickname}님`,
    });
    await expect(userMenu).toBeVisible({ timeout: 15_000 });

    await userMenu.click();
    await authenticatedPage
      .getByRole("menuitem", { name: "로그아웃" })
      .click();

    await expect(authenticatedPage).toHaveURL(/\/auth\/login/, {
      timeout: 5000,
    });
    expect(new URL(authenticatedPage.url()).searchParams.get("redirect")).toBe(
      "/dashboard",
    );
  },
);

anonymousTest(
  "redirect 파라미터가 외부 URL이면 로그인 후 홈으로 이동한다",
  async ({ page }) => {
    const m = mockApi(page);
    await m.fail("**/api/auth/token/refresh", 401, { success: false });
    await m.succeed("**/api/auth/login", { success: true });
    await m.succeed("**/api/users/me", {
      success: true,
      data: {
        userId: 1,
        email: "test@example.com",
        nickname: "테스터",
        name: "테스터",
        smsAgree: false,
        createdAt: "2024-01-01T00:00:00",
        modifiedAt: "2024-01-01T00:00:00",
      },
    });

    await page.goto("/auth/login?redirect=https://example.com");

    await page.getByLabel("이메일").fill("test@example.com");
    await page.getByLabel("비밀번호", { exact: true }).fill("password1234!");
    await page.getByRole("button", { name: "로그인" }).click();

    await expect(page).toHaveURL("/", { timeout: 5000 });
    // 외부 origin으로 새어나가지 않았는지 확인
    expect(new URL(page.url()).hostname).toBe("localhost");
  },
);
