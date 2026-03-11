import { nestClient } from "@/shared/apis/fetch";
import type { ApiResponse } from "@/shared/apis/types";

export interface CardResponse {
  id: string;
  question: string;
  answer: string;
}

export const cardApi = {
  // 카드셋의 카드 목록 조회 (NestJS 서버)
  getCards: (cardSetId: number) =>
    nestClient.get<ApiResponse<CardResponse[]>>(
      `/card-sets/${cardSetId}/cards`,
    ),
};
