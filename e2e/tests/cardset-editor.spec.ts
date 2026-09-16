import { test, expect } from "../fixtures/auth";
import {
  failEditorSocketConnection,
  mockEditorBootstrapApis,
} from "../helpers/editor-socket-mocks";

const EDITOR_URL = "/cardsets/editor/e2e-cardset";

/**
 * 카드셋 에디터 E2E 회귀.
 *
 * Socket.io의 실제 다중 사용자 동기화는 브라우저에서 안정적으로 재현하기 어려워
 * YjsProvider 통합 테스트가 담당한다. 이 파일은 라우트 진입과 연결 실패/재시도라는
 * 사용자가 직접 마주하는 흐름을 고정한다.
 */
test.describe("카드셋 실시간 에디터", () => {
  test("연결에 실패하면 재시도 가능한 오류 화면을 표시한다", async ({
    authenticatedPage: page,
  }) => {
    await mockEditorBootstrapApis(page);
    await failEditorSocketConnection(page);

    await page.goto(EDITOR_URL);

    await expect(page.getByText("연결 실패", { exact: true })).toBeVisible();
    await expect(
      page.getByText("소켓 연결을 실패했습니다."),
    ).toBeVisible();

    const retryButton = page.getByRole("button", { name: "다시 시도" });
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    // 재시도 후에도 mock 서버는 503이므로, 오류 UI가 사라지거나 화면이 깨지지 않아야 한다.
    await expect(page.getByText("연결 실패", { exact: true })).toBeVisible();
  });
});
