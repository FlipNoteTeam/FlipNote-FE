import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures/auth";
import { mockCardsetApis } from "../helpers/cardset-mocks";
import { mockCards } from "../fixtures/mock-data";

/**
 * 학습 설정 localStorage 기본값 저장/복원 회귀 테스트.
 *
 * 구현 대상: study-settings.tsx
 *   - 컴포넌트 마운트 시 localStorage에서 카드셋별 설정 로드
 *   - "학습 시작" 클릭 시 현재 설정을 localStorage에 저장
 *   - localStorage 없거나 손상된 경우 MEMORIZE_MODE_DEFAULTS로 폴백
 *
 * localStorage 키: flipnote-study-defaults-{cardsetId}
 */

const GROUP_ID = 1;
const CARDSET_ID = 42;
const CARDSET_URL = `/groups/${GROUP_ID}/cardsets/${CARDSET_ID}`;
const LS_KEY = `flipnote-study-defaults-${CARDSET_ID}`;

/** 카드셋 상세 진입에 필요한 API 모킹 (학습 설정 화면이 카드 목록도 조회한다) */
const mockCardsetDetailApis = (page: Page) =>
  mockCardsetApis(page, {
    groupId: GROUP_ID,
    cardsetId: CARDSET_ID,
    cards: mockCards,
  });

// ButtonCheckbox는 sr-only <input type="checkbox" value="..."> + <label> 구조.
// 선택 상태는 input의 checked 속성으로 확인, 클릭은 label 텍스트로.
const modeInput = (page: Page, value: string) =>
  page.locator(`input[type="checkbox"][value="${value}"]`);

test.describe("학습 설정 localStorage 저장 및 복원", () => {
  test("localStorage 없을 때 MEMORIZE_MODE_DEFAULTS 적용 - 암기 모드·순차 진행이 기본 선택됨", async ({
    authenticatedPage: page,
  }) => {
    await page.addInitScript((key) => localStorage.removeItem(key), LS_KEY);
    await mockCardsetDetailApis(page);

    await page.goto(CARDSET_URL);
    await page.waitForSelector("text=학습 모드 선택");

    await expect(modeInput(page, "memorize")).toBeChecked();
    await expect(modeInput(page, "sequential")).toBeChecked();
  });

  test('"학습 시작" 클릭 시 현재 설정이 localStorage에 저장됨', async ({
    authenticatedPage: page,
  }) => {
    await page.addInitScript((key) => localStorage.removeItem(key), LS_KEY);
    await mockCardsetDetailApis(page);

    await page.goto(CARDSET_URL);
    await page.waitForSelector("text=학습 모드 선택");

    // 카드 순서를 랜덤으로 변경 (label 클릭)
    await page.locator("label", { hasText: "랜덤 섞기" }).click();
    await expect(modeInput(page, "random")).toBeChecked();

    // 학습 시작 클릭 → navigation 완료 대기
    await Promise.all([
      page.waitForURL(/cardsets\/learning/, { timeout: 5000 }),
      page.getByRole("button", { name: "학습 시작" }).click(),
    ]);

    const saved = await page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }, LS_KEY);

    expect(saved).not.toBeNull();
    expect(saved.orderType).toBe("random");
    expect(saved.mode).toBe("memorize");
  });

  test("재방문 시 저장된 설정 복원 - 랜덤 섞기·반복 5회가 로드됨", async ({
    authenticatedPage: page,
  }) => {
    const savedSettings = {
      mode: "memorize",
      orderType: "random",
      navigationType: "manual",
      isUnlimitedRepeat: false,
      repeatCount: 5,
      autoTimerSeconds: 5,
    };
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, JSON.stringify(value)),
      { key: LS_KEY, value: savedSettings },
    );
    await mockCardsetDetailApis(page);

    await page.goto(CARDSET_URL);
    await page.waitForSelector("text=학습 모드 선택");

    await expect(modeInput(page, "random")).toBeChecked();

    const repeatInput = page.locator('input[type="number"]').first();
    await expect(repeatInput).toHaveValue("5");
  });

  test("localStorage 값이 손상된 경우 MEMORIZE_MODE_DEFAULTS로 폴백됨", async ({
    authenticatedPage: page,
  }) => {
    await page.addInitScript(
      (key) => localStorage.setItem(key, "not-valid-json"),
      LS_KEY,
    );
    await mockCardsetDetailApis(page);

    await page.goto(CARDSET_URL);
    await page.waitForSelector("text=학습 모드 선택");

    await expect(modeInput(page, "sequential")).toBeChecked();
  });

  test("다른 cardsetId는 별도 localStorage 키로 격리됨", async ({
    authenticatedPage: page,
  }) => {
    await page.addInitScript(
      ({ otherKey, lsKey, value }) => {
        localStorage.setItem(otherKey, JSON.stringify(value));
        localStorage.removeItem(lsKey);
      },
      {
        otherKey: "flipnote-study-defaults-999",
        lsKey: LS_KEY,
        value: { mode: "memorize", orderType: "random", navigationType: "manual", isUnlimitedRepeat: true, repeatCount: 3, autoTimerSeconds: 5 },
      },
    );
    await mockCardsetDetailApis(page);

    await page.goto(CARDSET_URL);
    await page.waitForSelector("text=학습 모드 선택");

    // 다른 카드셋 설정이 영향을 주면 안 됨 → 기본값(순차 진행)
    await expect(modeInput(page, "sequential")).toBeChecked();
  });
});
