import CardsetCreateForm, {
  type CardsetCreateFormField,
} from "@/features/cardset/components/cardset-create-form";
import { cardSetApi, type CreateCardSetRequest } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import useAuthStore from "@/stores/use-auth-store";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";

const FORM_ID = "cardset-create-form";

type Props = {
  groupId: number;
  renderTrigger: ReactNode;
};

const CardsetCreateDialog = ({ groupId, renderTrigger }: Props) => {
  const user = useAuthStore((state) => state.user);
  const { mutate } = useMutation({
    mutationFn: (data: CreateCardSetRequest) => cardSetApi.createCardSet(data),
  });

  const handleSubmit = (form: CardsetCreateFormField) => {
    const data: CreateCardSetRequest = {
      name: form.name,
      groupId,
      visibility: (form.publicVisible ?? true) ? "PUBLIC" : "PRIVATE",
      hashtag: form.hashtag?.map((tag) => `#${tag.name}`).join(" ") ?? "",
      category: form.category,
      imageRefId: form.imageRefId ? form.imageRefId : undefined,
      cardCount: 10,
      managerIds: user?.userId
        ? [user.userId, ...form.managers.filter((id) => id !== user.userId)]
        : [...form.managers],
    };

    mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>카드셋 생성</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto mb-4 space-y-4 ">
          <CardsetCreateForm
            groupId={groupId}
            formId={FORM_ID}
            onSubmit={handleSubmit}
          />
          <div className="flex justify-end gap-2">
            <Button form={FORM_ID} variant="outline" type="reset">
              초기화
            </Button>
            <Button form={FORM_ID} type="submit">
              생성
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardsetCreateDialog;
