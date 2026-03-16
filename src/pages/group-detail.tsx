import { Settings } from "lucide-react";
import { Button } from "@/shared/components/button";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupInfoCard } from "@/domain/group/components/group-info-card";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";
import { useGroupMembers } from "@/domain/members/hooks/use-group-members";
import { useGroupCardsets } from "@/domain/cardsets/hooks/use-group-cardsets";
import useAuthStore from "@/stores/use-auth-store";
import { Link } from "@tanstack/react-router";
import { GroupDetailSkeleton } from "@/shared/components/skeletons";
import { useMeta } from "@/shared/hooks/use-meta";
import type { ApiError } from "@/shared/apis";
import { GroupMemberSection } from "@/features/group-detail/components/group-member-section";
import { GroupCardsetSection } from "@/features/group-detail/components/group-cardset-section";
import { GroupDetailErrorView } from "@/features/group-detail/components/group-detail-error-view";

type Props = { id: string };

const GroupDetailPage = ({ id }: Props) => {
  const groupId = Number(id);
  const user = useAuthStore((state) => state.user);

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

  const cardSets =
    cardSetsData?.pages.flatMap((page) => {
      // page.content가 생기면 뒤에 page 제거
      return page.content ?? page;
    }) ?? [];

  const currentMember = members.find((m) => m.userId === user?.userId);
  const isMember = !!currentMember;
  const isOwner = currentMember?.role === "OWNER";
  const canManage =
    currentMember?.role === "OWNER" ||
    currentMember?.role === "HEAD_MANAGER" ||
    currentMember?.role === "MANAGER";

  useMeta({
    title: groupData ? `${groupData.name} | FlipNote` : undefined,
    description: groupData?.description,
  });

  if (isGroupLoading || isMembersLoading || isCardsetsLoading) {
    return <GroupDetailSkeleton />;
  }

  if (!groupData) {
    return (
      <GroupDetailErrorView
        error={groupDetailError as ApiError | null}
        groupId={groupId}
      />
    );
  }

  if (!groupData.visibility && !isMember) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold">비공개 그룹입니다</h2>
          <p className="text-muted-foreground">
            이 그룹은 비공개 그룹으로 멤버만 접근할 수 있습니다.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            돌아가기
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <GroupInfoCard group={groupData} />

        {canManage && (
          <div className="flex justify-end">
            <Link to="/groups/$groupId/manage" params={{ groupId: id }}>
              <Button variant="outline" size="sm">
                <Settings className="size-4 mr-2" />
                그룹 관리
              </Button>
            </Link>
          </div>
        )}

        <GroupMemberSection
          groupId={groupId}
          group={groupData}
          members={members}
          isMember={isMember}
          isOwner={isOwner}
          userId={user?.userId}
        />

        <GroupCardsetSection
          groupId={groupId}
          cardSets={cardSets}
          hasManagePermission={isOwner}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onFetchNextPage={fetchNextPage}
        />
      </div>
    </BaseLayout>
  );
};

export default GroupDetailPage;
