import type { CardSetSummaryResponse } from "@/shared/apis/card-set";

export type CardSetBrief = {
  id: number;
  name: string;
  category: string;
  hashtag: string;
  imageUrl?: string;
};

export const CARDSET_CATEGORY_MAP = {
  IT: "IT",
  ENGLISH: "영어",
  MATH: "수학",
  SCIENCE: "과학",
  HISTORY: "역사",
  GEOGRAPHY: "지리학",
  KOREAN: "한국어",
} as const;

export type CardSetCategory = keyof typeof CARDSET_CATEGORY_MAP;

export const CARDSET_CATEGORY = Object.values(CARDSET_CATEGORY_MAP);

export const getCardSetCategoryKeys = () =>
  Object.keys(CARDSET_CATEGORY_MAP) as CardSetCategory[];

export const toCardSetBrief = (
  apiResponse: CardSetSummaryResponse
): CardSetBrief => {
  return {
    id: apiResponse.cardSetId,
    name: apiResponse.name,
    category: apiResponse.category,
    hashtag: apiResponse.hashtag,
    imageUrl: apiResponse.imageUrl,
  };
};
