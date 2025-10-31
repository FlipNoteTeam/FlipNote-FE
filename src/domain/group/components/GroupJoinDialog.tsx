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
import { Textarea } from "@/shared/components/textarea";
import { Label } from "@/shared/components/label";
import { useGroupJoin } from "@/domain/group/hooks/useGroupJoin";
import { useToast } from "@/shared/hooks/use-toast";

type GroupJoinDialogProps = {
  groupId: number;
  groupName: string;
  children: React.ReactNode;
};

export const GroupJoinDialog = ({
  groupId,
  groupName,
  children,
}: GroupJoinDialogProps) => {
  const [open, setOpen] = useState(false);
  const [joinIntro, setJoinIntro] = useState("");
  const { mutate: joinGroup, isPending } = useGroupJoin();
  const { toast } = useToast();

  const handleSubmit = () => {
    joinGroup(
      {
        groupId,
        data: { joinIntro: joinIntro || undefined },
      },
      {
        onSuccess: () => {
          toast({
            title: "가입 신청 완료",
            description: `${groupName} 그룹에 가입 신청했습니다.`,
          });
          setOpen(false);
          setJoinIntro("");
        },
        onError: (error: any) => {
          toast({
            title: "가입 신청 실패",
            description: error?.response?.data?.message || "가입 신청에 실패했습니다.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>그룹 가입 신청</DialogTitle>
          <DialogDescription>
            {groupName} 그룹에 가입을 신청합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="joinIntro">가입 인사 (선택)</Label>
            <Textarea
              id="joinIntro"
              placeholder="그룹장에게 전달할 가입 인사를 작성해주세요."
              value={joinIntro}
              onChange={(e) => setJoinIntro(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            취소
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "신청 중..." : "가입 신청"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
