import { toast } from "sonner";
import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import {
  useOutgoingInvitations,
  useDeleteGroupInvitation,
} from "@/domain/group/hooks/use-group-invitation";
import { GroupInviteDialog } from "@/domain/group/components/group-invite-dialog";
import { UserPlus, X } from "lucide-react";
import type { ApiError } from "@/shared/apis";

type GroupInvitationManagementProps = {
  groupId: number;
};

export const GroupInvitationManagement = ({
  groupId,
}: GroupInvitationManagementProps) => {
  const { data: invitations = [], isLoading } = useOutgoingInvitations(groupId);
  const { mutate: deleteInvitation, isPending: isDeleting } =
    useDeleteGroupInvitation(groupId);

  const handleCancelInvitation = (invitationId: number, nickname: string) => {
    if (!window.confirm(`${nickname}님에게 보낸 초대를 취소하시겠습니까?`)) {
      return;
    }

    deleteInvitation(invitationId, {
      onSuccess: () => {
        toast.success("초대를 취소했습니다.");
      },
      onError: (error: ApiError) => {
        toast.error(
          error?.response?.data?.message || "초대 취소에 실패했습니다.",
        );
      },
    });
  };

  // PENDING 상태인 초대만 필터링
  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "PENDING",
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">초대 관리</h2>
          <p className="text-gray-600 mt-1">
            사용자를 그룹에 초대하고 초대 현황을 관리할 수 있습니다.
          </p>
        </div>
        <GroupInviteDialog groupId={groupId}>
          <Button>
            <UserPlus className="size-4 mr-2" />
            초대하기
          </Button>
        </GroupInviteDialog>
      </div>

      {pendingInvitations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">보낸 초대가 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingInvitations.map((invitation) => (
            <Card key={invitation.invitationId}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {invitation.inviteeNickname || invitation.inviteeEmail}
                </CardTitle>
                <CardDescription>
                  이메일: {invitation.inviteeEmail}
                  <br />
                  상태: 대기 중
                  <br />
                  초대일: {new Date(invitation.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCancelInvitation(
                        invitation.invitationId,
                        invitation.inviteeNickname || invitation.inviteeEmail,
                      )
                    }
                    disabled={isDeleting}
                  >
                    <X className="size-4 mr-1" />
                    초대 취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
