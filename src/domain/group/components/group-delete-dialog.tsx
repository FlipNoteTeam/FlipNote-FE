import { groupApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type Props = {
  groupId: number;
};

const GroupDeleteDialog = ({ groupId }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => groupApi.deleteGroup(groupId),
    onSuccess: () => {
      navigate({ to: "/group-list" });
    },
    onError: () => {
      window.alert("그룹 삭제에 실패했습니다. 다시 시도해주세요.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-red-700">
          그룹 삭제
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>그룹 삭제</DialogTitle>
          <DialogDescription>
            정말로 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            아니오
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? "삭제 중..." : "예"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDeleteDialog;
