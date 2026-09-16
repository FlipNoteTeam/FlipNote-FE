import type { Page } from "@playwright/test";
import { mockApi } from "./mock-api";

const SOCKET_PATH = "**/v1/card-sets/ws/**";

/**
 * 카드셋 편집 라우트가 인증 초기화 과정에서 호출하는 API를 격리한다.
 *
 * 에디터 자체는 HTTP 카드 조회에 의존하지 않고 Socket/Yjs로 문서를 받는다.
 * 따라서 E2E에서는 인증 초기화만 mock하고, Socket은 각 시나리오에서 따로 제어한다.
 */
export async function mockEditorBootstrapApis(page: Page): Promise<void> {
  const api = mockApi(page);

  await api.succeed("**/api/auth/token/refresh", {
    success: true,
    data: {},
  });
  await api.succeed("**/api/users/me", {
    success: true,
    data: {
      userId: 1,
      nickname: "E2E 테스터",
      email: "e2e@example.com",
      phone: "",
      smsAgree: false,
      profileImageUrl: "",
    },
  });
}

/**
 * Socket.io polling handshake를 503으로 응답시켜 연결 실패 UI를 결정적으로 만든다.
 * 실제 협업 동기화는 `YjsProvider`의 두 provider 통합 테스트에서 검증한다.
 */
export async function failEditorSocketConnection(page: Page): Promise<void> {
  await page.route(SOCKET_PATH, (route) =>
    route.fulfill({
      status: 503,
      contentType: "text/plain",
      body: "Socket server unavailable in E2E",
    }),
  );
}
