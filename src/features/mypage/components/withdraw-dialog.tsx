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
import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";

const CONFIRM_TEXT = "탈퇴";

const WithdrawDialog = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const { isPending, mutate } = useMutation({
    mutationFn: userApi.withdrawUser,
    onSuccess: () => {
      setOpen(false);
      setValue("");
    },
    onError: (error) => {
      console.log("ERROR", error);
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
