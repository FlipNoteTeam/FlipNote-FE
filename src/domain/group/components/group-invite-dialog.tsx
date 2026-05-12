import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { useCreateGroupInvitation } from "@/domain/group/hooks/use-group-invitation";

type GroupInviteDialogProps = {
  groupId: number;
  children: React.ReactNode;
};

export const GroupInviteDialog = ({
  groupId,
  children,
}: GroupInviteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  const { mutate: createInvitation, isPending } =
    useCreateGroupInvitation(groupId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    createInvitation(
      { email: email.trim() },
      {
        onSuccess: () => {
          toast.success("초대를 보냈습니다.");
          setEmail("");
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>그룹 초대</DialogTitle>
            <DialogDescription>
              초대할 사용자의 이메일을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">이메일</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "전송 중..." : "초대 보내기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
