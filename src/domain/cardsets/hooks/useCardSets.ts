import { useInfiniteQuery } from "@tanstack/react-query";
import { cardSetApi } from "@/shared/apis/card-set";
import type { CardSetCategory } from "@/domain/cardsets/types";

const CARDSETS_QUERY_KEY = ["cardsets"];

interface UseCardSetsParams {
  keyword?: string;
  category?: CardSetCategory;
  size?: number;
  sortBy?: string;
  order?: string;
}

export const useCardSets = (params?: UseCardSetsParams) => {
  return useInfiniteQuery({
    queryKey: [...CARDSETS_QUERY_KEY, params],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await cardSetApi.getCardSets({
        ...params,
        page: pageParam,
        size: params?.size || 20,
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasNext ? lastPage.data.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      cardsets: data.pages.flatMap((page) => page.data.content),
    }),
  });
};
