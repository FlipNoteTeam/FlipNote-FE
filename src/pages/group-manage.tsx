import { useEffect, useState } from "react";
import BaseLayout from "@/shared/layouts/base-layout";
import { GroupJoinManagement } from "@/domain/group/components/group-join-management";
import { GroupInvitationManagement } from "@/domain/group/components/group-invitation-management";
import { GroupUpdateManagement } from "@/domain/group/components/group-update-management";
import { GroupRoleManagement } from "@/domain/group/components/group-role-management";
import { useGroupDetail } from "@/domain/group/hooks/use-group-detail";
import { useMyGroupRole } from "@/domain/group/hooks/use-my-group-role";
import { Button } from "@/shared/components/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SidebarTabLayout } from "@/shared/layouts/sidebar-tab-layout";
import { PageSkeleton } from "@/shared/components/skeletons";
import { useMeta } from "@/shared/hooks/use-meta";
import {
  canManageGroup,
  getAccessibleTabs,
  getDefaultManageTab,
  type ManageTab,
} from "@/shared/rbac";

type Props = { groupId: string };

const TAB_LABELS: Record<ManageTab, string> = {
  "group-settings": "그룹 정보 수정",
  "join-requests": "가입 신청 관리",
  invitations: "초대 관리",
  "role-management": "권한 관리",
};

const GroupManagePage = ({ groupId }: Props) => {
  const navigate = useNavigate();
  const groupIdNum = Number(groupId);

  const { data: groupData, isLoading: isGroupLoading } = useGroupDetail(groupIdNum);
  const { data: myRole, isLoading: isRoleLoading } = useMyGroupRole(groupIdNum);

  useMeta({
    title: groupData ? `${groupData.name} 관리 | FlipNote` : undefined,
  });

  const [activeTab, setActiveTab] = useState<ManageTab>("group-settings");

  const role = myRole?.role;

  // 역할이 로드되면 접근 불가 탭에 있을 경우 기본 탭으로 이동
  useEffect(() => {
    if (!role) return;
    setActiveTab((prev) => {
      const accessible = getAccessibleTabs(role);
      return accessible.includes(prev) ? prev : getDefaultManageTab(role);
    });
  }, [role]);

  if (isGroupLoading || isRoleLoading) {
    return <PageSkeleton />;
  }

  if (!canManageGroup(role)) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold">접근 권한 없음</h2>
          <p className="text-muted-foreground">
            그룹 관리는 소유자 및 매니저만 접근할 수 있습니다.
          </p>
          <Button onClick={() => navigate({ to: "/groups/$groupId", params: { groupId } })}>
            그룹으로 돌아가기
          </Button>
        </div>
      </BaseLayout>
    );
  }

  const accessibleTabs = getAccessibleTabs(role);

  return (
    <BaseLayout>
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/groups/$groupId", params: { groupId } })}
            className="mb-2"
          >
            <ChevronLeft className="size-4 mr-1" />
            그룹으로 돌아가기
          </Button>
          <h1 className="text-3xl font-bold">그룹 관리</h1>
          <p className="text-gray-600 mt-1">{groupData?.name}</p>
        </div>

        <SidebarTabLayout>
          <SidebarTabLayout.Sidebar>
            {accessibleTabs.map((tab) => (
              <SidebarTabLayout.Tab
                key={tab}
                active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </SidebarTabLayout.Tab>
            ))}
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
            {activeTab === "role-management" && (
              <GroupRoleManagement groupId={groupIdNum} currentUserRole={role} />
            )}
          </SidebarTabLayout.Content>
        </SidebarTabLayout>
      </div>
    </BaseLayout>
  );
};

export default GroupManagePage;
