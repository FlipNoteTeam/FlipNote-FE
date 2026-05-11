import type { Page } from "@playwright/test";

// Playwright `page.route` 기반의 간이 API 모킹 helper.
//
// dev 서버가 `/api/*`를 백엔드로 proxy하는 구조이므로 같은 패턴으로 인터셉트한다.
//
// 사용:
//   await mockApi(page).fail("**" + "/api/auth/login", 401, { message: "..." });
//   await mockApi(page).succeed("**" + "/api/groups", { success: true, data: { ... } });
export const mockApi = (page: Page) => ({
  /** 지정된 패턴의 요청을 실패 응답으로 가로챈다. */
  fail: (
    urlPattern: string | RegExp,
    status: number,
    body: Record<string, unknown> = {},
  ) =>
    page.route(urlPattern, (route) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      }),
    ),

  /** 지정된 패턴의 요청을 성공 응답으로 가로챈다. */
  succeed: (urlPattern: string | RegExp, body: Record<string, unknown>) =>
    page.route(urlPattern, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      }),
    ),

  /** 커스텀 응답 (status·body·headers 임의 지정). */
  respond: (
    urlPattern: string | RegExp,
    init: {
      status?: number;
      body?: Record<string, unknown>;
      headers?: Record<string, string>;
    },
  ) =>
    page.route(urlPattern, (route) =>
      route.fulfill({
        status: init.status ?? 200,
        contentType: "application/json",
        headers: init.headers,
        body: JSON.stringify(init.body ?? {}),
      }),
    ),
});
