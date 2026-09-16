import { test, expect } from "../fixtures/auth";
import {
  failEditorSocketConnection,
  mockEditorBootstrapApis,
} from "../helpers/editor-socket-mocks";

const EDITOR_URL = "/cardsets/editor/e2e-cardset";

/**
 * 시각 회귀의 첫 기준 화면: 협업 서버 연결 실패 overlay.
 * 정상 협업/awareness 상태는 실제 Socket 서버 또는 component-level fixture가 준비되면
 * 같은 파일에 screenshot 케이스를 추가한다.
 */
test("카드셋 에디터 연결 실패 화면", async ({ authenticatedPage: page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await mockEditorBootstrapApis(page);
  await failEditorSocketConnection(page);

  await page.goto(EDITOR_URL);
  await expect(page.getByText("연결 실패", { exact: true })).toBeVisible();

  await expect(page).toHaveScreenshot("cardset-editor-connection-error.png", {
    animations: "disabled",
    caret: "hide",
    maxDiffPixelRatio: 0.01,
  });
});
