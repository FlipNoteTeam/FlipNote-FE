import { test as authTest } from "../fixtures/auth";
import { expect } from "@playwright/test";
import { mockApi } from "../helpers/mock-api";

/**
 * 02-rbac 회귀 테스트 (테스트 먼저 작성).
 *
 * 02 작업 전 작성 → 리팩토링 도중 라벨/역할 분기가 무심코 깨지는 걸 잡는다.
 *
 * (A) 라벨 통일 — refactor 전엔 FAIL(MemberCard가 "총괄 관리자"), refactor 후 PASS
 * (B) 역할별 UI 가시성 — refactor 전/후 모두 PASS(회귀 가드)
 */

const GROUP_ID = 9999;

/** 그룹 detail 페이지가 정상 렌더되도록 필요한 API 모킹. role은 옵션. */
async function mockGroupDetailPage(
  page: Parameters<typeof mockApi>[0],
  opts: { myRole: "OWNER" | "HEAD_MANAGER" | "MANAGER" | "MEMBER"; members: Array<{ role: string; nickname: string }> },
) {
  const m = mockApi(page);

  await m.succeed(`**/api/groups/${GROUP_ID}`, {
    success: true,
    data: {
      name: "E2E 테스트 그룹",
      category: "IT",
      description: "테스트",
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
    data: {
      memberInfoList: opts.members.map((mem, i) => ({
        memberId: i + 1,
        userId: i + 1,
        role: mem.role,
        nickname: mem.nickname,
        profileImage: "",
      })),
    },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}/permissions`, {
    success: true,
    data: { role: opts.myRole, permissions: [] },
  });

  // cardsets (페이지네이션 응답 비어있음)
  await m.succeed(`**/api/groups/${GROUP_ID}/card-sets**`, {
    success: true,
    data: {
      items: [],
      page: 1,
      size: 20,
      total: 0,
      content: [],
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false,
    },
  });
}

authTest("(A) MemberCard는 HEAD_MANAGER 역할을 '총괄 매니저'로 표시", async ({
  authenticatedPage,
}) => {
  await mockGroupDetailPage(authenticatedPage, {
    myRole: "MEMBER",
    members: [{ role: "HEAD_MANAGER", nickname: "테스트 헤드매니저" }],
  });

  await authenticatedPage.goto(`/groups/${GROUP_ID}`);

  // 멤버 카드 영역에 "총괄 매니저"가 표시되어야 함
  await expect(authenticatedPage.getByText("총괄 매니저")).toBeVisible({
    timeout: 5000,
  });

  // 같은 역할을 "총괄 관리자"로 다르게 표기하던 부분이 더 이상 존재하지 않아야 함
  await expect(authenticatedPage.getByText("총괄 관리자")).toHaveCount(0);
});

authTest(
  "(B) MEMBER로 그룹 진입 시 '그룹 관리' 버튼은 노출되지 않음",
  async ({ authenticatedPage }) => {
    await mockGroupDetailPage(authenticatedPage, {
      myRole: "MEMBER",
      members: [{ role: "OWNER", nickname: "소유자" }],
    });

    await authenticatedPage.goto(`/groups/${GROUP_ID}`);

    // 페이지 자체는 렌더 (그룹 이름 보임)
    await expect(authenticatedPage.getByText("E2E 테스트 그룹")).toBeVisible({
      timeout: 5000,
    });

    // canManage = false 인 MEMBER에게는 관리 진입 버튼이 없어야 함
    await expect(
      authenticatedPage.getByRole("link", { name: /그룹 관리/ }),
    ).toHaveCount(0);
    await expect(
      authenticatedPage.getByRole("button", { name: /그룹 관리/ }),
    ).toHaveCount(0);
  },
);
