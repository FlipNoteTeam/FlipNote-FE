import { userApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  DialogClose,
  DialogDescription,
  DialogHeader,
} from "@/shared/components/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { Input } from "@/shared/components/input";
import useAuthStore from "@/stores/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";

const CONFIRM_TEXT = "탈퇴";

const WithdrawDialog = () => {
  const navigate = useNavigate();

  const { clearUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const { isPending, mutate } = useMutation({
    mutationFn: userApi.withdrawUser,
    onSuccess: () => {
      clearUser();
      setOpen(false);
      setValue("");

      navigate({ to: "/" });
    },
    onError: (error) => {
      console.log("ERROR", error);

      window.alert("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = async () => {
    mutate();
  };

  const activeConfirmButton = value === CONFIRM_TEXT;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">회원탈퇴하기</Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>회원탈퇴</DialogTitle>
          <DialogDescription>
            회원탈퇴를 위해서는 아래에 '{CONFIRM_TEXT}'를 입력해주세요
          </DialogDescription>
        </DialogHeader>

        <Input
          placeholder={CONFIRM_TEXT}
          value={value}
          onChange={handleChangeInput}
        />

        <div className="text-right space-x-2">
          <DialogClose asChild>
            <Button type="reset" variant={"outline"} disabled={isPending}>
              취소
            </Button>
          </DialogClose>

          <Button
            type="submit"
            disabled={!activeConfirmButton || isPending}
            onClick={handleSubmit}
          >
            탈퇴
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
