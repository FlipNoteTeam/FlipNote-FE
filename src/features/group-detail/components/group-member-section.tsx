import { GroupInviteDialog } from "@/domain/group/components/group-invite-dialog";
import { GroupJoinDialog } from "@/domain/group/components/group-join-dialog";
import { useGroupJoin } from "@/domain/group/hooks/use-group-join";
import type { GroupDetail } from "@/domain/group/types";
import { MemberCard } from "@/domain/members/components/member-card";
import type { ApiError, GroupMemberInfo } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/carousel";
import { EmptyState } from "@/shared/components/empty-state";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { PersonStanding, Plus, UserPlus } from "lucide-react";

type Props = {
  groupId: number;
  group: GroupDetail;
  members: GroupMemberInfo[];
  isMember: boolean;
  isOwner: boolean;
  userId?: number;
};

export const GroupMemberSection = ({
  groupId,
  group,
  members,
  isMember,
  isOwner,
  userId,
}: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: joinGroup, isPending: isJoining } = useGroupJoin();

  const showJoinButton = !isMember && !!userId;

  const handleDirectJoin = () => {
    if (!userId) {
      navigate({ to: "/auth/login", search: { redirect: window.location.href } });
      return;
    }
    joinGroup(
      { groupId },
      {
        onSuccess: () => {
          window.alert(`${group.name} 그룹에 가입했습니다.`);
          queryClient.invalidateQueries({ queryKey: ["group"] });
        },
        onError: (error: ApiError) => {
          window.alert(error?.response?.data?.message || "가입에 실패했습니다.");
        },
      },
    );
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">멤버</h2>
        <div className="flex gap-2">
          {showJoinButton &&
            (group.applicationRequired ? (
              <GroupJoinDialog groupId={groupId} groupName={group.name}>
                <Button size="sm">
                  <UserPlus className="size-4" />
                  가입신청
                </Button>
              </GroupJoinDialog>
            ) : (
              <Button size="sm" onClick={handleDirectJoin} disabled={isJoining}>
                <UserPlus className="size-4" />
                {isJoining ? "가입 중..." : "그룹 가입"}
              </Button>
            ))}
          {isOwner && (
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
        <Carousel opts={{ align: "start" }} className="w-full">
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
  );
};
