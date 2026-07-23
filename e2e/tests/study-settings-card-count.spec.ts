import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";
import { mockCardsetApis } from "../helpers/cardset-mocks";
import { mockCards } from "../fixtures/mock-data";

/**
 * 학습 설정 — 전체 카드 개수 산출 회귀 테스트.
 *
 * 대상: src/features/cardset/components/cardset-detail-content.tsx,
 *      src/features/setting-study-mode/**
 *
 * 배경: 카드셋 상세 API의 cardCount가 실제 카드 수와 무관하게 항상 10으로 온다
 * (2026-07-21 실서버 확인: 카드 3개인 카드셋도, 0개인 카드셋도 모두 10).
 * 서버가 채워줄 때까지 카드 목록 길이를 신뢰한다.
 *
 * 정책: 랜덤 뽑기의 입력값은 낼 문제 수의 **상한**이다. 카드가 더 적으면 있는
 * 만큼만 출제하므로 초과 입력은 오류가 아니고, 카드 개수는 정보성으로만 보여준다.
 *
 * 하한 1개는 입력 단계에서 1로 보정한다. 폼에 noValidate가 없어 범위 위반은
 * 브라우저가 제출을 막아버리고 zod 메시지까지 도달하지 못하므로, 0이 폼 상태에
 * 들어가지 않게 입력 시점에 끊는다. 단 빈 값은 허용해(undefined) 제출 시 zod
 * 안내가 뜨게 둔다 — 빈 값은 min 위반이 아니라 네이티브 검증을 통과한다.
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;
const LS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;

/** 서버가 내려주는 (신뢰할 수 없는) cardCount */
const STALE_SERVER_CARD_COUNT = 10;

async function openTestSettings(
  page: Page,
  cards: readonly { id: string; question: string; answer: string }[],
  storedSettings?: { mode?: string; testMode?: string; [key: string]: unknown },
) {
  await page.addInitScript(
    ({ key, value }) => {
      if (value) localStorage.setItem(key, JSON.stringify(value));
      else localStorage.removeItem(key);
    },
    { key: LS_KEY, value: storedSettings ?? null },
  );

  await mockCardsetApis(page, {
    groupId: GROUP_ID,
    cardsetId: CARDSET_ID,
    cards,
    // 서버 버그 재현: 실제 카드 수와 무관하게 10을 내려준다
    cardCount: STALE_SERVER_CARD_COUNT,
  });

  await page.goto(CARDSET_URL);
  await page.waitForSelector("text=학습 모드 선택");

  // ButtonCheckbox/ToggleGroup은 sr-only input + label 구조라 label을 클릭한다.
  // "시험 모드"는 모드 선택과 섹션 제목 두 곳에 나오므로 설명 문구로 특정한다.
  // 이미 시험 모드로 복원된 상태에서 다시 누르면 폼이 reset되어(handleModeChange)
  // 저장값 복원을 검증할 수 없으므로 필요할 때만 누른다.
  if (storedSettings?.mode !== "test") {
    await page.locator("label", { hasText: "실전처럼" }).click();
  }

  const randomPick = page.locator("label", { hasText: "랜덤 뽑기" });
  if (storedSettings?.testMode !== "random") {
    await randomPick.click();
  }
}

const pickCountInput = (page: Page) => page.locator("#randomPickCount");

test.describe("학습 설정 — 전체 카드 개수", () => {
  test("서버 cardCount가 아니라 실제 카드 수를 안내한다", async ({
    authenticatedPage: page,
  }) => {
    const cards = mockCards.slice(0, 3);
    await openTestSettings(page, cards);

    await expect(
      page.getByText(`현재 카드셋의 카드는 ${cards.length}개입니다`),
    ).toBeVisible();
    await expect(
      page.getByText(`현재 카드셋의 카드는 ${STALE_SERVER_CARD_COUNT}개입니다`),
    ).toHaveCount(0);
  });

  test("카드 개수는 정보성일 뿐 입력 상한이 아니다", async ({
    authenticatedPage: page,
  }) => {
    const cards = mockCards.slice(0, 3);
    await openTestSettings(page, cards);

    // 상한(max)을 걸지 않는다 — 카드 수보다 많이 넣어도 오류가 아니다
    await expect(pickCountInput(page)).not.toHaveAttribute("max", /.*/);

    await pickCountInput(page).fill("99");
    await Promise.all([
      page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
      page.getByRole("button", { name: "학습 시작" }).click(),
    ]);

    // 카드가 3개뿐이므로 3문항만 출제된다
    await expect(page.getByPlaceholder("답변을 입력하세요")).toHaveCount(
      cards.length,
    );
  });

  test("0을 입력하면 하한인 1로 보정된다", async ({
    authenticatedPage: page,
  }) => {
    await openTestSettings(page, mockCards.slice(0, 3));

    await pickCountInput(page).fill("0");

    await expect(pickCountInput(page)).toHaveValue("1");
  });

  test("보정 후에도 여러 자리 수를 정상 입력할 수 있다", async ({
    authenticatedPage: page,
  }) => {
    await openTestSettings(page, mockCards.slice(0, 3));

    // 빈 칸에서 한 글자씩 입력하는 상황 — 첫 글자가 보정돼도 뒷자리가 막히면 안 된다
    await pickCountInput(page).fill("");
    await pickCountInput(page).pressSequentially("10");

    await expect(pickCountInput(page)).toHaveValue("10");
  });

  test("칸을 비우면 제출 시 입력 안내가 뜬다", async ({
    authenticatedPage: page,
  }) => {
    await openTestSettings(page, mockCards.slice(0, 3));

    // 빈 값은 min 위반이 아니라 네이티브 검증을 통과하므로 zod 메시지까지 도달한다
    await pickCountInput(page).fill("");
    await page.getByRole("button", { name: "학습 시작" }).click();

    await expect(page.getByText("문제 개수를 입력해주세요")).toBeVisible();
    await expect(page).not.toHaveURL(/cardsets\/learning/);
  });

  test("저장된 설정을 복원해도 현재 카드 수를 안내한다", async ({
    authenticatedPage: page,
  }) => {
    const cards = mockCards.slice(0, 4);

    // 이전 방문에서 totalCardCount=10이 함께 저장돼 있던 상태
    await openTestSettings(page, cards, {
      mode: "test",
      isUnlimitedTime: false,
      testTimeMinutes: 30,
      orderType: "sequential",
      testMode: "random",
      totalCardCount: STALE_SERVER_CARD_COUNT,
      randomPickCount: 2,
    });

    await expect(
      page.getByText(`현재 카드셋의 카드는 ${cards.length}개입니다`),
    ).toBeVisible();
  });

  test("카드가 없는 카드셋은 0개로 안내한다", async ({
    authenticatedPage: page,
  }) => {
    await openTestSettings(page, []);

    await expect(
      page.getByText("현재 카드셋의 카드는 0개입니다"),
    ).toBeVisible();
  });
});
