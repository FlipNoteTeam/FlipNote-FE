import { test as anonymousTest, expect } from "@playwright/test";
import { test as authTest } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";

/**
 * 01-error-centralize 회귀 테스트.
 *
 * (1) 글로벌 mutation onError → toast 노출 (로그아웃 mutation으로 검증)
 * (2) meta.skipErrorToast: true → toast 미노출 (password-reset 폼으로 검증)
 *
 * NOTE: 원래 시나리오는 (1) 그룹 생성 + (2) 카드셋 즐겨찾기 409였으나,
 * - /groups/create 페이지는 form↔request 필드 매핑 미스 버그가 있어 mutation 자체가 발화 안 함 (별도 픽스 필요)
 * - 카드셋 상세 페이지는 GET cardset/group/members 의존성이 많아 mocking 비용이 큼
 * 같은 글로벌/skipErrorToast 동작을 가볍게 검증하기 위해 로그아웃·password-reset 흐름으로 대체.
 */

authTest("로그아웃 실패 시 글로벌 toast 노출", async ({ authenticatedPage }) => {
  // 로그아웃 요청 실패하도록 mock
  await mockApi(authenticatedPage).fail("**/api/auth/logout", 500, {
    success: false,
    message: "서버 오류",
  });

  await authenticatedPage.goto("/");

  // GNB 드롭다운 트리거(닉네임)를 클릭한 뒤 로그아웃 메뉴 클릭
  await authenticatedPage.getByRole("button", { name: /님$/ }).first().click();
  await authenticatedPage.getByRole("menuitem", { name: "로그아웃" }).click();

  // useLogout은 meta 미설정 → 글로벌 onError 발화
  // 서버 message가 있으면 그것, 없으면 기본 fallback("요청에 실패했습니다.")
  await expect(
    authenticatedPage
      .locator("[data-sonner-toast]")
      .filter({ hasText: /서버 오류|요청에 실패했습니다/ }),
  ).toBeVisible({ timeout: 3000 });
});

anonymousTest(
  "비밀번호 재설정 요청 실패 시 글로벌 toast 미노출 (skipErrorToast)",
  async ({ page }) => {
    // POST 실패 mock
    await mockApi(page).fail("**/api/auth/password-reset/request", 500, {
      success: false,
      message: "서버 오류",
    });

    await page.goto("/password-reset");

    // 이메일 입력 + 제출
    await page.getByLabel("이메일").fill("test@example.com");
    await page.getByRole("button", { name: /재설정 링크 전송/ }).click();

    // 인라인 에러는 노출되어야 함
    await expect(page.getByText(/서버 오류|이메일 전송에 실패/)).toBeVisible({
      timeout: 3000,
    });

    // 글로벌 toast는 노출되지 않아야 함
    // sonner toast는 role="status" 또는 data-sonner-toast 속성을 갖는다
    // 짧은 대기 후 toast 존재 여부 확인 (없어야 정상)
    await page.waitForTimeout(800);
    const toastCount = await page
      .locator("[data-sonner-toast]")
      .filter({ hasText: /실패|오류/ })
      .count();
    expect(toastCount).toBe(0);
  },
);
