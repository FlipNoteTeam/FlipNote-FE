import { Plus, UserPlus, Settings } from "lucide-react";
import { Button } from "@/shared/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/carousel";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupInfoCard } from "@/domain/group/components/GroupInfoCard";
import { MemberCard } from "@/domain/members/components/MemberCard";
import { CardsetCard } from "@/domain/cardsets/components/CardsetCard";
import { useGroupDetail } from "@/domain/group/hooks/useGroupDetail";
import { useGroupMembers } from "@/domain/members/hooks/useGroupMembers";
import { useGroupCardsets } from "@/domain/cardsets/hooks/useGroupCardsets";
import CardsetCreateDialog from "@/features/cardset/components/CardsetCreateDialog";
import { GroupJoinDialog } from "@/domain/group/components/GroupJoinDialog";
import useAuthStore from "@/stores/useAuthStore";
import { Link } from "@tanstack/react-router";

type Props = { id: string };

const GroupDetailPage = ({ id }: Props) => {
  const groupId = Number(id);
  const user = useAuthStore((state) => state.user);

  const { data: groupData, isLoading: isGroupLoading } =
    useGroupDetail(groupId);
  const { data: members = [], isLoading: isMembersLoading } =
    useGroupMembers(groupId);
  const {
    data: cardSetsData,
    isLoading: isCardsetsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGroupCardsets(groupId);

  // 모든 페이지의 카드셋을 하나의 배열로 합치기
  const cardSets = cardSetsData?.pages.flatMap((page) => page.content) ?? [];

  // 현재 사용자가 그룹 멤버인지 확인 및 역할 체크
  const currentMember = members.find((member) => member.id === user?.userId);
  const isMember = !!currentMember;
  const isOwner = currentMember?.role === "OWNER";
  const hasManagePermission = isOwner; // OWNER만 관리 권한

  // 가입 신청 버튼 표시 여부 (멤버가 아니고 가입 승인이 필요한 그룹)
  const showJoinButton = !isMember && groupData?.applicationRequired;

  const isLoading = isGroupLoading || isMembersLoading || isCardsetsLoading;

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </div>
      </BaseLayout>
    );
  }

  if (!groupData) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6">
          <p className="text-center text-muted-foreground">
            그룹을 찾을 수 없습니다.
          </p>
        </div>
      </BaseLayout>
    );
  }

  // 비공개 그룹 접근 제어: 멤버가 아니면 접근 불가
  if (!groupData.publicVisible && !isMember) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">
              비공개 그룹입니다
            </h2>
            <p className="text-muted-foreground">
              이 그룹은 비공개 그룹으로 멤버만 접근할 수 있습니다.
            </p>
            <Button onClick={() => window.history.back()} variant="outline">
              돌아가기
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* 그룹 정보 섹션 */}
        <GroupInfoCard group={groupData} />

        {/* 그룹 관리 버튼 (OWNER만) */}
        {isOwner && (
          <div className="flex justify-end">
            <Link to="/groups/$groupId/manage" params={{ groupId: id }}>
              <Button variant="outline" size="sm">
                <Settings className="size-4 mr-2" />
                그룹 관리
              </Button>
            </Link>
          </div>
        )}

        {/* 멤버 섹션 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">멤버</h2>
            <div className="flex gap-2">
              {showJoinButton && (
                <GroupJoinDialog groupId={groupId} groupName={groupData.name}>
                  <Button size="sm" variant="default">
                    <UserPlus className="size-4" />
                    가입신청
                  </Button>
                </GroupJoinDialog>
              )}
              {hasManagePermission && (
                <Button size="sm" variant="outline">
                  <Plus className="size-4" />
                  멤버 초대
                </Button>
              )}
            </div>
          </div>
          {members.length > 0 ? (
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {members.map((member) => (
                  <CarouselItem
                    key={member.id}
                    className="md:basis-1/3 lg:basis-1/5"
                  >
                    <MemberCard member={member} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              멤버가 없습니다.
            </p>
          )}
        </section>

        {/* 카드셋 목록 섹션 */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">카드셋</h2>
            {hasManagePermission && (
              <CardsetCreateDialog
                groupId={groupId}
                renderTrigger={
                  <Button size="sm" variant="outline">
                    <Plus className="size-4" />
                    카드셋 생성
                  </Button>
                }
              />
            )}
          </div>
          {cardSets.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cardSets.map((cardSet) => (
                  <CardsetCard key={cardSet.cardSetId} cardset={cardSet} />
                ))}
              </div>
              {/* 더보기 버튼 */}
              {hasNextPage && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? "로딩 중..." : "더 보기"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              카드셋이 없습니다.
            </p>
          )}
        </section>
      </div>
    </BaseLayout>
  );
};

export default GroupDetailPage;
