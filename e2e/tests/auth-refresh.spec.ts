import { expect, type Page, type Route } from "@playwright/test";
import { test as authTest } from "../fixtures/auth";

/**
 * fix-auth 회귀 테스트 (리팩토링 전 선작성) — 401 → refreshToken single-flight.
 *
 * 현재 구조의 문제:
 * - `src/shared/apis/fetch.ts` 인터셉터는 401이 난 요청 "각각이" refreshToken()을 호출한다.
 *   화면 진입 시 N개의 요청이 동시에 401이면 refresh도 N번 나간다.
 *
 * 기대 동작(리팩토링 후):
 * - 겹쳐 있는 401은 최초 1건만 refresh를 발화하고, 나머지는 그 promise를 기다린다.
 * - 원본 요청은 요청당 정확히 1회만 재실행된다(`_retry`).
 * - refresh 실패 시 clearUser → router.invalidate로 kick되고, 추가 refresh를 시도하지 않는다.
 *
 * NOTE: 대시보드는 마운트 시 `/groups/me`와 `/groups/created`를 **병렬로** 호출한다.
 *       single-flight는 "겹쳐 있는" 401만 합치므로, 병렬 쿼리가 여러 개인 페이지여야 의미가 있다.
 * NOTE: 앱은 부팅 시 `initializeAuth()`에서 refresh를 1회 호출한다.
 *       따라서 기대 refresh 총 호출 수 = 1(초기화) + 1(동시 401 single-flight) = 2.
 *       single-flight가 없으면 1 + 2 = 3이 되어 실패한다.
 */

const REFRESH_URL = "**/api/auth/token/refresh";
const ME_URL = "**/api/users/me";
const MY_GROUPS_URL = "**/api/groups/me*";
const OWNED_GROUPS_URL = "**/api/groups/created*";

const TEST_USER = {
  userId: 1,
  email: "test@example.com",
  nickname: "테스터",
  name: "테스터",
  smsAgree: false,
  createdAt: "2024-01-01T00:00:00",
  modifiedAt: "2024-01-01T00:00:00",
};

const EMPTY_CURSOR_PAGE = {
  success: true,
  data: { content: [], hasNext: false, nextCursor: null },
};

const json = (route: Route, status: number, body: Record<string, unknown>) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

/** refresh 응답을 지연시켜 single-flight 창(window)을 넓힌다(경합 플레이키 방지). */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * `/users/me`도 반드시 고정한다.
 * syncUser()는 apiClient(=인터셉터 경유)로 `/users/me`를 부르므로, 실서버로 새어나가 401이 나면
 * 계획에 없던 refresh가 한 번 더 발화해 카운트 단언이 깨진다.
 */
const stubMyInfo = (page: Page) =>
  page.route(ME_URL, (route) =>
    json(route, 200, { success: true, data: TEST_USER }),
  );

/**
 * 첫 요청은 401, 이후 요청은 200을 돌려주는 라우트.
 * 원본 요청이 refresh 후 정확히 1회 재실행되는지 카운터로 확인한다.
 */
const routeFailFirst = async (
  page: Page,
  urlPattern: string,
  counter: { count: number },
) => {
  await page.route(urlPattern, async (route) => {
    counter.count += 1;
    if (counter.count === 1) {
      await json(route, 401, { success: false, message: "unauthorized" });
      return;
    }
    await json(route, 200, EMPTY_CURSOR_PAGE);
  });
};

authTest(
  "동시에 여러 401이 발생해도 refresh는 한 번만 호출되고 원본 요청은 1회만 재시도된다",
  async ({ authenticatedPage: page }) => {
    const refresh = { count: 0 };
    const myGroups = { count: 0 };
    const ownedGroups = { count: 0 };

    await page.route(REFRESH_URL, async (route) => {
      refresh.count += 1;
      await delay(300);
      await json(route, 200, { success: true });
    });

    await stubMyInfo(page);
    await routeFailFirst(page, MY_GROUPS_URL, myGroups);
    await routeFailFirst(page, OWNED_GROUPS_URL, ownedGroups);

    await page.goto("/dashboard");

    // 두 요청 모두 원본 1회 + 재시도 1회 = 2회
    await expect.poll(() => myGroups.count, { timeout: 10_000 }).toBe(2);
    await expect.poll(() => ownedGroups.count, { timeout: 10_000 }).toBe(2);

    // 1(앱 초기화) + 1(동시 401 single-flight)
    expect(refresh.count).toBe(2);

    // 재시도가 성공했으므로 로그인 페이지로 튕기지 않는다
    await expect(page).toHaveURL(/\/dashboard$/);

    // 잔여 요청이 뒤늦게 들어와 카운트를 올리지 않는지 확인
    await delay(1000);
    expect(myGroups.count).toBe(2);
    expect(ownedGroups.count).toBe(2);
    expect(refresh.count).toBe(2);
  },
);

authTest(
  "refresh가 실패하면 로그인 페이지로 kick되고 추가 refresh를 시도하지 않는다",
  async ({ authenticatedPage: page }) => {
    const refresh = { count: 0 };
    const myGroups = { count: 0 };
    const ownedGroups = { count: 0 };

    // 1회차(앱 초기화)는 성공, 이후 refresh는 모두 실패
    await page.route(REFRESH_URL, async (route) => {
      refresh.count += 1;
      if (refresh.count === 1) {
        await json(route, 200, { success: true });
        return;
      }
      await delay(300);
      await json(route, 401, { success: false, message: "unauthorized" });
    });

    await stubMyInfo(page);
    await page.route(MY_GROUPS_URL, async (route) => {
      myGroups.count += 1;
      await json(route, 401, { success: false, message: "unauthorized" });
    });
    await page.route(OWNED_GROUPS_URL, async (route) => {
      ownedGroups.count += 1;
      await json(route, 401, { success: false, message: "unauthorized" });
    });

    await page.goto("/dashboard");

    // clearUser → router.invalidate → 보호 라우트에서 kick
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    expect(new URL(page.url()).searchParams.get("redirect")).toBe("/dashboard");

    // 1(앱 초기화 성공) + 1(동시 401 single-flight, 실패) — 실패 후 재시도 없음
    await delay(1500);
    expect(refresh.count).toBe(2);
  },
);
