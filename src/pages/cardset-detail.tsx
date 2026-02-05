import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { cardSetApi, groupApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { useQuery } from "@tanstack/react-query";
import { useGroupMembers } from "@/domain/members/hooks/useGroupMembers";
import useAuthStore from "@/stores/useAuthStore";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import CardsetUpdateDialog from "@/features/cardset/components/CardsetUpdateDialog";
import BaseLayout from "@/shared/layouts/base-layout";
import { Heart, Star } from "lucide-react";
import { useCardSetLike } from "@/domain/cardsets/hooks/useCardSetLike";
import { useCardSetBookmark } from "@/domain/cardsets/hooks/useCardSetBookmark";
import StudySettings from "@/features/setting-study-mode/ui/study-settings";
import { Separator } from "@/shared/components/separator";
import Badge from "@/shared/components/badge";
import { useMeta } from "@/shared/hooks/use-meta";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetail = ({ groupId, cardsetId }: Props) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["cardset", groupId, cardsetId],
    queryFn: () => cardSetApi.getCardSet(groupId, cardsetId),
  });

  const { data: groupData } = useQuery({
    queryKey: ["group", groupId],
    queryFn: () => groupApi.getGroupDetail(groupId),
  });

  const { data: members = [] } = useGroupMembers(groupId);

  // 카드셋 좋아요 훅
  const {
    isLiked,
    toggleLike,
    isLoading: isLikeLoading,
  } = useCardSetLike({
    cardsetId,
    groupId,
  });

  // 카드셋 즐겨찾기 훅
  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarkLoading,
  } = useCardSetBookmark({
    cardsetId,
    groupId,
  });

  const cardset = data?.data.data;
  const group = groupData?.data.data;

  useMeta({
    title: cardset ? `${cardset.name} | FlipNote` : undefined,
    description: cardset
      ? `${cardset.name} - ${cardset.hashtag ?? ""}`
      : undefined,
  });

  // 현재 사용자가 그룹 멤버인지 확인
  const isMember = members.some((member) => member.id === user?.userId);

  // 카드셋 접근 제어: 공개 + 가입 승인 필수인 그룹의 경우 멤버가 아니면 접근 불가
  useEffect(() => {
    if (
      group &&
      !isMember &&
      group.publicVisible &&
      group.applicationRequired
    ) {
      window.alert("이 카드셋을 보려면 그룹에 가입 신청을 해주세요.");
      navigate({ to: `/groups/${groupId}` });
    }
  }, [group, isMember, groupId, navigate]);

  if (!cardset) return null;

  const hashtags = cardset.hashtag ? cardset.hashtag.split(",") : [];

  return (
    <BaseLayout>
      <div className="mx-auto p-6 flex gap-6 justify-between flex-wrap">
        {/* 썸네일 영역 */}
        <div className="w-2/7 max-w-48">
          <div className="relative aspect-square bg-gray-200 rounded-2xl overflow-hidden group">
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

            {/* 좋아요 버튼 */}
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
            {/* 즐겨찾기 버튼 */}
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
        <div className="flex-1 space-y-4 basis-2/3">
          <div className="flex gap-2">
            <Badge>{GROUP_CATEGORY_MAP[cardset.category]}</Badge>
            <Badge colorVariant={cardset.publicVisible ? "green" : "red"}>
              {cardset.publicVisible ? "공개" : "비공개"}
            </Badge>
          </div>
          <p className="text-2xl font-bold  mt-1">{cardset.name} </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {hashtags.map((tag, index) => (
              <span key={index} className="text-sm">
                #{tag.trim()}
              </span>
            ))}
          </div>
          <div>
            <span className="text-xs text-gray-500">
              마지막 수정일 : {cardset.modifiedAt}
            </span>
          </div>
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
            <Button variant="outline">삭제</Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />
      <StudySettings groupId={groupId} cardsetId={cardsetId} />
    </BaseLayout>
  );
};

export default CardsetDetail;
