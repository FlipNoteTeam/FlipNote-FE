import { useState } from "react";
import { Button } from "@/shared/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import {
  useOutgoingInvitations,
  useCreateGroupInvitation,
  useDeleteGroupInvitation,
} from "@/domain/group/hooks/useGroupInvitation";
import { UserPlus, X } from "lucide-react";

type GroupInvitationManagementProps = {
  groupId: number;
};

export const GroupInvitationManagement = ({
  groupId,
}: GroupInvitationManagementProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const { data: invitations = [], isLoading } = useOutgoingInvitations(groupId);
  const { mutate: createInvitation, isPending: isCreating } =
    useCreateGroupInvitation(groupId);
  const { mutate: deleteInvitation, isPending: isDeleting } =
    useDeleteGroupInvitation(groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      window.alert("이메일을 입력해주세요.");
      return;
    }

    createInvitation(
      { email: email.trim() },
      {
        onSuccess: () => {
          window.alert("초대를 보냈습니다.");
          setEmail("");
          setOpen(false);
        },
        onError: (error: any) => {
          window.alert(
            error?.response?.data?.message || "초대 전송에 실패했습니다."
          );
        },
      }
    );
  };

  const handleCancelInvitation = (invitationId: number, nickname: string) => {
    if (!window.confirm(`${nickname}님에게 보낸 초대를 취소하시겠습니까?`)) {
      return;
    }

    deleteInvitation(invitationId, {
      onSuccess: () => {
        window.alert("초대를 취소했습니다.");
      },
      onError: (error: any) => {
        window.alert(
          error?.response?.data?.message || "초대 취소에 실패했습니다."
        );
      },
    });
  };

  // PENDING 상태인 초대만 필터링
  const pendingInvitations = invitations.filter(
    (invitation) => invitation.status === "PENDING"
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="size-4 mr-2" />
              초대하기
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>그룹 초대</DialogTitle>
                <DialogDescription>
                  초대할 사용자의 이메일을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  disabled={isCreating}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isCreating}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "전송 중..." : "초대 보내기"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {pendingInvitations.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-gray-500">
              보낸 초대가 없습니다.
            </p>
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
                        invitation.inviteeNickname || invitation.inviteeEmail
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
