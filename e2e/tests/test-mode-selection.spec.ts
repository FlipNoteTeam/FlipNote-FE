import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";
import { mockCardsetApis } from "../helpers/cardset-mocks";
import { mockCards } from "../fixtures/mock-data";

/**
 * 시험 모드 설정 반영 회귀 테스트.
 *
 * 대상: src/pages/learn/test-mode.tsx,
 *      src/features/test-mode/model/select-test-cards.ts,
 *      src/routes/cardsets/learning/index.tsx
 *
 * 배경 (이 테스트가 막는 버그):
 *   1) 라우트는 state를 `{ groupId, cardsetId, settings }`로 중첩해 넘기는데
 *      TestMode가 `state.testTimeMinutes`처럼 평평하게 읽어서 모든 설정이
 *      undefined → 시험 시간이 항상 30분 고정이었다.
 *   2) orderType / testMode / randomPickCount를 읽는 코드가 아예 없어서
 *      "랜덤 뽑기 N개"를 설정해도 항상 전체 카드가 출제됐다.
 *
 * 출제 안정성:
 *   랜덤 뽑기는 세션 시드에 묶여 있어야 한다. 새로고침마다 다시 뽑으면
 *   questionKey 기준으로 복원되는 답변이 화면에 없는 카드를 가리켜 세션이 깨진다.
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;

const STUDY_DEFAULTS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;
const SESSION_KEY = `flipnote-exam-session-${CARDSET_ID}`;
const TIMER_KEY = `flipnote-timer-${CARDSET_ID}`;
const SEED_KEY = `flipnote-exam-seed-${CARDSET_ID}`;

const MOCK_CARDS = mockCards; // Q1..Q6

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

/** 설정 화면(시험 모드) → "학습 시작" → 시험 화면 진입까지 이동 */
async function navigateToTestMode(
  page: Page,
  overrides: Partial<TestSettings> = {},
) {
  await page.addInitScript(
    ({ key, value, sessionKey, timerKey, seedKey }) => {
      localStorage.setItem(key, JSON.stringify(value));

      // addInitScript는 새로고침을 포함한 모든 네비게이션마다 실행된다.
      // 무조건 지우면 새로고침 때 앱이 저장해둔 세션까지 날려서 복원 동작을
      // 검증할 수 없다. 컨텍스트당 최초 1회만 초기화한다.
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

/** 화면에 출제된 문항 라벨을 순서대로 읽는다 (예: ["Q3", "Q1", "Q5"]). */
async function readQuestions(page: Page) {
  const headings = await page.locator("h3").allInnerTexts();
  return headings
    .map((text) => text.replace(/^\d+\.\s*/, "").trim())
    .filter((text) => /^Q\d+$/.test(text));
}

/** sessionStorage의 타이머 키에서 남은 시간(초)을 계산해 읽는다. */
const readTimerRemaining = (page: Page) =>
  page.evaluate((key) => {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as
        | { status: "running"; endTime: number }
        | { status: "paused"; remainingMs: number };
      if (s.status === "running") return (s.endTime - Date.now()) / 1000;
      if (s.status === "paused") return s.remainingMs / 1000;
    } catch {
      return null;
    }
    return null;
  }, TIMER_KEY);

test.describe("시험 모드 — 설정값 반영", () => {
  test("전체 시험 + 순차는 카드를 원본 순서 그대로 출제한다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await expect(answerBoxes(page)).toHaveCount(MOCK_CARDS.length);
    expect(await readQuestions(page)).toEqual(
      MOCK_CARDS.map((card) => card.question),
    );
  });

  test("설정한 시험 시간이 타이머에 반영된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page, { testTimeMinutes: 10 });

    const remaining = await readTimerRemaining(page);
    expect(remaining).not.toBeNull();
    // 10분(600초)으로 시작 — 하드코딩된 30분 폴백이면 1800초가 나온다
    expect(remaining!).toBeGreaterThan(10 * 60 - 30);
    expect(remaining!).toBeLessThanOrEqual(10 * 60);
  });

  test("랜덤 뽑기 N개를 설정하면 N문항만 출제된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page, { testMode: "random", randomPickCount: 3 });

    await expect(answerBoxes(page)).toHaveCount(3);

    const questions = await readQuestions(page);
    expect(questions).toHaveLength(3);
    // 전체 카드의 부분집합이어야 한다
    for (const question of questions) {
      expect(MOCK_CARDS.map((card) => card.question)).toContain(question);
    }
    expect(new Set(questions).size).toBe(3);
  });

  test("랜덤 시험 순서는 전체 카드를 유지한 채 순서만 바꾼다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page, { orderType: "random" });

    await expect(answerBoxes(page)).toHaveCount(MOCK_CARDS.length);
    expect([...(await readQuestions(page))].sort()).toEqual(
      MOCK_CARDS.map((card) => card.question).sort(),
    );
  });

  test("랜덤 뽑기 중 새로고침 후 '이어서 풀기'하면 같은 문항이 유지된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page, { testMode: "random", randomPickCount: 3 });

    const before = await readQuestions(page);
    expect(before).toHaveLength(3);

    const answerText = "새로고침 전에 쓴 답변";
    await answerBoxes(page).first().fill(answerText);
    await page.waitForTimeout(1000);

    await page.reload();

    const dialog = page.getByRole("dialog", { name: "이전 시험 내역" });
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "이어서 풀기" }).click();
    await expect(dialog).toBeHidden();

    // 같은 문항이 같은 순서로 복원되어야 답변 매칭이 깨지지 않는다
    expect(await readQuestions(page)).toEqual(before);
    await expect(answerBoxes(page).first()).toHaveValue(answerText);
  });
});
