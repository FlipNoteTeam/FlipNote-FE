import { useState } from "react";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupJoinManagement } from "@/domain/group/components/GroupJoinManagement";
import { GroupInvitationManagement } from "@/domain/group/components/GroupInvitationManagement";
import { GroupUpdateManagement } from "@/domain/group/components/GroupUpdateManagement";
import { useGroupDetail } from "@/domain/group/hooks/useGroupDetail";
import { useGroupMembers } from "@/domain/members/hooks/useGroupMembers";
import useAuthStore from "@/stores/useAuthStore";
import { Button } from "@/shared/components/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTabLayout } from "@/shared/layouts/sidebar-tab-layout";
import { PageSkeleton } from "@/shared/components/skeletons";
import { useMeta } from "@/shared/hooks/use-meta";

type Props = {
  groupId: string;
};

type MenuTab = "join-requests" | "invitations" | "group-settings";

const GroupManagePage = ({ groupId }: Props) => {
  const navigate = useNavigate();
  const groupIdNum = Number(groupId);
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<MenuTab>("group-settings");

  const { data: groupData, isLoading: isGroupLoading } =
    useGroupDetail(groupIdNum);
  const { data: members = [], isLoading: isMembersLoading } =
    useGroupMembers(groupIdNum);

  useMeta({
    title: groupData ? `${groupData.name} 관리 | FlipNote` : undefined,
  });

  // 현재 사용자가 그룹 OWNER인지 확인
  const currentMember = members.find((member) => member.id === user?.userId);
  const isOwner = currentMember?.role === "OWNER";

  if (isGroupLoading || isMembersLoading) {
    return <PageSkeleton />;
  }

  // OWNER가 아니면 접근 불가
  if (!isOwner) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">접근 권한 없음</h2>
            <p className="text-muted-foreground">
              그룹 관리는 그룹장만 접근할 수 있습니다.
            </p>
            <Button onClick={() => navigate({ to: `/groups/${groupId}` })}>
              그룹으로 돌아가기
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="mx-auto max-w-7xl p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: `/groups/${groupId}` })}
            className="mb-2"
          >
            <ChevronLeft className="size-4 mr-1" />
            그룹으로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold">그룹 관리</h1>
          <p className="text-gray-600 mt-1">{groupData?.name}</p>
        </div>

        {/* 레이아웃: 좌측 메뉴 + 우측 콘텐츠 */}
        <SidebarTabLayout>
          <SidebarTabLayout.Sidebar>
            <SidebarTabLayout.Tab
              active={activeTab === "group-settings"}
              onClick={() => setActiveTab("group-settings")}
            >
              그룹 정보 수정
            </SidebarTabLayout.Tab>
            <SidebarTabLayout.Tab
              active={activeTab === "join-requests"}
              onClick={() => setActiveTab("join-requests")}
            >
              가입 신청 관리
            </SidebarTabLayout.Tab>
            <SidebarTabLayout.Tab
              active={activeTab === "invitations"}
              onClick={() => setActiveTab("invitations")}
            >
              초대 관리
            </SidebarTabLayout.Tab>
          </SidebarTabLayout.Sidebar>

          <SidebarTabLayout.Content>
            {activeTab === "group-settings" && (
              <GroupUpdateManagement groupId={groupIdNum} />
            )}
            {activeTab === "join-requests" && (
              <GroupJoinManagement groupId={groupIdNum} />
            )}
            {activeTab === "invitations" && (
              <GroupInvitationManagement groupId={groupIdNum} />
            )}
          </SidebarTabLayout.Content>
        </SidebarTabLayout>
      </div>
    </BaseLayout>
  );
};

export default GroupManagePage;
