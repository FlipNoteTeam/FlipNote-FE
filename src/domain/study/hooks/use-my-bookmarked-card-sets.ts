import { useInfiniteQuery } from "@tanstack/react-query";
import { bookmarkApi } from "@/shared/apis/bookmark";

export const useMyBookmarkedCardSets = () => {
  return useInfiniteQuery({
    queryKey: ["bookmarks", "card_sets"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await bookmarkApi.getBookmarks("card_sets", {
        page: pageParam,
        size: 12,
      });
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? (lastPage.page || 0) + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      bookmarks: data.pages.flatMap((page) => page.content),
    }),
  });
};
