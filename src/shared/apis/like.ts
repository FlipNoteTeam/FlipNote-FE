import apiClient from "@/shared/apis/fetch";
import type {
  ApiResponse,
  LikeTargetType,
  LikeTargetResponse,
  PagingResponse,
  PaginationRequest,
} from "@/shared/apis/types";

// Like API 전용 타입들
export interface LikeResponseLikeTargetResponse {
  target: LikeTargetResponse;
  likedAt: string;
}

export type LikeSearchRequest = PaginationRequest;

export const likeApi = {
  // 좋아요 추가
  addLike: (targetType: LikeTargetType, targetId: number) =>
    apiClient.post(`/likes/${targetType}/${targetId}`),

  // 좋아요 취소
  removeLike: (targetType: LikeTargetType, targetId: number) =>
    apiClient.delete(`/likes/${targetType}/${targetId}`),

  // 좋아요 누른 목록 조회
  getLikes: (targetType: LikeTargetType, params: LikeSearchRequest) =>
    apiClient.get<ApiResponse<PagingResponse<LikeResponseLikeTargetResponse>>>(
      `/likes/${targetType}`,
      { params }
    ),
};
