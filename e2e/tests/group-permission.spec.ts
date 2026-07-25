import { test as authTest } from "../fixtures/auth";
import { expect } from "@playwright/test";
import { mockApi } from "../helpers/mock-api";

/**
 * 15-permission-based-rbac 회귀 테스트 (테스트 먼저 작성).
 *
 * 그룹 UI 노출 기준을 프론트 하드코딩 역할 매트릭스 → 서버 `permissions` 배열로 옮기는 작업의
 * red 테스트. 리팩토링 전에는 아래 (A)(B)(C)(D)가 FAIL해야 정상이다.
 *
 * | | 내용 | 리팩토링 전 | 후 |
 * |---|---|---|---|
 * | (A) | HEAD_MANAGER에게 OWNER 전용 삭제 버튼이 안 보임 | FAIL (B1) | PASS |
 * | (B) | OWNER에게는 삭제 버튼이 보임 | PASS | PASS (가드) |
 * | (C) | INVITE 보유자에게 "멤버 초대" 버튼이 보임 | FAIL (B2) | PASS |
 * | (D) | INVITE만 가진 MEMBER는 '초대 관리' 탭만 진입 | FAIL | PASS |
 * | (E) | permissions 없는 MEMBER에게 관리 버튼 없음 | PASS | PASS (가드) |
 * | (F) | 비멤버 permissions 404여도 공개 그룹 상세 렌더 | PASS | PASS (가드) |
 * | (G) | 가입신청 목록 403 → 에러 처리, 화면 안 깨짐 | ? | PASS |
 *
 * NOTE: `permissions`는 모든 목에서 **명시**한다. 서버의 역할↔권한 매핑은 그룹마다 다를 수 있고
 * OWNER가 런타임에 바꿀 수 있으므로(`docs/api/group-service.md:523`), role에서 추측하면
 * 테스트가 결정적이지 않다.
 */

const GROUP_ID = 8888;

/**
 * 로그인 사용자 id. 멤버 목록에 이 id를 넣으면 "가입한 멤버", 빼면 "비멤버"가 된다.
 * 권한 판단이 멤버 목록이 아니라 permissions API에서 와야 하므로, 대부분의 테스트는
 * 멤버 목록상 역할을 MEMBER로 두고 permissions만 다르게 준다.
 */
const MY_USER_ID = 777;

type Role = "OWNER" | "HEAD_MANAGER" | "MANAGER" | "MEMBER";
type Permission = "MEMBER_MANAGE" | "JOIN_REQUEST_MANAGE" | "INVITE";

type MockOpts = {
  myRole: Role;
  permissions: Permission[];
  members?: Array<{ role: Role; nickname: string; userId?: number }>;
  /** permissions 엔드포인트를 에러로 응답시킨다 (비멤버 시나리오). */
  permissionsStatus?: number;
};

const GROUP_BODY = {
  success: true,
  data: {
    name: "권한 테스트 그룹",
    category: "IT",
    description: "테스트",
    joinPolicy: "OPEN",
    visibility: "PUBLIC",
    maxMember: 10,
    imageUrl: "",
    createdAt: "2024-01-01T00:00:00",
    modifiedAt: "2024-01-01T00:00:00",
  },
};

const EMPTY_PAGE = {
  success: true,
  data: {
    items: [],
    content: [],
    page: 1,
    size: 20,
    total: 0,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
  },
};

/** 그룹 상세·관리 페이지 렌더에 필요한 API를 한 번에 모킹. */
async function mockGroupPages(
  page: Parameters<typeof mockApi>[0],
  opts: MockOpts,
) {
  const m = mockApi(page);

  // 인증 엔드포인트를 모킹하지 않으면 각 테스트의 실제 토큰 갱신이 공유 storageState를
  // 무효화해서, 파일 내 뒤쪽 테스트가 로그아웃되어 페이지가 아예 렌더되지 않는다.
  // (cardset-mocks.ts와 동일한 이유·패턴)
  await m.succeed("**/api/auth/token/refresh", { success: true, data: {} });
  await m.succeed("**/api/users/me", {
    success: true,
    data: {
      userId: MY_USER_ID,
      nickname: "테스터",
      email: "test@test.com",
      phone: "",
      smsAgree: false,
      profileImageUrl: "",
    },
  });

  await m.succeed(`**/api/groups/${GROUP_ID}`, GROUP_BODY);

  await m.succeed(`**/api/groups/${GROUP_ID}/members`, {
    success: true,
    data: {
      memberInfoList: (opts.members ?? []).map((mem, i) => ({
        memberId: i + 1,
        userId: mem.userId ?? i + 1,
        role: mem.role,
        nickname: mem.nickname,
        profileImage: "",
      })),
    },
  });

  if (opts.permissionsStatus) {
    await m.fail(`**/api/groups/${GROUP_ID}/permissions`, opts.permissionsStatus, {
      success: false,
      message: "권한 없음",
    });
  } else {
    await m.succeed(`**/api/groups/${GROUP_ID}/permissions`, {
      success: true,
      data: { role: opts.myRole, permissions: opts.permissions },
    });
  }

  await m.succeed(`**/api/groups/${GROUP_ID}/card-sets**`, EMPTY_PAGE);
  await m.succeed(`**/api/groups/${GROUP_ID}/joins`, {
    success: true,
    data: { joinList: [] },
  });
  await m.succeed(`**/api/groups/${GROUP_ID}/invitations**`, EMPTY_PAGE);
}

const deleteButton = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("button", { name: /그룹 삭제/ });

const inviteButton = (page: Parameters<typeof mockApi>[0]) =>
  page.getByRole("button", { name: /멤버 초대/ });

// ---------------------------------------------------------------------------
// (A) B1 — HEAD_MANAGER에게 OWNER 전용 삭제 UI가 보이면 안 된다
// ---------------------------------------------------------------------------
authTest(
  "(A) HEAD_MANAGER는 그룹 정보 수정 탭에 진입해도 삭제 버튼을 볼 수 없다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "HEAD_MANAGER",
      permissions: ["JOIN_REQUEST_MANAGE", "INVITE", "MEMBER_MANAGE"],
      members: [{ role: "HEAD_MANAGER", nickname: "총괄매니저" }],
    });

    await page.goto(`/groups/${GROUP_ID}/manage`);

    // 그룹 정보 수정 탭 자체에는 접근 가능해야 한다 (역할 예외 게이트: OWNER|HEAD_MANAGER)
    await expect(page.getByRole("heading", { name: "그룹 정보 수정" })).toBeVisible({
      timeout: 5000,
    });

    // 그러나 삭제는 OWNER 전용 (docs/api/group-service.md:133 "Only OWNER can delete")
    await expect(deleteButton(page)).toHaveCount(0);
  },
);

// ---------------------------------------------------------------------------
// (B) 가드 — OWNER에게는 삭제 버튼이 보여야 한다 (A를 과하게 고치는 걸 방지)
// ---------------------------------------------------------------------------
authTest("(B) OWNER는 삭제 버튼을 볼 수 있다", async ({ authenticatedPage: page }) => {
  await mockGroupPages(page, {
    myRole: "OWNER",
    permissions: ["JOIN_REQUEST_MANAGE", "INVITE", "MEMBER_MANAGE"],
    members: [{ role: "OWNER", nickname: "소유자" }],
  });

  await page.goto(`/groups/${GROUP_ID}/manage`);

  await expect(page.getByRole("heading", { name: "그룹 정보 수정" })).toBeVisible({
    timeout: 5000,
  });
  await expect(deleteButton(page)).toBeVisible();
});

// ---------------------------------------------------------------------------
// (C) B2 — 초대는 INVITE permission 기준이어야 한다 (OWNER 전용이 아니라)
// ---------------------------------------------------------------------------
authTest(
  "(C) INVITE 권한을 가진 MEMBER는 그룹 상세에서 멤버 초대 버튼을 볼 수 있다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MEMBER",
      permissions: ["INVITE"],
      // 멤버 목록상 나는 평범한 MEMBER다. 즉 role을 멤버 목록에서 유도하는 기존 방식으로는
      // 초대 버튼이 절대 뜨지 않는다. 오직 permissions를 읽어야만 뜬다.
      members: [
        { role: "OWNER", nickname: "소유자" },
        { role: "MEMBER", nickname: "나", userId: MY_USER_ID },
      ],
    });

    await page.goto(`/groups/${GROUP_ID}`);

    await expect(page.getByText("권한 테스트 그룹")).toBeVisible({ timeout: 5000 });
    await expect(inviteButton(page)).toBeVisible();
  },
);

// ---------------------------------------------------------------------------
// (D) 관리 페이지 탭이 permission 기준으로 열려야 한다
// ---------------------------------------------------------------------------
authTest(
  "(D) INVITE만 가진 MEMBER는 관리 페이지에서 '초대 관리' 탭만 볼 수 있다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MEMBER",
      permissions: ["INVITE"],
      members: [{ role: "OWNER", nickname: "소유자" }],
    });

    await page.goto(`/groups/${GROUP_ID}/manage`);

    await expect(page.getByRole("heading", { name: "초대 관리" })).toBeVisible({
      timeout: 5000,
    });

    // 나머지 탭은 권한이 없으므로 사이드바에 없어야 한다
    await expect(page.getByRole("button", { name: "가입 신청 관리" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "그룹 정보 수정" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "권한 관리" })).toHaveCount(0);
  },
);

authTest(
  "(D-2) JOIN_REQUEST_MANAGE만 가진 MANAGER는 '가입 신청 관리' 탭만 볼 수 있다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MANAGER",
      permissions: ["JOIN_REQUEST_MANAGE"],
      members: [{ role: "MANAGER", nickname: "매니저" }],
    });

    await page.goto(`/groups/${GROUP_ID}/manage`);

    await expect(page.getByRole("heading", { name: "가입 신청 관리" })).toBeVisible({
      timeout: 5000,
    });
    await expect(page.getByRole("button", { name: "초대 관리" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "그룹 정보 수정" })).toHaveCount(0);
  },
);

// ---------------------------------------------------------------------------
// (E) 가드 — 권한이 하나도 없으면 관리 진입 자체가 없어야 한다
// ---------------------------------------------------------------------------
authTest(
  "(E) permissions가 비어있는 MEMBER에게는 '그룹 관리' 진입 버튼이 없다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MEMBER",
      permissions: [],
      members: [
        { role: "OWNER", nickname: "소유자" },
        { role: "MEMBER", nickname: "나", userId: MY_USER_ID },
      ],
    });

    await page.goto(`/groups/${GROUP_ID}`);

    await expect(page.getByText("권한 테스트 그룹")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /그룹 관리/ })).toHaveCount(0);
    await expect(inviteButton(page)).toHaveCount(0);
  },
);

// ---------------------------------------------------------------------------
// (F) fail-closed — 비멤버는 permissions가 실패해도 공개 그룹 상세를 볼 수 있어야 한다
// ---------------------------------------------------------------------------
authTest(
  "(F) permissions가 404여도 공개 그룹 상세는 정상 렌더되고 권한 UI만 닫힌다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MEMBER",
      permissions: [],
      permissionsStatus: 404,
      members: [{ role: "OWNER", nickname: "소유자" }],
    });

    await page.goto(`/groups/${GROUP_ID}`);

    // 페이지는 정상 렌더
    await expect(page.getByText("권한 테스트 그룹")).toBeVisible({ timeout: 5000 });
    // 권한 UI는 전부 닫힘 (fail-closed)
    await expect(inviteButton(page)).toHaveCount(0);
    await expect(page.getByRole("link", { name: /그룹 관리/ })).toHaveCount(0);
    // 에러 토스트가 뜨면 안 된다 (글로벌 onError는 mutation 전용)
    await expect(page.getByText(/권한 없음/)).toHaveCount(0);
  },
);

// ---------------------------------------------------------------------------
// (G) 서버가 최종 차단 — UI를 통과해도 API가 403이면 화면이 깨지지 않아야 한다
// ---------------------------------------------------------------------------
authTest(
  "(G) 가입 신청 목록이 403이어도 관리 페이지가 크래시하지 않는다",
  async ({ authenticatedPage: page }) => {
    await mockGroupPages(page, {
      myRole: "MANAGER",
      permissions: ["JOIN_REQUEST_MANAGE"],
      members: [{ role: "MANAGER", nickname: "매니저" }],
    });
    // permissions는 통과했지만 서버가 실제 API에서 거부하는 상황
    await mockApi(page).fail(`**/api/groups/${GROUP_ID}/joins`, 403, {
      success: false,
      code: "PERM_001",
      message: "permission denied",
    });

    await page.goto(`/groups/${GROUP_ID}/manage`);

    // 탭 자체는 렌더되고, 목록만 비어있거나 에러 상태여야 한다 (빈 화면/크래시 아님)
    await expect(page.getByRole("heading", { name: "가입 신청 관리" })).toBeVisible({
      timeout: 5000,
    });
  },
);
