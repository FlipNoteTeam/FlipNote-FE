import CardsetCreateForm, {
  type CardsetCreateFormField,
} from "@/features/cardset/components/CardsetCreateForm";
import { cardSetApi, type CreateCardSetRequest } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";

const FORM_ID = "cardset-create-form";

type Props = {
  groupId: number;
  renderTrigger: ReactNode;
};

const CardsetCreateDialog = ({ groupId, renderTrigger }: Props) => {
  const { mutate } = useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: number;
      data: CreateCardSetRequest;
    }) => cardSetApi.createCardSet(groupId, data),
  });

  const handleSubmit = (form: CardsetCreateFormField) => {
    const data: CreateCardSetRequest = {
      name: form.name,
      publicVisible: form.publicVisible ?? true,
      hashtag: form.hashtag?.map((tag) => tag.name) || [],
      category: form.category,
      imageRefId: form.imageRefId ? String(form.imageRefId) : "",
    };

    mutate({ groupId, data });
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>카드셋 생성</DialogTitle>
        </DialogHeader>
        <CardsetCreateForm formId={FORM_ID} onSubmit={handleSubmit} />
        <Button form={FORM_ID} type="reset">
          초기화
        </Button>
        <Button form={FORM_ID} type="submit">
          생성
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CardsetCreateDialog;
