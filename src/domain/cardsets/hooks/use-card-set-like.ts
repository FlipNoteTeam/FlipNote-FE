import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeApi, type ApiError } from "@/shared/apis";
import { useState, useRef } from "react";

interface UseCardSetLikeProps {
  cardsetId: number;
  groupId: number;
  initialLiked?: boolean;
}

export const useCardSetLike = ({
  cardsetId,
  groupId,
  initialLiked = false,
}: UseCardSetLikeProps) => {
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const previousStateRef = useRef(initialLiked);

  // 좋아요 추가 mutation
  const likeMutation = useMutation({
    mutationFn: () => likeApi.addLike("card_set", cardsetId),
    onMutate: async () => {
      // 이전 상태 저장
      previousStateRef.current = isLiked;
      // Optimistic update: 즉시 UI 업데이트
      setIsLiked(true);
    },
    onSuccess: () => {
      previousStateRef.current = true;
    },
    onError: (error: ApiError) => {
      // 409 에러는 이미 좋아요가 눌린 상태이므로 롤백하지 않음
      if (error?.response?.status === 409) {
        setIsLiked(true);
      } else {
        // 다른 에러는 이전 상태로 롤백
        setIsLiked(previousStateRef.current);
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

  // 좋아요 취소 mutation
  const unlikeMutation = useMutation({
    mutationFn: () => likeApi.removeLike("card_set", cardsetId),
    onMutate: async () => {
      // 이전 상태 저장
      previousStateRef.current = isLiked;
      // Optimistic update: 즉시 UI 업데이트
      setIsLiked(false);
    },
    onSuccess: () => {
      previousStateRef.current = false;
    },
    onError: (error: ApiError) => {
      // 404/409 에러는 이미 좋아요가 취소된 상태이므로 롤백하지 않음
      if (error?.response?.status === 404 || error?.response?.status === 409) {
        setIsLiked(false);
      } else {
        // 다른 에러는 이전 상태로 롤백
        setIsLiked(previousStateRef.current);
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

  // 좋아요 토글 핸들러
  const toggleLike = () => {
    if (isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  return {
    isLiked,
    toggleLike,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
  };
};
