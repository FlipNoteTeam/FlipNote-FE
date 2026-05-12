import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookmarkApi, type ApiError } from "@/shared/apis";
import { useState, useRef } from "react";

interface UseCardSetBookmarkProps {
  cardsetId: number;
  groupId: number;
  initialBookmarked?: boolean;
}

export const useCardSetBookmark = ({
  cardsetId,
  groupId,
  initialBookmarked = false,
}: UseCardSetBookmarkProps) => {
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const previousStateRef = useRef(initialBookmarked);

  // 즐겨찾기 추가 mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkApi.addBookmark("card_set", cardsetId),
    onMutate: async () => {
      // 이전 상태 저장
      previousStateRef.current = isBookmarked;
      // Optimistic update: 즉시 UI 업데이트
      setIsBookmarked(true);
    },
    onError: (error: ApiError) => {
      // 409 에러는 이미 즐겨찾기가 추가된 상태이므로 롤백하지 않음
      if (error?.response?.status === 409) {
        setIsBookmarked(true);
      } else {
        // 다른 에러는 이전 상태로 롤백
        setIsBookmarked(previousStateRef.current);
      }
    },
    onSettled: () => {
      // 성공/실패 여부와 관계없이 서버 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["cardset", groupId, cardsetId],
      });
    },
    // 낙관적 갱신·롤백으로 처리하므로 글로벌 toast 비활성
    meta: { skipErrorToast: true },
  });

  // 즐겨찾기 제거 mutation
  const unbookmarkMutation = useMutation({
    mutationFn: () => bookmarkApi.deleteBookmark("card_set", cardsetId),
    onMutate: async () => {
      // 이전 상태 저장
      previousStateRef.current = isBookmarked;
      // Optimistic update: 즉시 UI 업데이트
      setIsBookmarked(false);
    },
    onError: (error: ApiError) => {
      // 404/409 에러는 이미 즐겨찾기가 제거된 상태이므로 롤백하지 않음
      if (error?.response?.status === 404 || error?.response?.status === 409) {
        setIsBookmarked(false);
      } else {
        // 다른 에러는 이전 상태로 롤백
        setIsBookmarked(previousStateRef.current);
      }
    },
    onSettled: () => {
      // 성공/실패 여부와 관계없이 서버 데이터 갱신
      queryClient.invalidateQueries({
        queryKey: ["cardset", groupId, cardsetId],
      });
    },
    // 낙관적 갱신·롤백으로 처리하므로 글로벌 toast 비활성
    meta: { skipErrorToast: true },
  });

  // 즐겨찾기 토글 핸들러
  const toggleBookmark = () => {
    if (isBookmarked) {
      unbookmarkMutation.mutate();
    } else {
      bookmarkMutation.mutate();
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading: bookmarkMutation.isPending || unbookmarkMutation.isPending,
  };
};
