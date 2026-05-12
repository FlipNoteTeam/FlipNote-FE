import { test as authTest, expect } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";

/**
 * 05-notification 회귀 테스트.
 *
 * (A) 읽음 처리 즉시 캐시 반영 — Bug 1(캐시 키 불일치) + Bug 2(unreadCount 첫 페이지만) + Bug 3(이중 계산)
 * (B) 모두 읽음 즉시 반영 — Bug 1 + 2 + 3
 *
 * 공통 전략:
 *   - auth 관련 API를 함께 모킹해 백엔드에 무관하게 인증 상태를 확보
 *   - GET /notifications 를 mock 하여 unread 알림을 미리 세팅
 *   - 초기 로드 후 GET 을 abort 해 이후 UI 변경이 refetch가 아닌 cache 갱신임을 보장
 *   - 캐시 키 버그가 있으면 setQueriesData 가 ["notifications", undefined] 를 업데이트하지 못해 UI 가 변하지 않음
 *
 * NOTE: Bug 4(FCM 포그라운드 invalidation), Bug 6(토큰 갱신), Bug 7(listener cleanup)은
 *       Firebase SDK 내부를 Playwright 가 직접 제어할 수 없어 수동 검증으로 대체.
 */

const TEST_USER = {
  userId: 9001,
  email: "e2e@test.com",
  nickname: "E2E테스터",
  name: "E2E Tester",
  smsAgree: false,
  createdAt: "2024-01-01T00:00:00",
  modifiedAt: "2024-01-01T00:00:00",
};

const N1 = {
  notificationId: 1,
  groupId: 1,
  message: "E2E 테스트 알림 1",
  metadata: {},
  isRead: false,
  createdAt: "2024-01-01T00:00:00",
};

const N2 = {
  notificationId: 2,
  groupId: 1,
  message: "E2E 테스트 알림 2",
  metadata: {},
  isRead: false,
  createdAt: "2024-01-01T00:00:00",
};

/** auth 관련 API 모킹 — 백엔드 없이도 인증된 사용자 상태를 재현 */
const setupAuthMocks = async (page: Parameters<typeof mockApi>[0]) => {
  // 토큰 리프레시 (항상 성공)
  await page.route("**/api/auth/token/refresh", (route) =>
    route.fulfill({ status: 204 }),
  );
  // 사용자 정보 (고정 테스트 유저 반환)
  await page.route("**/api/users/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: TEST_USER }),
    }),
  );
  // FCM 토큰 등록 (무시)
  await page.route("**/api/notifications/token", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: "" }) }),
  );
};

/** GET /notifications (쿼리스트링 포함) 를 mock한다. */
const mockNotificationList = async (
  page: Parameters<typeof mockApi>[0],
  items: object[],
) =>
  page.route(/\/api\/notifications(\?.*)?$/, (route) =>
    route.request().method() === "GET"
      ? route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            data: {
              content: items,
              hasNext: false,
              nextCursor: null,
              size: items.length,
            },
          }),
        })
      : route.continue(),
  );

authTest(
  "(A) 읽음 처리 후 즉시 배지 감소 + 읽음 상태 반영",
  async ({ authenticatedPage }) => {
    await setupAuthMocks(authenticatedPage);
    await mockNotificationList(authenticatedPage, [N1, N2]);
    await mockApi(authenticatedPage).succeed(
      "**/api/notifications/1/read",
      { success: true, data: null },
    );

    await authenticatedPage.goto("/");

    // GNB 배지에 '2' 표시 대기
    const badge = authenticatedPage.locator("span.bg-red-500");
    await expect(badge).toContainText("2", { timeout: 8000 });

    // 초기 로드 완료 후 GET 재호출 차단 (cache-only update 검증)
    await authenticatedPage.route(/\/api\/notifications(\?.*)?$/, (route) =>
      route.request().method() === "GET" ? route.abort() : route.continue(),
    );

    // 알림 시트 열기
    await badge.click();
    await expect(
      authenticatedPage.getByText("E2E 테스트 알림 1"),
    ).toBeVisible({ timeout: 3000 });

    // 첫 번째 알림 클릭 → mark-as-read 호출
    await authenticatedPage.getByText("E2E 테스트 알림 1").click();

    // 배지가 1로 줄어야 함 (setQueriesData 캐시 갱신)
    await expect(badge).toContainText("1", { timeout: 3000 });

    // 해당 알림 아이템에서 unread 파란 점이 사라져야 함
    const firstItem = authenticatedPage
      .locator(".rounded-lg.border")
      .filter({ hasText: "E2E 테스트 알림 1" });
    await expect(firstItem).not.toHaveClass(/border-blue-200/, {
      timeout: 3000,
    });
  },
);

authTest(
  "(B) 모두 읽음 처리 후 즉시 배지 사라짐 + 모든 아이템 읽음 상태",
  async ({ authenticatedPage }) => {
    await setupAuthMocks(authenticatedPage);
    await mockNotificationList(authenticatedPage, [N1, N2]);
    await mockApi(authenticatedPage).succeed(
      "**/api/notifications/read-all",
      { success: true, data: null },
    );

    await authenticatedPage.goto("/");

    const badge = authenticatedPage.locator("span.bg-red-500");
    await expect(badge).toContainText("2", { timeout: 8000 });

    // 초기 로드 후 GET 차단
    await authenticatedPage.route(/\/api\/notifications(\?.*)?$/, (route) =>
      route.request().method() === "GET" ? route.abort() : route.continue(),
    );

    await badge.click();

    // 시트 내 "모두 읽음" 버튼 클릭
    await expect(
      authenticatedPage.getByRole("button", { name: "모두 읽음" }),
    ).toBeVisible({ timeout: 3000 });
    await authenticatedPage.getByRole("button", { name: "모두 읽음" }).click();

    // 배지 사라짐 (unreadCount → 0)
    await expect(badge).toHaveCount(0, { timeout: 3000 });

    // 알림 아이템들이 읽음 상태(파란 점 없음)
    await expect(
      authenticatedPage.locator(".w-2.h-2.bg-blue-500.rounded-full"),
    ).toHaveCount(0, { timeout: 3000 });
  },
);
