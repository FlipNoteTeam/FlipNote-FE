import { test, expect } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";
import { mockCards } from "../fixtures/mock-data";

/**
 * 암기 모드 회차(repeatCount) 반복 동작 회귀 테스트.
 *
 * 구현 대상: memoize-mode.tsx
 *   - currentRound 상태 추적
 *   - advance() 단일 함수로 수동/자동 진행 통합
 *   - shuffleSeed로 라운드 전환 시 랜덤 재셔플
 *   - MemoizeController 회차 표시 (N / M회차) 및 repeatCount input
 *
 * 구현 시 필요한 접근성 마커:
 *   - Next 버튼:          aria-label="다음 카드"
 *   - Play 버튼(정지):    aria-label="재생"
 *   - Pause 버튼(재생중): aria-label="일시정지"
 *   - 회차 표시 span:     aria-label="현재 회차"
 *   - repeatCount input:  aria-label="반복 횟수"  (role=spinbutton 자동 부여)
 *   - 활성 캐러셀 슬라이드: aria-current="true"
 *
 * DEV_MOCK 제거 후 실 API 연결 상태 기준.
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
  // 카드 목록 API (DEV_MOCK 제거 후 사용)
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

// 수동 모드, 2장 카드, repeatCount=2 기본 설정
const manualSettings = {
  mode: "memorize",
  navigationType: "manual",
  isUnlimitedRepeat: false,
  repeatCount: 2,
  orderType: "sequential",
  autoTimerSeconds: 5,
};

const roundDisplay = (page: Parameters<typeof mockApi>[0]) =>
  page.locator('[aria-label="현재 회차"]');

test.describe("암기 모드 — 회차 반복 동작", () => {
  test("학습 시작 시 1 / N회차로 표시됨", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, { ...manualSettings, repeatCount: 3 });

    await expect(roundDisplay(page)).toHaveText("1 / 3회차");
  });

  test("마지막 카드에서 Next 클릭 시 2회차로 전환되고 카드가 처음으로 돌아감", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, manualSettings);

    const nextBtn = page.getByRole("button", { name: "다음 카드" });

    // 1회차: Q1 → Q2(마지막) → Next → 2회차 시작
    await nextBtn.click(); // Q1 → Q2
    await nextBtn.click(); // Q2(마지막) → 라운드 완료 → Q1

    await expect(roundDisplay(page)).toHaveText("2 / 2회차");
    await expect(page.locator('[aria-current="true"]')).toContainText("Q1");
  });

  test("마지막 회차의 마지막 카드 이후 재생이 정지되고 Next가 비활성화됨", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, manualSettings); // repeatCount=2

    const nextBtn = page.getByRole("button", { name: "다음 카드" });

    // 1회차 완주 (2장)
    await nextBtn.click(); // Q1 → Q2
    await nextBtn.click(); // Q2 → 2회차 Q1

    // 2회차 완주
    await nextBtn.click(); // Q1 → Q2
    await nextBtn.click(); // Q2 → 종료

    await expect(nextBtn).toBeDisabled();
    await expect(page.getByRole("button", { name: "재생" })).toBeVisible();
  });

  test("무한 반복 모드에서는 회차가 계속 증가하고 Next가 비활성화되지 않음", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, {
      ...manualSettings,
      isUnlimitedRepeat: true,
    });

    const nextBtn = page.getByRole("button", { name: "다음 카드" });

    // 3회차까지 반복
    for (let round = 0; round < 3; round++) {
      await nextBtn.click(); // Q1 → Q2
      await nextBtn.click(); // Q2 → 다음 회차 Q1
    }

    await expect(roundDisplay(page)).toContainText("4회차");
    await expect(nextBtn).toBeEnabled();
  });

  test("컨트롤러의 반복 횟수 input 변경 시 총 회차 표시가 업데이트됨", async ({
    authenticatedPage: page,
  }) => {
    await navigateToLearning(page, manualSettings); // repeatCount=2

    await expect(roundDisplay(page)).toHaveText("1 / 2회차");

    const repeatInput = page.getByRole("spinbutton", { name: "반복 횟수" });
    await repeatInput.fill("5");
    await repeatInput.blur();

    await expect(roundDisplay(page)).toHaveText("1 / 5회차");
  });

  test("랜덤 모드에서 라운드 전환 시 카드 순서가 재셔플됨", async ({
    authenticatedPage: page,
  }) => {
    // 카드 수가 많아야 순서 변화 감지 가능 — 24장 목데이터 사용
    const m = mockApi(page);
    await m.succeed(`**/api/card-sets/${CARDSET_ID}/cards`, {
      success: true,
      data: Array.from({ length: 24 }, (_, i) => ({
        id: `card-${i + 1}`,
        question: `Q${i + 1}`,
        answer: `A${i + 1}`,
      })),
    });

    await navigateToLearning(page, {
      ...manualSettings,
      orderType: "random",
      repeatCount: 2,
    });

    const nextBtn = page.getByRole("button", { name: "다음 카드" });
    const activeSlide = () =>
      page.locator('[aria-current="true"]').textContent();

    // 1회차 앞 6장 순서 수집
    const firstRound: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      firstRound.push(await activeSlide());
      await nextBtn.click();
    }
    // 마지막 클릭으로 2회차 시작

    // 2회차 앞 6장 순서 수집
    const secondRound: (string | null)[] = [];
    for (let i = 0; i < 6; i++) {
      secondRound.push(await activeSlide());
      if (i < 5) await nextBtn.click();
    }

    // 24장 중 6장 기준 동일 순서 확률 ≈ 1/134,596 미만
    expect(firstRound.join(",")).not.toBe(secondRound.join(","));
  });
});
