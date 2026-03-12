import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import {
  useMyGroupJoinList,
  useCancelGroupJoin,
} from "@/domain/group/join-request";
import { Users, X, Calendar, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/shared/components/skeleton";
import ErrorDisplay from "@/shared/components/error-display";
import { EmptyState } from "@/shared/components/empty-state";

const MyGroupJoinSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const STATUS_MAP = {
  PENDING: "대기 중",
  ACCEPT: "수락됨",
  REJECT: "거절됨",
  CANCEL: "취소됨",
} as const;

const STATUS_STYLE = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACCEPT: "bg-green-100 text-green-800",
  REJECT: "bg-red-100 text-red-800",
  CANCEL: "bg-gray-100 text-gray-800",
} as const;

export const MyGroupJoinList = () => {
  const { data: joinRequests, isLoading, error, refetch } = useMyGroupJoinList();
  const cancelJoin = useCancelGroupJoin();
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const handleCancel = async (groupId: number, joinId: number) => {
    if (!window.confirm("가입 신청을 취소하시겠습니까?")) {
      return;
    }

    try {
      setCancelingId(joinId);
      await cancelJoin.mutateAsync({ groupId, joinId });
      window.alert("가입 신청이 취소되었습니다.");
    } catch {
      window.alert("가입 신청 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) return <MyGroupJoinSkeleton />;

  if (error) return <ErrorDisplay onRetry={refetch} />;

  if (!joinRequests || joinRequests.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-8 h-8" />}
        title="신청한 그룹이 없습니다"
      />
    );
  }

  return (
    <div className="space-y-4">
      {joinRequests.map((request) => (
        <Card key={request.groupJoinId}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                {request.groupName}
              </CardTitle>
              <span
                className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[request.status]}`}
              >
                {STATUS_MAP[request.status]}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {request.joinIntro && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p className="flex-1">{request.joinIntro}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>그룹 ID: {request.groupId}</span>
            </div>

            {request.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCancel(request.groupId, request.groupJoinId)}
                  disabled={cancelingId === request.groupJoinId}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  신청 취소
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
