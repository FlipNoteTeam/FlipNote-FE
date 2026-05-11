import { chromium } from "@playwright/test";
import * as dotenv from "dotenv";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Playwright globalSetup.
 *
 * .env.local의 E2E_TEST_EMAIL/E2E_TEST_PASSWORD로 로그인 후 storageState를
 * .auth/user.json 에 저장. authenticatedPage fixture가 이 파일을 사용한다.
 *
 * 환경변수가 없으면 인증 단계를 건너뛴다 (인증 필요 테스트는 명확한 에러로 실패).
 */

// .env.local 우선, 없으면 .env.development에서 fallback (dotenv 기본은 override 안 함)
dotenv.config({ path: resolve(".env.local") });
dotenv.config({ path: resolve(".env.development") });

const STORAGE_STATE_DIR = resolve(".auth");
const STORAGE_STATE_PATH = resolve(STORAGE_STATE_DIR, "user.json");
const BASE_URL = "http://localhost:5173";

async function globalSetup() {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[e2e] E2E_TEST_EMAIL / E2E_TEST_PASSWORD 미설정. 인증 단계 건너뜀.\n" +
        "[e2e] authenticatedPage fixture를 쓰는 테스트는 실패합니다.\n" +
        "[e2e] 해결: .env.local에 두 값을 추가.",
    );
    return;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: BASE_URL });

  try {
    const response = await context.request.post("/api/auth/login", {
      data: { email, password },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `[e2e] 로그인 실패: ${response.status()} ${response.statusText()}\n${body}`,
      );
    }

    await mkdir(STORAGE_STATE_DIR, { recursive: true });
    await context.storageState({ path: STORAGE_STATE_PATH });
    console.log(`[e2e] 로그인 성공. storageState 저장: ${STORAGE_STATE_PATH}`);
  } finally {
    await browser.close();
  }
}

export default globalSetup;
