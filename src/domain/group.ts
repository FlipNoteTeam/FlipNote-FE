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
  description: string;
  requireApply: boolean;
  public: boolean;
  maxMember: number;
  image: string;
  createdAt: Date;
  modifiedAt: Date;
};

export const toGroupBrief = (apiResponse: GroupInfo): GroupBrief => {
  return {
    id: apiResponse.groupId,
    name: apiResponse.name,
    description: apiResponse.description,
    image: apiResponse.imageUrl ?? "",
    createdAt: new Date() /** @todo 응답값 확인. 필요없으면 제거 */,
    modifiedAt: new Date() /** @todo 응답값 확인. 필요없으면 제거 */,
  };
};

export const toGroupDetail = (
  apiResponse: GroupDetailResponse
): GroupDetail => {
  return {
    ...apiResponse,
    requireApply: apiResponse.applicationRequired ?? false,
    maxMember: apiResponse.maxMember ?? Infinity,
    public: apiResponse.publicVisible ?? true,
    image: apiResponse.imageUrl ?? "",
    createdAt: new Date(apiResponse.createdAt),
    modifiedAt: new Date(apiResponse.modifiedAt),
  };
};
