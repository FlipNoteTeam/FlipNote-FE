import apiClient from "@/shared/apis/fetch";
import type {
  ApiResponse,
  GroupCategory,
  PagingResponse,
  PaginationRequest,
} from "@/shared/apis/types";

type CARDSET_VISIBILITY = "PRIVATE" | "PUBLIC";

// CardSet API 전용 타입들
export interface CardSetSummaryResponse {
  id: number;
  name: string;
  groupId: number;
  visibility: CARDSET_VISIBILITY;
  category: string;
  hashtag: string;
  imageRefId: number;
  imageUrl?: string;
  // 수정가능성 높음
  cardCount: number;
  likeCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  bookmarked: boolean;
  managers: {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string;
  }[];
}

export interface CardSetDetailResponse {
  id: number;
  name: string;
  groupId: number;
  visibility: CARDSET_VISIBILITY;
  category: string;
  hashtag: string;
  imageRefId: number;
  imageUrl?: string;
  // 수정가능성 높음
  cardCount: number;
  likeCount: number;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
  bookmarked: boolean;
  managers: {
    id: number;
    email: string;
    nickname: string;
    profileImageUrl: string;
  }[];

  /** 카드셋 관리자 userId 목록 */
  // managers?: number[];
}

export interface CreateCardSetRequest {
  name: string;
  groupId: number;
  visibility: "PRIVATE" | "PUBLIC";
  category: GroupCategory;
  hashtag: string;
  imageRefId?: number;
  // cardCount: number;
  /** 카드셋 관리자 userId 목록 */
  // managers?: number[];
  managerIds?: number[];
}

export interface CreateCardSetResponse {
  cardSetId: number;
}

export interface CardSetUpdateRequest {
  name: string;
  visibility: "PUBLIC" | "PRIVATE";
  category: GroupCategory;
  hashtag: string;
  imageRefId?: number;
  /** 카드셋 관리자 userId 목록 */
  // managers?: number[];
}

export interface CardSetSearchRequest extends PaginationRequest {
  keyword?: string;
  category?: string;
}

export interface CardResponse {
  id: string;
  question: string;
  answer: string;
}

export const cardSetApi = {
  // 카드셋 목록 조회(검색)
  getCardSets: (params: CardSetSearchRequest) =>
    //@TODO paging 처리 추가되면 아래 주석 해제
    // apiClient.get<ApiResponse<PagingResponse<CardSetSummaryResponse>>>(
    apiClient.get<ApiResponse<CardSetSummaryResponse>>("/card-sets", {
      params,
    }),

  // 그룹의 카드셋 목록 조회
  getGroupCardSets: (groupId: number, params?: PaginationRequest) =>
    apiClient.get<ApiResponse<PagingResponse<CardSetSummaryResponse>>>(
      `/groups/${groupId}/card-sets`,
      { params },
    ),

  // 카드셋 생성
  createCardSet: (data: CreateCardSetRequest) =>
    apiClient.post<ApiResponse<CreateCardSetResponse>>(`card-sets`, data),

  // 카드셋 상세 조회
  getCardSet: (cardSetId: number) =>
    apiClient.get<ApiResponse<CardSetDetailResponse>>(`card-sets/${cardSetId}`),

  // 카드셋 수정
  updateCardSet: (cardSetId: number, data: CardSetUpdateRequest) =>
    apiClient.put<ApiResponse<CardSetDetailResponse>>(
      `card-sets/${cardSetId}`,
      data,
    ),

  // 카드셋 삭제
  deleteCardSet: (cardSetId: number) =>
    apiClient.delete<ApiResponse>(`card-sets/${cardSetId}`),
};
