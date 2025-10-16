import { useQuery } from "@tanstack/react-query";
import type { CardSetSummaryResponse } from "@/shared/apis/card-set";

// TODO: API 구현 후 실제 API 호출로 교체
const mockCardSets: CardSetSummaryResponse[] = [
  {
    cardSetId: 1,
    groupId: 1,
    name: "React Basics",
    category: "IT",
    hashtag: "react",
    imageUrl: "https://picsum.photos/300/200?random=2",
  },
  {
    cardSetId: 2,
    groupId: 1,
    name: "JavaScript ES6+",
    category: "IT",
    hashtag: "javascript",
    imageUrl: "https://picsum.photos/300/200?random=3",
  },
  {
    cardSetId: 3,
    groupId: 1,
    name: "TypeScript Fundamentals",
    category: "IT",
    hashtag: "typescript",
    imageUrl: "https://picsum.photos/300/200?random=4",
  },
];

export const useGroupCardsets = (groupId: number) => {
  return useQuery({
    queryKey: ["group", "cardsets", groupId],
    queryFn: async () => {
      // TODO: 실제 API 호출로 교체
      // const response = await cardSetApi.getGroupCardsets(groupId);
      // return response.data.data;

      // Mock 데이터 반환
      return new Promise<CardSetSummaryResponse[]>((resolve) => {
        setTimeout(() => {
          resolve(mockCardSets);
        }, 500);
      });
    },
    enabled: !!groupId,
  });
};
