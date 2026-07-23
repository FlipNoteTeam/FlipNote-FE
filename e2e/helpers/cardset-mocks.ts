import type { Page } from "@playwright/test";
import { mockApi } from "./mock-api";

type Card = { id: string; question: string; answer: string };

type CardsetMockOptions = {
  groupId: number;
  cardsetId: number;
  cards: readonly Card[];
  /**
   * 카드셋 상세가 내려주는 cardCount.
   * 기본은 실제 카드 수지만, 실서버는 이 값이 실제와 어긋나므로(항상 10)
   * 그 상황을 재현하는 테스트는 명시적으로 덮어쓴다.
   */
  cardCount?: number;
};

/**
 * 카드셋 상세 → 학습 설정 → 학습 화면 진입에 필요한 API를 한 번에 모킹한다.
 *
 * 학습 관련 spec들이 동일한 세트를 필요로 해서 helper로 뽑았다.
 * (MSW가 아니라 Playwright page.route 기반 — 이유는 playwright.config.ts 주석 참고)
 */
export async function mockCardsetApis(
  page: Page,
  { groupId, cardsetId, cards, cardCount }: CardsetMockOptions,
) {
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
  await m.succeed(`**/api/card-sets/${cardsetId}`, {
    success: true,
    data: {
      id: cardsetId,
      name: "테스트 카드셋",
      groupId,
      visibility: "PUBLIC",
      category: "IT",
      hashtag: "",
      imageRefId: 0,
      imageUrl: "",
      cardCount: cardCount ?? cards.length,
      likeCount: 0,
      bookmarkCount: 0,
      createdAt: "2024-01-01T00:00:00",
      updatedAt: "2024-01-01T00:00:00",
      liked: false,
      bookmarked: false,
      managers: [],
    },
  });
  await m.succeed(`**/api/card-sets/${cardsetId}/cards`, {
    success: true,
    data: cards,
  });
  await m.succeed(`**/api/groups/${groupId}`, {
    success: true,
    data: {
      groupId,
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
  await m.succeed(`**/api/groups/${groupId}/members`, {
    success: true,
    data: { memberInfoList: [] },
  });
  await m.succeed(`**/api/groups/${groupId}/permissions`, {
    success: true,
    data: { role: "MEMBER", permissions: [] },
  });
}
