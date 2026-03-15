import { useState } from "react";
import { useGroupMembers } from "@/domain/members/hooks/use-group-members";
import {
  useAssignMemberRole,
  useDismissMemberRole,
} from "@/domain/group/hooks/use-group-role-management";
import { MemberSelectDialog } from "@/domain/members/components/member-select-dialog";
import { Card, CardContent } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import Badge from "@/shared/components/badge";
import { UserMinus, UserPlus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ApiError, GroupMemberInfo } from "@/shared/apis";
import type { SelectableMember } from "@/domain/members/components/member-select-dialog";

type AssignableRole = "HEAD_MANAGER" | "MANAGER";

const ROLE_CONFIG = {
  HEAD_MANAGER: {
    label: "총괄 매니저",
    description: "매니저 부임/해제 포함 모든 하위 권한 보유",
    permissions: ["멤버 추방", "가입 신청 응답", "초대", "매니저 부임/해제"],
    badgeColor: "blue" as const,
  },
  MANAGER: {
    label: "매니저",
    description: "멤버 추방 및 가입 신청 응답 권한 보유",
    permissions: ["멤버 추방", "가입 신청 응답", "초대"],
    badgeColor: "green" as const,
  },
} as const;

const ROLE_LABEL_MAP: Record<GroupMemberInfo["role"], string> = {
  OWNER: "소유자",
  HEAD_MANAGER: "총괄 매니저",
  MANAGER: "매니저",
  MEMBER: "일반 회원",
};

type Props = {
  groupId: number;
};

export const GroupRoleManagement = ({ groupId }: Props) => {
  const [activeTab, setActiveTab] = useState<AssignableRole>("HEAD_MANAGER");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: members = [], isLoading } = useGroupMembers(groupId);
  const { mutate: assignRole, isPending: isAssigning } =
    useAssignMemberRole(groupId);
  const { mutate: dismissRole, isPending: isDismissing } =
    useDismissMemberRole(groupId);

  const config = ROLE_CONFIG[activeTab];

  const currentRoleMembers = members.filter((m) => m.role === activeTab);

  // HEAD_MANAGER 탭: MEMBER와 MANAGER 부임 가능 (승급)
  // MANAGER 탭: MEMBER만 부임 가능
  const assignableMembers: SelectableMember[] = members
    .filter((m) => {
      if (m.role === "OWNER" || m.role === activeTab) return false;
      if (activeTab === "HEAD_MANAGER") {
        return m.role === "MEMBER" || m.role === "MANAGER";
      }
      return m.role === "MEMBER";
    })
    .map((m) => ({
      id: m.userId,
      name: m.nickname,
      profile: m.profileImage,
      subtitle: ROLE_LABEL_MAP[m.role],
    }));

  const handleAssign = (member: SelectableMember) => {
    assignRole(
      { userId: member.id, role: activeTab },
      {
        onSuccess: () => {
          window.alert(`${member.name}님을 ${config.label}로 부임했습니다.`);
          setDialogOpen(false);
        },
        onError: (error: ApiError) => {
          window.alert(
            error?.response?.data?.message || "역할 부임에 실패했습니다.",
          );
        },
      },
    );
  };

  const handleDismiss = (member: GroupMemberInfo) => {
    if (
      !window.confirm(
        `${member.nickname}님의 ${config.label} 직책을 해제하시겠습니까?`,
      )
    )
      return;

    dismissRole(member.userId, {
      onSuccess: () => {
        window.alert(`${member.nickname}님의 직책을 해제했습니다.`);
      },
      onError: (error: ApiError) => {
        window.alert(
          error?.response?.data?.message || "직책 해제에 실패했습니다.",
        );
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold">권한 관리</h2>
        <p className="text-gray-600 mt-1">
          그룹 멤버의 직책을 부임하거나 해제할 수 있습니다.
        </p>
      </div>

      {/* 직책 계층 안내 */}
      <Card>
        <CardContent className="py-4">
          <p className="text-sm font-medium text-gray-700 mb-3">직책 계층</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge colorVariant="red">소유자</Badge>
              <span className="text-xs text-gray-500">
                총괄 매니저 부임/해제 및 모든 하위 권한
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge colorVariant="blue">총괄 매니저</Badge>
              <span className="text-xs text-gray-500">
                매니저 부임/해제 및 모든 하위 권한
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge colorVariant="green">매니저</Badge>
              <span className="text-xs text-gray-500">
                멤버 추방, 가입 신청 응답
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge colorVariant="gray">일반 회원</Badge>
              <span className="text-xs text-gray-500">초대 (기본)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 내부 탭 */}
      <div className="border-b flex">
        {(["HEAD_MANAGER", "MANAGER"] as const).map((role) => (
          <button
            key={role}
            onClick={() => setActiveTab(role)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === role
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            {ROLE_CONFIG[role].label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {/* 권한 설명 + 부임 버튼 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-600">{config.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {config.permissions.map((perm) => (
                <Badge key={perm} colorVariant="gray">
                  {perm}
                </Badge>
              ))}
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="shrink-0"
          >
            <UserPlus className="size-4 mr-1.5" />
            부임하기
          </Button>
        </div>

        {/* 현재 직책 보유 멤버 목록 */}
        {currentRoleMembers.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <p className="text-center text-sm text-gray-500">
                현재 {config.label}가 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {currentRoleMembers.map((member) => (
              <Card key={member.memberId}>
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        member.profileImage ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.nickname}`
                      }
                      alt={member.nickname}
                      className="size-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-medium text-sm">{member.nickname}</p>
                      <Badge colorVariant={config.badgeColor} className="mt-1">
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(member)}
                    disabled={isDismissing}
                  >
                    <UserMinus className="size-4 mr-1" />
                    해제
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 멤버 선택 다이얼로그 */}
      <MemberSelectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        members={assignableMembers}
        onSelect={handleAssign}
        isLoading={isAssigning}
        title={`${config.label} 부임`}
        description={`${config.label}로 부임할 멤버를 선택하세요. 직책은 한 명당 하나만 부여됩니다.`}
      />
    </div>
  );
};
