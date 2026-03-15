import { Plus, UserPlus, Settings, Wind, PersonStanding } from "lucide-react";
import { Button } from "@/shared/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/carousel";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupInfoCard } from "@/domain/group/components/group-info-card";
import { MemberCard } from "@/domain/members/components/member-card";
import { ThumbnailCard } from "@/shared/components/thumbnail-card";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";
import { useGroupMembers } from "@/domain/members/hooks/use-group-members";
import { useGroupCardsets } from "@/domain/cardsets/hooks/use-group-cardsets";
import CardsetCreateDialog from "@/features/cardset/components/cardset-create-dialog";
import { GroupJoinDialog } from "@/domain/group/components/group-join-dialog";
import { GroupInviteDialog } from "@/domain/group/components/group-invite-dialog";
import { useGroupJoin } from "@/domain/group/hooks/use-group-join";
import useAuthStore from "@/stores/use-auth-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { GroupDetailSkeleton } from "@/shared/components/skeletons";
import { useMeta } from "@/shared/hooks/use-meta";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/shared/apis";
import { EmptyState } from "@/shared/components/empty-state";

type Props = { id: string };

const GroupDetailPage = ({ id }: Props) => {
  const groupId = Number(id);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: joinGroup, isPending: isJoining } = useGroupJoin();

  const {
    data: groupData,
    isLoading: isGroupLoading,
    error: groupDetailError,
  } = useGroupDetail(groupId);
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

  // 현재 사용자가 그룹 멤버인지 확인 및 역할 체크 -> 현재 사용자의 역할 찾는 api가 필요함.
  const currentMember = members.find(
    (member) => member.userId === user?.userId,
  );
  const isMember = !!currentMember;
  const isOwner = currentMember?.role === "OWNER";
  const hasManagePermission = isOwner; // OWNER만 관리 권한

  // 비멤버에게 가입 버튼 노출
  const showJoinButton = !isMember && !!user;

  const handleDirectJoin = () => {
    if (!user) {
      navigate({
        to: "/auth/login",
        search: { redirect: window.location.href },
      });
      return;
    }
    joinGroup(
      { groupId },
      {
        onSuccess: () => {
          window.alert(`${groupData?.name} 그룹에 가입했습니다.`);
          queryClient.invalidateQueries({
            queryKey: ["group"],
          });
        },
        onError: (error: ApiError) => {
          window.alert(
            error?.response?.data?.message || "가입에 실패했습니다.",
          );
        },
      },
    );
  };

  useMeta({
    title: groupData ? `${groupData.name} | FlipNote` : undefined,
    description: groupData?.description,
  });

  const isLoading = isGroupLoading || isMembersLoading || isCardsetsLoading;

  if (isLoading) {
    return <GroupDetailSkeleton />;
  }

  if (!groupData) {
    const errorCode = (groupDetailError as ApiError)?.response?.data?.[
      "code"
    ] as string | undefined;
    const errorMessage = (groupDetailError as ApiError)?.response?.data
      ?.message;

    // GROUP_JOIN_001: 그룹 멤버가 아닌 경우 → 가입 신청 UI 표시
    if (errorCode === "GROUP_JOIN_001") {
      return (
        <BaseLayout>
          <div className="mx-auto max-w-6xl p-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                가입이 필요한 그룹입니다
              </h2>
              <p className="text-muted-foreground">
                이 그룹의 콘텐츠를 보려면 가입이 필요합니다.
              </p>
              {user ? (
                <GroupJoinDialog groupId={groupId} groupName="이 그룹">
                  <Button>
                    <UserPlus className="size-4 mr-2" />
                    가입 신청
                  </Button>
                </GroupJoinDialog>
              ) : (
                <Button
                  onClick={() =>
                    navigate({
                      to: "/auth/login",
                      search: { redirect: window.location.href },
                    })
                  }
                >
                  로그인하고 가입 신청
                </Button>
              )}
              <div>
                <Button onClick={() => window.history.back()} variant="outline">
                  돌아가기
                </Button>
              </div>
            </div>
          </div>
        </BaseLayout>
      );
    }

    // 그 외 에러: 에러 코드와 메시지 노출
    if (groupDetailError) {
      return (
        <BaseLayout>
          <div className="mx-auto max-w-6xl p-6">
            <div className="text-center space-y-3">
              {errorCode && (
                <p className="text-sm font-mono text-muted-foreground">
                  {errorCode}
                </p>
              )}
              <p className="text-red-500">
                {errorMessage || "오류가 발생했습니다."}
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
        <div className="mx-auto max-w-6xl p-6">
          <p className="text-center text-muted-foreground">
            그룹을 찾을 수 없습니다.
          </p>
        </div>
      </BaseLayout>
    );
  }

  // 비공개 그룹 접근 제어: 멤버가 아니면 접근 불가
  if (!groupData.visibility && !isMember) {
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
              {showJoinButton &&
                (groupData.applicationRequired ? (
                  <GroupJoinDialog groupId={groupId} groupName={groupData.name}>
                    <Button size="sm" variant="default">
                      <UserPlus className="size-4" />
                      가입신청
                    </Button>
                  </GroupJoinDialog>
                ) : (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleDirectJoin}
                    disabled={isJoining}
                  >
                    <UserPlus className="size-4" />
                    {isJoining ? "가입 중..." : "그룹 가입"}
                  </Button>
                ))}
              {hasManagePermission && (
                <GroupInviteDialog groupId={groupId}>
                  <Button size="sm" variant="outline">
                    <Plus className="size-4" />
                    멤버 초대
                  </Button>
                </GroupInviteDialog>
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
                    key={member.userId}
                    className="basis-1/2 md:basis-1/3 lg:basis-1/5"
                  >
                    <MemberCard member={member} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          ) : (
            <EmptyState
              icon={<PersonStanding />}
              title="멤버가 없어요"
              description="친구를 초대해보세요!"
            />
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
                  <Link
                    key={cardSet.cardSetId}
                    to="/groups/$groupId/cardsets/$cardsetId"
                    params={{
                      groupId: String(cardSet.groupId),
                      cardsetId: String(cardSet.cardSetId),
                    }}
                  >
                    <ThumbnailCard
                      imageUrl={cardSet.imageUrl}
                      title={cardSet.name}
                      category={cardSet.category}
                      subtitle={
                        cardSet.hashtag ? `#${cardSet.hashtag}` : undefined
                      }
                    />
                  </Link>
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
            <EmptyState
              icon={<Wind />}
              title="카드셋이 없어요"
              description="카드셋을 생성해보세요!"
            />
          )}
        </section>
      </div>
    </BaseLayout>
  );
};

export default GroupDetailPage;
