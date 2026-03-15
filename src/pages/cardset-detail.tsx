import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { cardSetApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useGroupMembers } from "@/domain/members/hooks/use-group-members";
import useAuthStore from "@/stores/use-auth-store";
import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import CardsetUpdateDialog from "@/features/cardset/components/cardset-update-dialog";
import BaseLayout from "@/shared/layouts/base-layout";
import { Heart, Star, Users, ChevronRight } from "lucide-react";
import { useCardSetLike } from "@/domain/cardsets/hooks/use-card-set-like";
import { useCardSetBookmark } from "@/domain/cardsets/hooks/use-card-set-bookmark";
import StudySettings from "@/features/setting-study-mode/ui/study-settings";
import { Separator } from "@/shared/components/separator";
import Badge from "@/shared/components/badge";
import { useMeta } from "@/shared/hooks/use-meta";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";

type Props = {
  groupId: number;
  cardsetId: number;
};

const CardsetDetail = ({ groupId, cardsetId }: Props) => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const { data } = useSuspenseQuery({
    queryKey: ["cardset", groupId, cardsetId],
    queryFn: () => cardSetApi.getCardSet(groupId, cardsetId),
  });

  const { data: group } = useGroupDetail(groupId);

  const { mutate, isPending } = useMutation({
    mutationFn: () => cardSetApi.deleteCardSet(groupId, cardsetId),
    onSuccess: () => {
      alert("카드셋 삭제에 성공했습니다.");
      navigate({ to: "/cardset-list" });
    },
    onError: () => {
      alert("카드셋 삭제를 실패했습니다.");
    },
  });

  const { data: members = [] } = useGroupMembers(groupId);

  const cardset = data?.data.data;

  // 카드셋 좋아요 훅
  const {
    isLiked,
    toggleLike,
    isLoading: isLikeLoading,
  } = useCardSetLike({
    cardsetId,
    groupId,
    initialLiked: cardset?.liked,
  });

  // 카드셋 즐겨찾기 훅
  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarkLoading,
  } = useCardSetBookmark({
    cardsetId,
    groupId,
    initialBookmarked: cardset?.bookmarked,
  });

  useMeta({
    title: cardset ? `${cardset.name} | FlipNote` : undefined,
    description: cardset
      ? `${cardset.name} - ${cardset.hashtag ?? ""}`
      : undefined,
  });

  // 현재 사용자가 그룹 멤버인지 확인
  const isMember = members.some((member) => member.userId === user?.userId);

  // 카드셋 접근 제어: 공개 + 가입 승인 필수인 그룹의 경우 멤버가 아니면 접근 불가
  useEffect(() => {
    if (group && !isMember && group.visibility && group.applicationRequired) {
      window.alert("이 카드셋을 보려면 그룹에 가입 신청을 해주세요.");
      navigate({ to: `/groups/${groupId}` });
    }
  }, [group, isMember, groupId, navigate]);

  const hashtags = cardset.hashtag ? cardset.hashtag.split(",") : [];

  const handleClickDelete = () => {
    mutate();
  };
  return (
    <BaseLayout>
      {/* 소속 그룹 배너 - full width */}
      <Link
        to="/groups/$groupId"
        params={{ groupId: String(groupId) }}
        className="-mx-4 -mt-6 sm:-mx-6 lg:-mx-16 lg:-mt-16 mb-8 block bg-primary/5 border-b hover:bg-primary/10 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                소속 그룹
              </p>
              <p className="font-bold text-base">
                {group?.name ?? "그룹 보기"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-primary font-medium">
            <span>그룹으로 이동</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
      <div className="mx-auto p-6 flex flex-col sm:flex-row gap-6 justify-between">
        {/* 썸네일 영역 */}
        <div className="w-full max-w-48 sm:w-auto">
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
        <div className="flex-1 space-y-4">
          <div className="flex gap-2">
            <Badge>{GROUP_CATEGORY_MAP[cardset.category]}</Badge>
            <Badge colorVariant={cardset.publicVisible ? "green" : "red"}>
              {cardset.publicVisible ? "공개" : "비공개"}
            </Badge>
          </div>
          <p className="text-2xl font-bold mt-1">{cardset.name}</p>
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
            <Button
              variant="outline"
              disabled={isPending}
              onClick={handleClickDelete}
            >
              삭제
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-4" />
      <StudySettings groupId={groupId} cardsetId={cardsetId} />
    </BaseLayout>
  );
};

export default CardsetDetail;
