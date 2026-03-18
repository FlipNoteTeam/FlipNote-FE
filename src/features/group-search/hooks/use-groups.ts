import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { groupApi } from "@/shared/apis/group";
import type { GroupCategory } from "@/shared/apis/types";

const GROUPS_QUERY_KEY = ["groups"];

interface UseGroupsParams {
  groupName?: string;
  category?: GroupCategory;
  size?: number;
  sortBy?: string;
  order?: string;
}

export const useGroups = (params?: UseGroupsParams) => {
  return useInfiniteQuery({
    queryKey: [...GROUPS_QUERY_KEY, params],
    queryFn: async ({ pageParam }) => {
      const response = await groupApi.getGroups({
        ...params,
        cursor: pageParam,
        size: params?.size || 20,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasNext ? lastPage.data.nextCursor : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      groups: data.pages.flatMap((page) => page.data.content),
    }),
  });
};

export const useMyGroups = (params?: UseGroupsParams) => {
  return useInfiniteQuery({
    queryKey: [...GROUPS_QUERY_KEY, "my", params],
    queryFn: async ({ pageParam }) => {
      const response = await groupApi.getMyGroups({
        ...params,
        cursor: pageParam,
        size: params?.size || 20,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasNext ? lastPage.data.nextCursor : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      groups: data.pages.flatMap((page) => page.data.content),
    }),
  });
};

export const useGroup = (groupId: number) => {
  return useQuery({
    queryKey: [...GROUPS_QUERY_KEY, groupId],
    queryFn: async () => {
      const response = await groupApi.getGroupDetail(groupId);
      return response.data.data;
    },
    enabled: !!groupId,
  });
};