import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import {
  useIncomingInvitations,
  useRespondToInvitation,
} from "@/domain/group/invitation";
import { Mail, Check, X, Calendar } from "lucide-react";
import { useState } from "react";

const STATUS_MAP = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
  EXPIRED: "만료됨",
} as const;

export const IncomingInvitationList = () => {
  const { data: invitations, isLoading, error } = useIncomingInvitations();
  const respondToInvitation = useRespondToInvitation();

  const [respondingId, setRespondingId] = useState<number | null>(null);

  const handleRespond = async (
    groupId: number,
    invitationId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    try {
      setRespondingId(invitationId);
      await respondToInvitation.mutateAsync({
        groupId,
        invitationId,
        status,
      });
      window.alert({
        title:
          status === "ACCEPTED" ? "초대를 수락했습니다" : "초대를 거절했습니다",
        description:
          status === "ACCEPTED"
            ? "그룹에 가입되었습니다."
            : "초대를 거절했습니다.",
      });
    } catch (error) {
      window.alert({
        title: "오류가 발생했습니다",
        description: "초대 응답에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setRespondingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-red-500">초대 목록을 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  const pendingInvitations =
    invitations?.filter((inv) => inv.status === "PENDING") || [];

  if (pendingInvitations.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>받은 그룹 초대가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingInvitations.map((invitation) => (
        <Card key={invitation.invitationId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                그룹 ID: {invitation.groupId}
              </CardTitle>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {STATUS_MAP[invitation.status]}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                초대 받은 날짜:{" "}
                {new Date(invitation.createdAt).toLocaleDateString()}
              </span>
            </div>

            {invitation.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    handleRespond(
                      invitation.groupId,
                      invitation.invitationId,
                      "ACCEPTED"
                    )
                  }
                  disabled={respondingId === invitation.invitationId}
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  수락
                </Button>
                <Button
                  onClick={() =>
                    handleRespond(
                      invitation.groupId,
                      invitation.invitationId,
                      "REJECTED"
                    )
                  }
                  disabled={respondingId === invitation.invitationId}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  거절
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
