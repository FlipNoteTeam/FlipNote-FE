import { test, expect } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";
import { mockCards } from "../fixtures/mock-data";

/**
 * 암기 모드 설정 "규약(contract)" 회귀 테스트 — Phase 1.
 *
 * 배경: 기존 구현은 재생 중에도 콘텐츠 설정을 라이브로 바꿀 수 있고, 설정을
 *       바꿔도 현재 카드 인덱스/회차가 그대로라 동작이 일관되지 않았다.
 *
 * 새 규약:
 *   (A) 재생 중(isPlaying) — 콘텐츠 설정 잠금
 *       - 반복 횟수 input, 순서 토글, 무한반복 토글 → disabled
 *       - 속도(자동 넘김) input → 항상 enabled (배속처럼 상시 조절 허용)
 *   (B) 일시정지 중 콘텐츠 설정 변경 → 1회차·1번 카드로 리셋 + 정지 유지
 *       - repeatCount / orderType / (향후 cardset) 변경 시 currentRound=1,
 *         carousel index=0 으로 리셋
 *       - 변경 후 자동으로 재생을 시작하지 않는다 (Play 버튼이 보이는 정지 상태)
 *
 * spec-first: 현재 구현 기준으로는 실패(red)하며, 리팩토링 완료 시 통과(green).
 *
 * 필요한 접근성 마커 (리팩토링이 노출해야 함):
 *   - Next 버튼:            aria-label="다음 카드"
 *   - Play 버튼(정지):      aria-label="재생"
 *   - Pause 버튼(재생중):   aria-label="일시정지"
 *   - 회차 표시 span:       aria-label="현재 회차"
 *   - repeatCount input:    aria-label="반복 횟수"       (role=spinbutton)
 *   - 속도 input:           aria-label="자동 넘김 속도"  (role=spinbutton)
 *   - 순서 토글 버튼:       aria-label="순차 정렬"/"랜덤 정렬" (상태 반영 동적 라벨)
 *   - 활성 캐러셀 슬라이드:  aria-current="true"
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;
const LS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;

const MOCK_CARDS = mockCards.slice(0, 2);

async function mockAllApis(page: Parameters<typeof mockApi>[0]) {
  const m = mockApi(page);

  await m.succeed("**/api/auth/token/refresh", { success: true, data: {} });
  await m.succeed("**/api/users/me", {
    success: true,
    data: {
      userId: 1,
      nickname: "테스터",
      email: "test@test.com",
      phone: "",
      smsAgree: false,
      profileImageUrl: "",
    },
  });
  await m.succeed(`**/api/card-sets/${CARDSET_ID}`, {
    success: true,
    data: {
      id: CARDSET_ID,
      name: "테스트 카드셋",
      groupId: GROUP_ID,
      visibility: "PUBLIC",
      category: "IT",
      hashtag: "",
      imageRefId: 0,
      imageUrl: "",
      cardCount: MOCK_CARDS.length,
      likeCount: 0,
      bookmarkCount: 0,
      createdAt: "2024-01-01T00:00:00",
      updatedAt: "2024-01-01T00:00:00",
      liked: false,
      bookmarked: false,
      managers: [],
    },
  });
  await m.succeed(`**/api/groups/${GROUP_ID}`, {
    success: true,
    data: {
      groupId: GROUP_ID,
      name: "테스트 그룹",
      category: "IT",
      description: "",
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
    data: { memberInfoList: [] },
  });
  await m.succeed(`**/api/groups/${GROUP_ID}/permissions`, {
    success: true,
    data: { role: "MEMBER", permissions: [] },
  });
  await m.succeed(`**/api/card-sets/${CARDSET_ID}/cards`, {
    success: true,
    data: MOCK_CARDS,
  });
}

/** localStorage에 설정을 주입하고 학습 화면까지 이동 */
async function navigateToLearning(
  page: Parameters<typeof mockApi>[0],
  settings: Record<string, unknown>,
) {
  await page.addInitScript(
    ({ key, value }: { key: string; value: unknown }) =>
      localStorage.setItem(key, JSON.stringify(value)),
    { key: LS_KEY, value: settings },
  );
  await mockAllApis(page);
  await page.goto(CARDSET_URL);
  await page.waitForSelector("text=학습 모드 선택");

  await Promise.all([
    page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
    page.getByRole("button", { name: "학습 시작" }).click(),
  ]);
}

// 자동 재생 모드 — 진입 즉시 isPlaying=true. 속도를 크게 잡아 테스트 도중
// 자동 넘김이 발생하지 않도록 한다 (타이밍 비의존).
const autoSettings = {
  mode: "memorize",
  navigationType: "auto",
  isUnlimitedRepeat: false,
  repeatCount: 2,
  orderType: "sequential",
  autoTimerSeconds: 60,
};

// 수동 모드 — 진입 시 정지 상태(isPlaying=false).
const manualSettings = {
  ...autoSettings,
  navigationType: "manual",
};

const roundDisplay = (page: Parameters<typeof mockApi>[0]) =>
  page.locator('[aria-label="현재 회차"]');
const repeatInput = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("spinbutton", { name: "반복 횟수" });
const speedInput = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("spinbutton", { name: "자동 넘김 속도" });
// 순서 토글은 상태를 반영하는 동적 라벨("순차 정렬"↔"랜덤 정렬")을 쓴다.
// 두 상태 모두 매칭하도록 정규식으로 찾는다 (다른 컨트롤 라벨과 겹치지 않음).
const orderToggle = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("button", { name: /(순차|랜덤) 정렬/ });
const nextBtn = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("button", { name: "다음 카드" });

test.describe("암기 모드 — 규약 (A) 재생 중 콘텐츠 설정 잠금", () => {
  test("재생 중에는 반복 횟수 input과 순서 토글이 비활성화된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, autoSettings);

    // 진입 즉시 재생 상태
    await expect(page.getByRole("button", { name: "일시정지" })).toBeVisible();

    await expect(repeatInput(page)).toBeDisabled();
    await expect(orderToggle(page)).toBeDisabled();
  });

  test("재생 중에도 속도 input은 조절 가능하다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, autoSettings);

    await expect(page.getByRole("button", { name: "일시정지" })).toBeVisible();

    // 속도는 콘텐츠 순서에 영향 없으므로 재생 중에도 enabled
    await expect(speedInput(page)).toBeEnabled();
    await speedInput(page).fill("10");
    await expect(speedInput(page)).toHaveValue("10");
  });

  test("일시정지하면 콘텐츠 설정이 다시 활성화된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, autoSettings);

    await page.getByRole("button", { name: "일시정지" }).click();

    await expect(page.getByRole("button", { name: "재생" })).toBeVisible();
    await expect(repeatInput(page)).toBeEnabled();
    await expect(orderToggle(page)).toBeEnabled();
  });
});

test.describe("암기 모드 — 규약 (B) 일시정지 중 변경 시 리셋 + 정지 유지", () => {
  test("반복 횟수를 바꾸면 1회차·1번 카드로 리셋된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, manualSettings); // 정지, repeat=2, 2장

    // 2회차·마지막 카드까지 진행
    await nextBtn(page).click(); // Q1 → Q2
    await nextBtn(page).click(); // Q2(마지막) → 2회차 Q1
    await expect(roundDisplay(page)).toHaveText("2 / 2회차");

    // 정지 상태에서 반복 횟수 변경 → 리셋
    await repeatInput(page).fill("5");
    await repeatInput(page).blur();

    await expect(roundDisplay(page)).toHaveText("1 / 5회차");
    await expect(page.locator('[aria-current="true"]')).toContainText("Q1");
  });

  test("순서(정렬)를 바꾸면 회차·카드 인덱스가 리셋된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, manualSettings); // 정지, sequential, repeat=2

    // 2회차로 진입
    await nextBtn(page).click(); // Q1 → Q2
    await nextBtn(page).click(); // Q2 → 2회차 Q1
    await expect(roundDisplay(page)).toHaveText("2 / 2회차");

    // 정지 상태에서 순서 토글 → 회차 리셋
    await orderToggle(page).click();

    await expect(roundDisplay(page)).toHaveText("1 / 2회차");
  });

  test("일시정지 후 설정을 바꿔도 자동으로 재생되지 않고 정지 상태를 유지한다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, autoSettings); // 재생 상태로 진입

    // 몇 장 진행 후 일시정지
    await nextBtn(page).click(); // Q1 → Q2
    await page.getByRole("button", { name: "일시정지" }).click();
    await expect(page.getByRole("button", { name: "재생" })).toBeVisible();

    // 정지 상태에서 콘텐츠 설정 변경
    await repeatInput(page).fill("3");
    await repeatInput(page).blur();

    // 리셋되지만 재생은 시작되지 않음 (여전히 Play 버튼)
    await expect(page.getByRole("button", { name: "재생" })).toBeVisible();
    await expect(roundDisplay(page)).toHaveText("1 / 3회차");
    await expect(page.locator('[aria-current="true"]')).toContainText("Q1");
  });
});
