import type { GroupDetailResponse, GroupInfo } from "@/shared/apis";

export type GroupBrief = {
  id: number | string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  modifiedAt: Date;
};

// Api응답값과 다름. convert해서 씀.
export type GroupDetail = {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  visibility: boolean;
  maxMember: number;
  imageUrl: string;
  createdAt: Date;
  imageRefId?: number;
  modifiedAt: Date;
};

// ✅ 단 한 곳에서만 정의
export const GROUP_CATEGORY_MAP = {
  IT: "IT",
  ENGLISH: "영어",
  MATH: "수학",
  SCIENCE: "과학",
  HISTORY: "역사",
  GEOGRAPHY: "지리학",
  KOREAN: "한국어",
} as const;

// 나머지는 모두 자동으로 파생
export type GroupCategory = keyof typeof GROUP_CATEGORY_MAP;
export const GROUP_CATEGORIES = Object.keys(
  GROUP_CATEGORY_MAP,
) as readonly GroupCategory[];
export const GROUP_CATEGORY_LABELS = Object.values(GROUP_CATEGORY_MAP);

export const toGroupBrief = (apiResponse: GroupInfo): GroupBrief => {
  return {
    id: apiResponse.groupId,
    name: apiResponse.name,
    description: apiResponse.description,
    image: apiResponse.imageUrl ?? "",
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
};

export const toGroupDetail = (
  apiResponse: GroupDetailResponse,
): GroupDetail => {
  return {
    name: apiResponse.name,
    category: apiResponse.category,
    description: apiResponse.description,
    applicationRequired: apiResponse.joinPolicy === "APPROVAL",
    visibility: apiResponse.visibility === "PUBLIC",
    maxMember: apiResponse.maxMember ?? Infinity,
    imageUrl: apiResponse.imageUrl ?? "",
    imageRefId: apiResponse.imageRefId,
    createdAt: new Date(apiResponse.createdAt),
    modifiedAt: new Date(apiResponse.modifiedAt),
  };
};
