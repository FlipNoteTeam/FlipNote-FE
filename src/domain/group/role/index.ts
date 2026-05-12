import type { ROLE } from "@/shared/apis";

/**
 * 그룹 역할(`ROLE`) 라벨·헬퍼·권한 매트릭스의 단일 출처.
 * 컴포넌트에서는 `role === "OWNER"` 같은 직접 비교 대신 헬퍼를 사용한다.
 */

export const ROLE_LABELS: Record<ROLE, string> = {
  OWNER: "소유자",
  HEAD_MANAGER: "총괄 매니저",
  MANAGER: "매니저",
  MEMBER: "멤버",
};

/** 소유자(그룹 단일 OWNER) */
export const isOwner = (role?: ROLE): boolean => role === "OWNER";

/** 그룹 관리 페이지 접근 권한: OWNER | HEAD_MANAGER | MANAGER */
export const canManageGroup = (role?: ROLE): role is ROLE =>
  role === "OWNER" || role === "HEAD_MANAGER" || role === "MANAGER";

/** 멤버의 역할 변경 권한: OWNER | HEAD_MANAGER */
export const canChangeRole = (role?: ROLE): boolean =>
  role === "OWNER" || role === "HEAD_MANAGER";

/** 그룹 관리 페이지 탭 식별자 */
export type ManageTab =
  | "group-settings"
  | "join-requests"
  | "invitations"
  | "role-management";

/** 역할별 접근 가능한 관리 탭 매트릭스 */
const ACCESSIBLE_TABS: Record<ROLE, ManageTab[]> = {
  OWNER: ["group-settings", "join-requests", "invitations", "role-management"],
  HEAD_MANAGER: [
    "group-settings",
    "join-requests",
    "invitations",
    "role-management",
  ],
  MANAGER: ["join-requests", "invitations"],
  MEMBER: [],
};

export const getAccessibleTabs = (role?: ROLE): ManageTab[] =>
  role ? ACCESSIBLE_TABS[role] : [];

export const getDefaultManageTab = (role?: ROLE): ManageTab =>
  role === "MANAGER" ? "join-requests" : "group-settings";
