import { useInfiniteQuery } from "@tanstack/react-query";
import { likeApi } from "@/shared/apis/like";
import type { CardSetWithLike } from "@/domain/study/types";

export const useMyLikedCardSets = () => {
  return useInfiniteQuery({
    queryKey: ["likes", "card_set"],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await likeApi.getLikes("card_set", {
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
      likes: data.pages
        .flatMap((page) => page.content)
        .map((item): CardSetWithLike => ({
          cardSetId: item.target.id,
          groupId: item.target.groupId,
          name: item.target.name,
          likedAt: item.likedAt,
        })),
    }),
  });
};
