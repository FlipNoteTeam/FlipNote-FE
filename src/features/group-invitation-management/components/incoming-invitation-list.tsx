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
import { Skeleton } from "@/shared/components/skeleton";
import ErrorDisplay from "@/shared/components/error-display";
import { EmptyState } from "@/shared/components/empty-state";

const IncomingInvitationSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-16 rounded-lg" />
            <Skeleton className="h-9 w-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const STATUS_MAP = {
  PENDING: "대기 중",
  ACCEPTED: "수락됨",
  REJECTED: "거절됨",
  EXPIRED: "만료됨",
} as const;

export const IncomingInvitationList = () => {
  const { data: invitations, isLoading, error, refetch } = useIncomingInvitations();
  const respondToInvitation = useRespondToInvitation();

  const [respondingId, setRespondingId] = useState<number | null>(null);

  const handleRespond = async (
    groupId: number,
    invitationId: number,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    try {
      setRespondingId(invitationId);
      await respondToInvitation.mutateAsync({
        groupId,
        invitationId,
        status,
      });
      window.alert(
        status === "ACCEPTED" ? "초대를 수락했습니다." : "초대를 거절했습니다.",
      );
    } catch {
      window.alert("초대 응답에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setRespondingId(null);
    }
  };

  if (isLoading) return <IncomingInvitationSkeleton />;

  if (error) return <ErrorDisplay onRetry={refetch} />;

  const pendingInvitations =
    invitations?.filter((inv) => inv.status === "PENDING") || [];

  if (pendingInvitations.length === 0) {
    return (
      <EmptyState
        icon={<Mail className="w-8 h-8" />}
        title="받은 그룹 초대가 없습니다"
      />
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
                      "ACCEPTED",
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
                      "REJECTED",
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
