import apiClient from "@/shared/apis/fetch";
import type {
  ApiResponse,
  BookmarkTargetType,
  BookmarkTargetResponse,
  IdResponse,
  PagingResponse,
  PaginationRequest,
} from "@/shared/apis/types";

// Bookmark API 전용 타입들
export interface BookmarkResponseBookmarkTargetResponse {
  target: BookmarkTargetResponse;
  bookmarkedAt: string;
}

export type BookmarkSearchRequest = PaginationRequest;

export const bookmarkApi = {
  // 즐겨찾기 추가
  addBookmark: (targetType: BookmarkTargetType, targetId: number) =>
    apiClient.post<ApiResponse<IdResponse>>(`/bookmarks/${targetType}/${targetId}`),

  // 즐겨찾기 제거
  deleteBookmark: (targetType: BookmarkTargetType, targetId: number) =>
    apiClient.delete<ApiResponse<IdResponse>>(`/bookmarks/${targetType}/${targetId}`),

  // 즐겨찾기 목록 조회
  getBookmarks: (
    targetType: BookmarkTargetType,
    params: BookmarkSearchRequest
  ) =>
    apiClient.get<ApiResponse<PagingResponse<BookmarkResponseBookmarkTargetResponse>>>(
      `/bookmarks/${targetType}`,
      { params }
    ),
};
