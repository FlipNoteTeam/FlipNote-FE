import { test, expect } from "../fixtures/auth";
import { mockApi } from "../helpers/mock-api";
import { mockCards } from "../fixtures/mock-data";

/**
 * 시험 모드 타이머 지속성 & 이탈 세션 복원 회귀 테스트.
 *
 * 대상: src/pages/learn/test-mode.tsx, src/shared/hooks/use-timer.ts
 *
 * 기대 동작 (버그 픽스 후 GREEN, 현재는 RED):
 *   - 시험 도중 브라우저 새로고침/탭 닫기 시 답변과 남은 시간이 보존된다.
 *   - 재진입(새로고침 / SPA 이동 후 재진입) 시 "이전에 풀던 내역" 복원
 *     다이얼로그가 뜬다.
 *   - "이어서 풀기" → 답변이 복원되고 타이머가 이어서 진행된다(전체 시간으로
 *     리셋되지 않음).
 *   - "처음부터" → 답변이 초기화되고 타이머가 전체 시간으로 리셋된다.
 *
 * 알려진 근본 원인 (이 테스트가 검증하는 대상):
 *   1) 답변/세션 저장이 effect cleanup에만 의존 → 새로고침·탭 닫기 시
 *      cleanup이 실행되지 않아 저장 자체가 누락됨. (pagehide/visibilitychange
 *      핸들러 부재)
 *   2) 새로고침 시 useTimer가 복원한 타이머를 mount effect의
 *      timer.start(full)가 덮어써 초기화함.
 *
 * DEV_MOCK 제거 후 실 API 연결 상태 기준.
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;

const STUDY_DEFAULTS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;
const SESSION_KEY = `flipnote-exam-session-${CARDSET_ID}`;
const TIMER_KEY = `flipnote-timer-${CARDSET_ID}`;

const FULL_MINUTES = 30;
const FULL_SECONDS = FULL_MINUTES * 60;

const MOCK_CARDS = mockCards.slice(0, 3);

// localStorage에 시험 모드 설정을 주입해두면 설정 화면이 시험 모드로 로드된다.
const TEST_SETTINGS = {
  mode: "test",
  isUnlimitedTime: false,
  testTimeMinutes: FULL_MINUTES,
  orderType: "sequential",
  testMode: "all",
  totalCardCount: MOCK_CARDS.length,
};

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
  await m.succeed(`**/api/card-sets/${CARDSET_ID}/cards`, {
    success: true,
    data: MOCK_CARDS,
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
}

/** 설정 화면(시험 모드) → "학습 시작" → 시험 화면 진입까지 이동 */
async function navigateToTestMode(page: Parameters<typeof mockApi>[0]) {
  await page.addInitScript(
    ({ key, value, sessionKey, timerKey }) => {
      localStorage.setItem(key, JSON.stringify(value));
      // 이전 테스트/세션 잔여 상태 제거
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(timerKey);
    },
    {
      key: STUDY_DEFAULTS_KEY,
      value: TEST_SETTINGS,
      sessionKey: SESSION_KEY,
      timerKey: TIMER_KEY,
    },
  );
  await mockAllApis(page);

  await page.goto(CARDSET_URL);
  await page.waitForSelector("text=학습 모드 선택");

  await Promise.all([
    page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
    page.getByRole("button", { name: "학습 시작" }).click(),
  ]);

  // 카드 로드 완료 = 답변 입력란 노출
  await expect(page.getByPlaceholder("답변을 입력하세요").first()).toBeVisible();
}

/** sessionStorage의 타이머 키에서 남은 시간(초)을 계산해 읽는다. */
const readTimerRemaining = (page: Parameters<typeof mockApi>[0]) =>
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

const restoreDialog = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("dialog", { name: "이전 시험 내역" });

const firstAnswer = (page: Parameters<typeof mockApi>[0]) =>
  page.getByPlaceholder("답변을 입력하세요").first();

const ANSWER_TEXT = "내가 작성한 답변입니다";

test.describe("시험 모드 — 타이머 지속성 & 이탈 세션 복원", () => {
  test("새로고침 시 복원 다이얼로그가 나타난다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await firstAnswer(page).fill(ANSWER_TEXT);
    // 타이머가 최소 1초 이상 진행되도록 대기 (남은 시간 보존 확인용)
    await page.waitForTimeout(2000);

    await page.reload();

    await expect(restoreDialog(page)).toBeVisible();
  });

  test("'이어서 풀기' 시 답변이 복원되고 타이머가 초기화되지 않는다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await firstAnswer(page).fill(ANSWER_TEXT);
    await page.waitForTimeout(2000);

    // 새로고침 직전 남은 시간(이미 일부 소요되어 전체 시간보다 작아야 함)
    const before = await readTimerRemaining(page);
    expect(before).not.toBeNull();
    expect(before!).toBeLessThan(FULL_SECONDS);

    await page.reload();

    await expect(restoreDialog(page)).toBeVisible();
    await page.getByRole("button", { name: "이어서 풀기" }).click();
    await expect(restoreDialog(page)).toBeHidden();

    // 답변 복원
    await expect(firstAnswer(page)).toHaveValue(ANSWER_TEXT);

    // 타이머가 전체 시간으로 리셋되지 않고 이어짐 (복원값 근처, +tolerance 이내)
    const after = await readTimerRemaining(page);
    expect(after).not.toBeNull();
    expect(after!).toBeLessThanOrEqual(before! + 2);
  });

  test("'처음부터' 시 답변이 초기화되고 타이머가 리셋된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await firstAnswer(page).fill(ANSWER_TEXT);
    await page.waitForTimeout(2000);

    await page.reload();

    await expect(restoreDialog(page)).toBeVisible();
    await page.getByRole("button", { name: "처음부터" }).click();
    await expect(restoreDialog(page)).toBeHidden();

    // 답변 초기화
    await expect(firstAnswer(page)).toHaveValue("");

    // 타이머 전체 시간으로 재시작
    const remaining = await readTimerRemaining(page);
    expect(remaining).not.toBeNull();
    expect(remaining!).toBeGreaterThan(FULL_SECONDS - 5);
  });

  test("SPA 이동 후 재진입 시 복원 다이얼로그가 나타나고 답변이 복원된다", async ({
    authenticatedPage: page,
  }) => {
    await navigateToTestMode(page);

    await firstAnswer(page).fill(ANSWER_TEXT);
    await page.waitForTimeout(1000);

    // 앱 내 뒤로가기(SPA) → 설정 화면으로 이탈
    await page.goBack();
    await page.waitForSelector("text=학습 모드 선택");

    // 다시 학습 시작 → 시험 화면 재진입
    await Promise.all([
      page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
      page.getByRole("button", { name: "학습 시작" }).click(),
    ]);

    await expect(restoreDialog(page)).toBeVisible();
    await page.getByRole("button", { name: "이어서 풀기" }).click();
    await expect(restoreDialog(page)).toBeHidden();

    await expect(firstAnswer(page)).toHaveValue(ANSWER_TEXT);
  });
});
