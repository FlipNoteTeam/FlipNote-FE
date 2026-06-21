import { GroupJoinDialog } from "@/domain/group/components/group-join-dialog";
import type { ApiError } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import BaseLayout from "@/shared/layouts/base-layout";
import useAuthStore from "@/stores/use-auth-store";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";

type Props = {
  error: ApiError | null;
  groupId: number;
};

export const GroupDetailErrorView = ({ error, groupId }: Props) => {
  const navigate = useNavigate();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const errorCode = error?.response?.data?.["code"] as string | undefined;
  const errorMessage = error?.response?.data?.message;

  if (errorCode === "GROUP_JOIN_001") {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6 text-center space-y-4">
          <h2 className="text-2xl font-bold">가입이 필요한 그룹입니다</h2>
          <p className="text-muted-foreground">
            이 그룹의 콘텐츠를 보려면 가입이 필요합니다.
          </p>
          {user ? (
            <GroupJoinDialog groupId={groupId} groupName="이 그룹">
              <Button>
                <UserPlus className="size-4 mr-2" />
                가입 신청
              </Button>
            </GroupJoinDialog>
          ) : (
            <Button
              onClick={() =>
                navigate({
                  to: "/auth/login",
                  search: { redirect: window.location.href },
                })
              }
            >
              로그인하고 가입 신청
            </Button>
          )}
          <div>
            <Button onClick={() => router.history.go(-1)} variant="outline">
              돌아가기
            </Button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (error) {
    return (
      <BaseLayout>
        <div className="mx-auto max-w-6xl p-6 text-center space-y-3">
          {errorCode && (
            <p className="text-sm font-mono text-muted-foreground">{errorCode}</p>
          )}
          <p className="text-red-500">{errorMessage || "오류가 발생했습니다."}</p>
          <Button onClick={() => window.history.back()} variant="outline">
            돌아가기
          </Button>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="mx-auto max-w-6xl p-6">
        <p className="text-center text-muted-foreground">그룹을 찾을 수 없습니다.</p>
      </div>
    </BaseLayout>
  );
};
