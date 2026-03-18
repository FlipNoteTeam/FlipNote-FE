// 공통 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// 공통 에러 타입
export interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
      [key: string]: unknown;
    };
  };
}

export interface PaginationRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
}

export interface PagingResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  // @TODO content라는명 안쓰는거 확실해지면 제거
  content: T[];
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CursorPagingResponse<T> {
  content: T[];
  hasNext: boolean;
  nextCursor?: string;
  size: number;
}

// 공통 enum 타입들
export type GroupCategory =
  | "IT"
  | "ENGLISH"
  | "MATH"
  | "SCIENCE"
  | "HISTORY"
  | "GEOGRAPHY"
  | "KOREAN";
export type GroupJoinStatus = "ACCEPT" | "PENDING" | "REJECT" | "CANCEL";
export type GroupInvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";
export type LikeTargetType = "card_set";
export type BookmarkTargetType = "card_set";

export type ROLE = "OWNER" | "HEAD_MANAGER" | "MANAGER" | "MEMBER";

// 기본 엔티티 타입들
export interface User {
  userId: number;
  email: string;
  nickname: string;
  name: string;
  phone?: string;
  smsAgree: boolean;
  profileImageUrl?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface GroupInfo {
  groupId: number;
  name: string;
  description: string;
  category: GroupCategory;
  imageUrl?: string;
}

export interface GroupMemberInfo {
  memberId: number;
  userId: number;
  role: ROLE;
  nickname: string;
  profileImage?: string;
}

export interface GroupJoinInfo {
  groupJoinId: number;
  userId: number;
  nickname: string;
  joinIntro?: string;
  status: GroupJoinStatus;
}

export interface MyGroupJoinInfo {
  groupJoinId: number;
  groupId: number;
  groupName: string;
  joinIntro?: string;
  status: GroupJoinStatus;
}

export interface LikeTargetResponse {
  id: number;
  name: string;
}

export interface BookmarkTargetResponse {
  id: number;
  name: string;
}

export interface IdResponse {
  id: number;
}
