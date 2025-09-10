import apiClient from "@/apis/fetch";
import type { GroupCategory, PagingResponse, PaginationRequest } from "@/apis/types";

// CardSet API 전용 타입들
export interface CardSetSummaryResponse {
  cardSetId: number;
  groupId: number;
  name: string;
  category: string;
  hashtag: string;
  imageUrl?: string;
}

export interface CardSetDetailResponse {
  cardSetId: number;
  groupId: number;
  name: string;
  category: string;
  hashtag: string;
  imageUrl?: string;
  publicVisible: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface CreateCardSetRequest {
  name: string;
  publicVisible: boolean;
  category: GroupCategory;
  hashtag: string[];
  image?: string;
}

export interface CreateCardSetResponse {
  cardSetId: number;
}

export interface CardSetUpdateRequest {
  name: string;
  publicVisible: boolean;
  category: GroupCategory;
  hashtag: string[];
  image?: string;
}

export interface CardSetSearchRequest extends PaginationRequest {
  keyword?: string;
  category?: string;
}

export const cardSetApi = {
  // 카드셋 목록 조회(검색)
  getCardSets: (params: CardSetSearchRequest) =>
    apiClient.get<PagingResponse<CardSetSummaryResponse>>("/card-sets", {
      params,
    }),

  // 카드셋 생성
  createCardSet: (groupId: number, data: CreateCardSetRequest) =>
    apiClient.post<CreateCardSetResponse>(`/groups/${groupId}/card-sets`, data),

  // 카드셋 상세 조회
  getCardSet: (groupId: number, cardSetId: number) =>
    apiClient.get<CardSetDetailResponse>(
      `/groups/${groupId}/card-sets/${cardSetId}`
    ),

  // 카드셋 수정
  updateCardSet: (
    groupId: number,
    cardSetId: number,
    data: CardSetUpdateRequest
  ) =>
    apiClient.put<CardSetDetailResponse>(
      `/groups/${groupId}/card-sets/${cardSetId}`,
      data
    ),
};
