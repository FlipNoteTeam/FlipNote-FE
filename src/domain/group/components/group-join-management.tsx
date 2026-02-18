import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import {
  useGroupJoinList,
  useRespondGroupJoin,
} from "@/domain/group/hooks/use-group-join-management";
import { Check, X } from "lucide-react";
import type { ApiError } from "@/shared/apis";

type GroupJoinManagementProps = {
  groupId: number;
};

export const GroupJoinManagement = ({ groupId }: GroupJoinManagementProps) => {
  const { data: joinRequests = [], isLoading } = useGroupJoinList(groupId);
  const { mutate: respondJoin, isPending } = useRespondGroupJoin(groupId);

  const handleApprove = (joinId: number, nickname: string) => {
    if (!window.confirm(`${nickname}님의 가입 신청을 승인하시겠습니까?`)) {
      return;
    }
    respondJoin(
      { joinId, status: "ACCEPT" },
      {
        onSuccess: () => {
          window.alert("가입 신청을 승인했습니다.");
        },
        onError: (error: ApiError) => {
          window.alert(
            error?.response?.data?.message || "승인에 실패했습니다."
          );
        },
      }
    );
  };

  const handleReject = (joinId: number, nickname: string) => {
    if (!window.confirm(`${nickname}님의 가입 신청을 거절하시겠습니까?`)) {
      return;
    }
    respondJoin(
      { joinId, status: "REJECT" },
      {
        onSuccess: () => {
          window.alert("가입 신청을 거절했습니다.");
        },
        onError: (error: ApiError) => {
          window.alert(
            error?.response?.data?.message || "거절에 실패했습니다."
          );
        },
      }
    );
  };

  // PENDING 상태인 신청만 필터링
  const pendingRequests = joinRequests.filter(
    (request) => request.status === "PENDING"
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
      <div>
        <h2 className="text-2xl font-bold">가입 신청 관리</h2>
        <p className="text-gray-600 mt-1">
          대기 중인 가입 신청을 승인하거나 거절할 수 있습니다.
        </p>
      </div>

      {pendingRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              대기 중인 가입 신청이 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <Card key={request.groupJoinId}>
              <CardHeader>
                <CardTitle className="text-lg">{request.nickname}</CardTitle>
                {request.joinIntro && (
                  <CardDescription className="whitespace-pre-wrap">
                    {request.joinIntro}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleReject(request.groupJoinId, request.nickname)
                    }
                    disabled={isPending}
                  >
                    <X className="size-4 mr-1" />
                    거절
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() =>
                      handleApprove(request.groupJoinId, request.nickname)
                    }
                    disabled={isPending}
                  >
                    <Check className="size-4 mr-1" />
                    승인
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
