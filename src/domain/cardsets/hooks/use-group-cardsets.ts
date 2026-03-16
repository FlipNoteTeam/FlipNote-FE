import { useInfiniteQuery } from "@tanstack/react-query";
import { cardSetApi } from "@/shared/apis/card-set";

export const useGroupCardsets = (groupId: number, pageSize: number = 20) => {
  return useInfiniteQuery({
    queryKey: ["group", "cardsets", groupId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await cardSetApi.getCardSets({
        page: pageParam,
        size: pageSize,
      });
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: () => {
      return 1;
    },
    //@TODO- paging처리시 주석 제거
    // getNextPageParam: (lastPage) => {
    //   return lastPage.hasNext ? lastPage.page + 1 : undefined;
    // },
    enabled: !!groupId,
  });
};
