import CardsetCreateForm, {
  type CardsetCreateFormField,
} from "@/features/cardset/components/CardsetCreateForm";
import { cardSetApi, type CreateCardSetRequest } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { Dialog, DialogHeader } from "@/shared/components/dialog";
import {
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";

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
      hashtag: form.hashtag,
      category: form.category,
    };

    mutate({ groupId, data });
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>카드셋 생성</DialogTitle>
          {/* <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription> */}
        </DialogHeader>
        <CardsetCreateForm formId="cardset-create" onSubmit={handleSubmit} />
        <Button form="cardset-create" type="reset">
          초기화
        </Button>
        <Button form="cardset-create" type="submit">
          생성
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CardsetCreateDialog;
