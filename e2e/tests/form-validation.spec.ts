import { test, expect } from "../fixtures/auth";
import { test as publicTest, expect as publicExpect } from "@playwright/test";
import { mockApi } from "../helpers/mock-api";

/**
 * 03-form-refactor 회귀 + RED→GREEN 테스트.
 *
 * RED→GREEN:
 *  - 카드셋 생성 다이얼로그: imageRefId 없이 제출 → 에러 표시 (현재는 검증 없음)
 *
 * 회귀 (refactor 전/후 모두 PASS):
 *  - 카드셋 생성: 이름 빈 값 → 에러
 *  - 카드셋 생성: 카테고리 미선택 → 에러
 *  - 비밀번호 재설정 요청: 이메일 빈 값 → 에러
 */

const GROUP_ID = 9999;
// /api/users/me를 mock해서 알려진 userId 주입 → members mock과 일치시켜 isMember=true 보장
const MOCK_USER_ID = 42;

async function mockGroupDetailApis(page: Parameters<typeof mockApi>[0]) {
  const m = mockApi(page);

  // refreshToken → syncUser 체인 보장 (토큰 만료 시에도 통과)
  await m.succeed("**/api/auth/token/refresh", { success: true, data: {} });

  // 인증 유저 정보 고정 (isMember 판별용 userId 주입)
  await m.succeed("**/api/users/me", {
    success: true,
    data: {
      userId: MOCK_USER_ID,
      nickname: "E2E 테스터",
      email: "e2e@test.com",
      phone: "",
      smsAgree: false,
      profileImageUrl: "",
    },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}`, {
    success: true,
    data: {
      name: "E2E 테스트 그룹",
      category: "IT",
      description: "테스트",
      joinPolicy: "OPEN",
      visibility: "PUBLIC",
      maxMember: 10,
      imageUrl: "",
      createdAt: "2024-01-01T00:00:00",
      modifiedAt: "2024-01-01T00:00:00",
    },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}/members`, {
    success: true,
    data: {
      memberInfoList: [
        {
          memberId: 1,
          userId: MOCK_USER_ID,
          role: "MEMBER",
          nickname: "E2E 테스터",
          profileImage: "",
        },
      ],
    },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}/permissions`, {
    success: true,
    data: { role: "MEMBER", permissions: [] },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}/card-sets**`, {
    success: true,
    data: {
      items: [],
      content: [],
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
    },
  });
}

// ─── 비밀번호 재설정 요청 (인증 불필요) ───────────────────────────────────────

publicTest.describe("비밀번호 재설정 요청 폼", () => {
  publicTest("이메일 비어있으면 에러 표시", async ({ page }) => {
    await page.goto("/password-reset");
    await page.getByRole("button", { name: "재설정 링크 전송" }).click();
    await publicExpect(page.getByText("이메일을 입력해주세요")).toBeVisible({ timeout: 3000 });
  });

});

// ─── 카드셋 생성 다이얼로그 (인증 필요) ─────────────────────────────────────

test.describe("카드셋 생성 폼 검증", () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    await mockGroupDetailApis(authenticatedPage);
    await authenticatedPage.goto(`/groups/${GROUP_ID}`);

    // "카드셋 생성" 버튼은 isMember=true일 때만 렌더됨.
    // 현재 mock은 MEMBER 권한이므로 버튼이 표시됨.
    await authenticatedPage
      .getByRole("button", { name: "카드셋 생성" })
      .click();
    await expect(
      authenticatedPage.getByRole("dialog", { name: "카드셋 생성" }),
    ).toBeVisible({ timeout: 3000 });
  });

  test("이름 비어있으면 에러 표시", async ({ authenticatedPage }) => {
    // 이름 없이 제출
    await authenticatedPage.getByRole("button", { name: "생성" }).click();
    await expect(
      authenticatedPage.getByText("카드셋명을 입력해주세요"),
    ).toBeVisible({ timeout: 3000 });
  });

  test("카테고리 미선택 시 에러 표시", async ({ authenticatedPage }) => {
    await authenticatedPage.locator("#name").fill("테스트 카드셋");
    await authenticatedPage.getByRole("button", { name: "생성" }).click();
    // Description과 ErrorMessage 둘 다 같은 텍스트 → 빨간 에러 메시지(.text-red-500)만 확인
    await expect(
      authenticatedPage.getByText("하나 이상의 카테고리를 선택해주세요").last(),
    ).toBeVisible({ timeout: 5000 });
  });

  /**
   * RED→GREEN: imageRefId 없이 제출 시 에러 표시.
   *
   * 03 작업 전: zodResolver 없음 → imageRefId 검증 없음 → 에러 미표시 (RED)
   * 03 작업 후: zodResolver + cardsetCreateFormSchema(imageRefId required) → 에러 표시 (GREEN)
   */
  test("[RED→GREEN] 이미지 미선택 시 에러 표시", async ({ authenticatedPage }) => {
    await authenticatedPage.locator("#name").fill("테스트 카드셋");
    // ButtonCheckbox: sr-only hidden input + visible label. label을 직접 클릭
    await authenticatedPage.locator("label").filter({ hasText: /^IT$/ }).click();
    // 이미지는 선택하지 않음
    await authenticatedPage.getByRole("button", { name: "생성" }).click();
    await expect(
      authenticatedPage.getByText("이미지를 선택해주세요"),
    ).toBeVisible({ timeout: 5000 });
  });
});
