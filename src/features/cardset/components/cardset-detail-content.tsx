import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { cardSetApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import useAuthStore from "@/stores/use-auth-store";
import { Link, useNavigate } from "@tanstack/react-router";
import CardsetUpdateDialog from "@/features/cardset/components/cardset-update-dialog";
import { Heart, Star } from "lucide-react";
import { useCardSetLike } from "@/domain/cardsets/hooks/use-card-set-like";
import { useCardSetBookmark } from "@/domain/cardsets/hooks/use-card-set-bookmark";
import StudySettings from "@/features/setting-study-mode/ui/study-settings";
import { Separator } from "@/shared/components/separator";
import Badge from "@/shared/components/badge";
import { useMeta } from "@/shared/hooks/use-meta";
import { toast } from "sonner";
import { queryClient } from "@/shared/lib/query-client";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetailContent = ({ groupId, cardsetId }: Props) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ["cardset", groupId, cardsetId],
    queryFn: () => cardSetApi.getCardSet(cardsetId),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () => cardSetApi.deleteCardSet(cardsetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group", "cardsets", groupId],
      });

      toast.success("카드셋이 삭제되었습니다.");
      navigate({
        to: "/groups/$groupId",
        params: { groupId: String(groupId) },
      });
    },
    meta: { errorFallback: "카드셋 삭제를 실패했습니다." },
  });

  const cardset = data?.data.data;

  const {
    isLiked,
    toggleLike,
    isLoading: isLikeLoading,
  } = useCardSetLike({
    cardsetId,
    groupId,
    initialLiked: cardset.liked,
  });

  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarkLoading,
  } = useCardSetBookmark({
    cardsetId,
    groupId,
    initialBookmarked: cardset.bookmarked,
  });

  useMeta({
    title: `${cardset.name} | FlipNote`,
    description: `${cardset.name} - ${cardset.hashtag ?? ""}`,
  });

  const isManager = cardset.managers.some((m) => m.id === user?.userId);
  const hashtags = cardset.hashtag ? cardset.hashtag.split(" ") : [];

  return (
    <div>
      <div className="p-6 flex flex-col sm:flex-row gap-6 justify-between">
        {/* 썸네일 영역 */}
        <div className="w-full max-w-48 sm:w-auto">
          <div className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden">
            {cardset.imageUrl ? (
              <img
                src={cardset.imageUrl}
                alt={cardset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                썸네일
              </div>
            )}

            {user && (
              <button
                onClick={toggleLike}
                disabled={isLikeLoading}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isLiked ? "좋아요 취소" : "좋아요"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isLiked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                />
              </button>
            )}
            {user && (
              <button
                onClick={toggleBookmark}
                disabled={isBookmarkLoading}
                className="absolute top-3 right-16 p-2 rounded-full bg-white/80 hover:bg-white shadow-md transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isBookmarked ? "즐겨찾기 취소" : "즐겨찾기"}
              >
                <Star
                  className={`w-5 h-5 transition-colors ${
                    isBookmarked
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        {/* 카드셋 메타정보 영역 */}
        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <Badge>
              {
                GROUP_CATEGORY_MAP[
                  cardset.category as keyof typeof GROUP_CATEGORY_MAP
                ]
              }
            </Badge>
            <Badge
              colorVariant={cardset.visibility === "PUBLIC" ? "green" : "red"}
            >
              {cardset.visibility === "PUBLIC" ? "공개" : "비공개"}
            </Badge>
          </div>
          <p className="text-2xl font-bold mt-1">{cardset.name}</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-sm">
                {tag.trim()}
              </span>
            ))}
          </div>
          <div>
            <span className="text-xs text-gray-500">
              마지막 수정일 : {cardset.updatedAt}
            </span>
          </div>
          {isManager && (
            <div className="flex gap-2 justify-end flex-wrap">
              <Button asChild>
                <Link
                  to="/cardsets/editor/$id"
                  params={{ id: String(cardsetId) }}
                >
                  카드 편집하기
                </Link>
              </Button>
              <CardsetUpdateDialog
                groupId={groupId}
                cardsetId={cardsetId}
                cardset={cardset}
                renderTrigger={<Button variant="outline">수정</Button>}
              />
              <Button
                variant="outline"
                disabled={isPending}
                onClick={() => mutate()}
              >
                삭제
              </Button>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />
      <StudySettings
        groupId={groupId}
        cardsetId={cardsetId}
        totalCardCount={cardset.cardCount}
      />
    </div>
  );
};

export default CardsetDetailContent;
