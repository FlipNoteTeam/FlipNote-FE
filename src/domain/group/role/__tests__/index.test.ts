import { describe, expect, it } from "vitest";
import {
  ROLE_LABELS,
  getAccessibleTabs,
  getDefaultManageTab,
  isOwner,
} from "@/domain/group/role";
import type { GroupPermission } from "@/domain/group/permission";

/**
 * 15-permission-based-rbac 매트릭스 스펙 (테스트 먼저 작성).
 *
 * ⚠️ **이 파일은 Step 2 완료 전까지 의도적으로 red다.**
 * `getAccessibleTabs`가 아직 `(role)` 1-arity이고 `@/domain/group/permission`이 없어서
 * `npx tsc -b`가 실패한다. Step 1~2를 마치면 컴파일되고 통과해야 한다.
 *
 * 핵심 규칙:
 * - `join-requests` / `invitations` → **서버 permission**으로 판단
 * - `group-settings` / `role-management` → 대응 permission이 서버에 없어 **역할**로 판단
 *   (docs/api/group-service.md:71, :275 — 상세는 15-*.md §설계 결정 5)
 * - 반환 순서는 항상 TAB_ORDER 고정 (입력 순서 무관)
 * - role이 없으면(미로딩·에러) 전부 닫힘 — fail-closed
 */

const ALL: GroupPermission[] = ["MEMBER_MANAGE", "JOIN_REQUEST_MANAGE", "INVITE"];

describe("getAccessibleTabs — permission 게이트", () => {
  it("INVITE만 있으면 역할과 무관하게 '초대 관리'만 열린다", () => {
    expect(getAccessibleTabs("MEMBER", ["INVITE"])).toEqual(["invitations"]);
  });

  it("JOIN_REQUEST_MANAGE만 있으면 '가입 신청 관리'만 열린다", () => {
    expect(getAccessibleTabs("MANAGER", ["JOIN_REQUEST_MANAGE"])).toEqual([
      "join-requests",
    ]);
  });

  it("MANAGER라도 permission이 없으면 아무 탭도 열리지 않는다", () => {
    expect(getAccessibleTabs("MANAGER", [])).toEqual([]);
  });

  it("MEMBER라도 두 permission을 가지면 두 탭이 열린다", () => {
    expect(getAccessibleTabs("MEMBER", ["INVITE", "JOIN_REQUEST_MANAGE"])).toEqual([
      "join-requests",
      "invitations",
    ]);
  });

  it("MEMBER_MANAGE는 아직 탭을 열지 않는다 (강퇴 UI는 Phase B)", () => {
    expect(getAccessibleTabs("MEMBER", ["MEMBER_MANAGE"])).toEqual([]);
  });
});

describe("getAccessibleTabs — 역할 예외 게이트", () => {
  it("OWNER는 permission이 하나도 없어도 정보 수정·권한 관리에 접근한다", () => {
    expect(getAccessibleTabs("OWNER", [])).toEqual([
      "group-settings",
      "role-management",
    ]);
  });

  it("HEAD_MANAGER도 동일하다", () => {
    expect(getAccessibleTabs("HEAD_MANAGER", [])).toEqual([
      "group-settings",
      "role-management",
    ]);
  });

  it("MANAGER는 permission이 전부 있어도 정보 수정·권한 관리에 접근할 수 없다", () => {
    expect(getAccessibleTabs("MANAGER", ALL)).toEqual([
      "join-requests",
      "invitations",
    ]);
  });
});

describe("getAccessibleTabs — 순서와 fail-closed", () => {
  it("반환 순서는 입력 순서가 아니라 TAB_ORDER를 따른다", () => {
    expect(getAccessibleTabs("OWNER", ALL)).toEqual([
      "group-settings",
      "join-requests",
      "invitations",
      "role-management",
    ]);
  });

  it("permission 배열 순서를 뒤집어도 결과가 같다", () => {
    const forward = getAccessibleTabs("MEMBER", ["JOIN_REQUEST_MANAGE", "INVITE"]);
    const reversed = getAccessibleTabs("MEMBER", ["INVITE", "JOIN_REQUEST_MANAGE"]);
    expect(forward).toEqual(reversed);
  });

  it("role이 없으면(미로딩·에러) permission이 있어도 전부 닫힌다", () => {
    expect(getAccessibleTabs(undefined, ["INVITE"])).toEqual([]);
  });
});

describe("getDefaultManageTab — 기존 동작 보존", () => {
  it("OWNER의 기본 탭은 그대로 '그룹 정보 수정'이다", () => {
    expect(getDefaultManageTab("OWNER", ALL)).toBe("group-settings");
  });

  it("MANAGER의 기본 탭은 그대로 '가입 신청 관리'다", () => {
    expect(getDefaultManageTab("MANAGER", ["JOIN_REQUEST_MANAGE", "INVITE"])).toBe(
      "join-requests",
    );
  });

  it("INVITE만 가진 경우 기본 탭은 '초대 관리'다", () => {
    expect(getDefaultManageTab("MEMBER", ["INVITE"])).toBe("invitations");
  });
});

describe("변경되면 안 되는 것", () => {
  it("역할 라벨은 그대로 유지된다", () => {
    expect(ROLE_LABELS).toEqual({
      OWNER: "소유자",
      HEAD_MANAGER: "총괄 매니저",
      MANAGER: "매니저",
      MEMBER: "멤버",
    });
  });

  it("isOwner는 OWNER에만 true다", () => {
    expect(isOwner("OWNER")).toBe(true);
    expect(isOwner("HEAD_MANAGER")).toBe(false);
    expect(isOwner(undefined)).toBe(false);
  });
});
