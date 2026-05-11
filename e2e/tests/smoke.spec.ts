import { test as anonymousTest, expect } from "@playwright/test";
import { test as authTest } from "../fixtures/auth";

/**
 * Smoke 테스트 — 인프라 셋업이 동작하는지 확인.
 *
 * (a) 비로그인 상태로 /auth/login 진입 → 로그인 폼 보임
 * (b) authenticatedPage로 / 진입 → "로그인" GNB 링크가 없어야 함 (로그인 상태 검증)
 *
 * (b)는 .env.local에 E2E_TEST_EMAIL / E2E_TEST_PASSWORD가 설정되어 있고
 * 해당 계정이 백엔드에 존재해야 한다.
 */

anonymousTest("비로그인 - /auth/login 진입 시 로그인 폼 노출", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.getByRole("textbox", { name: "이메일" })).toBeVisible();
  // "비밀번호 보기" 토글 버튼과 라벨이 겹치므로 textbox로 한정
  await expect(page.getByRole("textbox", { name: "비밀번호" })).toBeVisible();
});

authTest("로그인 - / 진입 시 GNB의 로그인 링크가 사라짐", async ({
  authenticatedPage,
}) => {
  await authenticatedPage.goto("/");
  // 인증되지 않았을 때만 보이는 GNB의 "로그인" 링크가 없어야 함
  await expect(
    authenticatedPage.getByRole("link", { name: "로그인" }),
  ).toHaveCount(0);
});
