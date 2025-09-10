// 공통 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  order?: string;
}

export interface PagingResponse<T> {
  content: T[];
  page: number;
  size: number;
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
export type GroupCategory = "IT" | "ENGLISH" | "MATH" | "SCIENCE" | "HISTORY" | "GEOGRAPHY" | "KOREAN";
export type GroupJoinStatus = "ACCEPT" | "PENDING" | "REJECT" | "CANCEL";
export type GroupInvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type LikeTargetType = "card_set";
export type BookmarkTargetType = "card_sets";

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
  id: number;
  role: "OWNER" | "HEAD_MANAGER" | "MANAGER" | "STAFF" | "MEMBER";
  name: string;
  profile?: string;
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
}

export interface BookmarkTargetResponse {
  id: number;
}

export interface IdResponse {
  id: number;
}