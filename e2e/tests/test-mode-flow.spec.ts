import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";
import { mockCardsetApis } from "../helpers/cardset-mocks";
import { mockCards } from "../fixtures/mock-data";

/**
 * 시험 모드 진행 흐름 회귀 테스트.
 *
 * 대상: src/features/test-mode/**
 *
 * 출제 설정(test-mode-selection.spec.ts)과 세션 복원(test-mode-persistence.spec.ts)이
 * 덮지 않는 나머지 표면을 고정한다. features/ 이관 리팩토링 전에 현재 동작을
 * 박아두는 것이 목적이다.
 *   - 답변 입력 → 제출 → 채점 화면 전환
 *   - 채점 화면의 정답/오답 토글과 내 답변 표시
 *   - 답변 현황 플로팅 패널의 응답 여부 표시와 접기/펼치기
 *   - 무제한 시간 설정 시 타이머 미노출
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;

const STUDY_DEFAULTS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;
const SESSION_KEY = `flipnote-exam-session-${CARDSET_ID}`;
const TIMER_KEY = `flipnote-timer-${CARDSET_ID}`;
const SEED_KEY = `flipnote-exam-seed-${CARDSET_ID}`;

const MOCK_CARDS = mockCards.slice(0, 3);

type TestSettings = {
  mode: "test";
  isUnlimitedTime: boolean;
  testTimeMinutes: number;
  orderType: "sequential" | "random";
  testMode: "all" | "random";
  totalCardCount: number;
  randomPickCount?: number;
};

const baseSettings: TestSettings = {
  mode: "test",
  isUnlimitedTime: false,
  testTimeMinutes: 30,
  orderType: "sequential",
  testMode: "all",
  totalCardCount: MOCK_CARDS.length,
};

async function navigateToTestMode(
  page: Page,
  overrides: Partial<TestSettings> = {},
) {
  await page.addInitScript(
    ({ key, value, sessionKey, timerKey, seedKey }) => {
      localStorage.setItem(key, JSON.stringify(value));

      // addInitScript는 새로고침마다 실행되므로 컨텍스트당 1회만 초기화한다.
      // (무조건 지우면 앱이 저장한 세션까지 날아간다)
      const CLEARED = "__e2e_session_cleared";
      if (!localStorage.getItem(CLEARED)) {
        localStorage.setItem(CLEARED, "1");
        sessionStorage.removeItem(sessionKey);
        sessionStorage.removeItem(timerKey);
        sessionStorage.removeItem(seedKey);
      }
    },
    {
      key: STUDY_DEFAULTS_KEY,
      value: { ...baseSettings, ...overrides },
      sessionKey: SESSION_KEY,
      timerKey: TIMER_KEY,
      seedKey: SEED_KEY,
    },
  );
  await mockCardsetApis(page, {
    groupId: GROUP_ID,
    cardsetId: CARDSET_ID,
    cards: MOCK_CARDS,
  });

  await page.goto(CARDSET_URL);
  await page.waitForSelector("text=학습 모드 선택");

  await Promise.all([
    page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
    page.getByRole("button", { name: "학습 시작" }).click(),
  ]);

  await expect(page.getByPlaceholder("답변을 입력하세요").first()).toBeVisible();
}

const answerBoxes = (page: Page) => page.getByPlaceholder("답변을 입력하세요");

/** 답변 현황 패널의 문항 번호 버튼들 */
const navButtons = (page: Page) =>
  page.locator("button").filter({ hasText: /^\d+$/ });

test.describe("시험 모드 — 진행 흐름", () => {
  test("답변 후 제출하면 채점 화면으로 전환되고 내 답변이 표시된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await answerBoxes(page).nth(0).fill("첫 번째 답변");
    await answerBoxes(page).nth(1).fill("두 번째 답변");

    await page.getByRole("button", { name: "제출하기" }).click();

    await expect(
      page.getByRole("heading", { name: "채점하기" }),
    ).toBeVisible();

    // 문항 수만큼 채점 카드가 나오고, 입력한 답변과 정답이 함께 보인다
    await expect(page.getByText("내 답변")).toHaveCount(MOCK_CARDS.length);
    await expect(page.getByText("첫 번째 답변")).toBeVisible();
    await expect(page.getByText("두 번째 답변")).toBeVisible();
    // 미입력 문항은 (답변 없음)으로 표시
    await expect(page.getByText("(답변 없음)")).toBeVisible();
    await expect(page.getByText(MOCK_CARDS[0].answer)).toBeVisible();
  });

  test("채점 화면에서 정답/오답을 토글할 수 있다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await answerBoxes(page).nth(0).fill("답변");
    await page.getByRole("button", { name: "제출하기" }).click();
    await expect(
      page.getByRole("heading", { name: "채점하기" }),
    ).toBeVisible();

    const correctButtons = page.getByRole("button", { name: "정답" });
    const wrongButtons = page.getByRole("button", { name: "오답" });

    await expect(correctButtons).toHaveCount(MOCK_CARDS.length);
    await expect(wrongButtons).toHaveCount(MOCK_CARDS.length);

    // 채점 완료 시 alert로 점수를 알린다 (1문항 정답 → 33점)
    const dialogMessage = new Promise<string>((resolve) => {
      page.once("dialog", (dialog) => {
        const message = dialog.message();
        void dialog.dismiss().then(() => resolve(message));
      });
    });

    await correctButtons.nth(0).click();
    await page.getByRole("button", { name: "채점 완료" }).click();

    const message = await dialogMessage;
    expect(message).toContain(`1/${MOCK_CARDS.length}`);
  });

  test("답변 현황 패널이 응답 여부를 반영한다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await expect(navButtons(page)).toHaveCount(MOCK_CARDS.length);

    // 미응답 상태의 배경색
    await expect(navButtons(page).nth(0)).toHaveClass(/bg-gray-100/);

    await answerBoxes(page).nth(0).fill("답변");

    // 응답하면 강조 색으로 바뀐다
    await expect(navButtons(page).nth(0)).toHaveClass(/bg-blue-500/);
    await expect(navButtons(page).nth(1)).toHaveClass(/bg-gray-100/);
  });

  test("문항 번호를 누르면 해당 문항으로 이동한다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    const lastQuestion = page.locator(
      `#question-${MOCK_CARDS[MOCK_CARDS.length - 1].id}`,
    );

    await navButtons(page).nth(MOCK_CARDS.length - 1).click();

    await expect(lastQuestion).toBeInViewport();
  });

  test("무제한 시간이면 타이머가 노출되지 않는다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page, { isUnlimitedTime: true });

    // 타이머는 mm:ss 형태로 렌더된다
    await expect(page.getByText(/^\d+:\d{2}$/)).toHaveCount(0);
    // 제출은 그대로 가능
    await expect(
      page.getByRole("button", { name: "제출하기" }),
    ).toBeVisible();
  });
});
