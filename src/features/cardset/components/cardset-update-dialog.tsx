import type { GroupCategory } from "@/domain/group/types";
import CardsetUpdateForm, {
  type CardsetUpdateFormField,
} from "@/features/cardset/components/cardset-update-form";
import {
  cardSetApi,
  type CardSetUpdateRequest,
  type CardSetDetailResponse,
} from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

const FORM_ID = "cardset-update-form";

type Props = {
  groupId: number;
  cardsetId: number;
  cardset: CardSetDetailResponse;
  renderTrigger: ReactNode;
};

const CardsetUpdateDialog = ({
  groupId,
  cardsetId,
  cardset,
  renderTrigger,
}: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: ({
      groupId,
      cardsetId,
      data,
    }: {
      groupId: number;
      cardsetId: number;
      data: CardSetUpdateRequest;
    }) => cardSetApi.updateCardSet(groupId, cardsetId, data),
    onSuccess: () => {
      // 카드셋 상세 정보 다시 불러오기
      queryClient.invalidateQueries({
        queryKey: ["cardset", groupId, cardsetId],
      });
      setOpen(false);
      window.alert("카드셋이 수정되었습니다.");
    },
    onError: () => {
      window.alert("카드셋 수정에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleSubmit = (form: CardsetUpdateFormField) => {
    const data: CardSetUpdateRequest = {
      name: form.name,
      publicVisible: form.publicVisible ?? true,
      hashtag: form.hashtag?.map((tag) => tag.name) || [],
      category: form.category,
      image: form.imageRefId ? String(form.imageRefId) : undefined,
    };

    mutate({ groupId, cardsetId, data });
  };

  // 기존 카드셋 데이터를 폼 초기값으로 변환
  const defaultValues: Partial<CardsetUpdateFormField> = {
    name: cardset.name,
    publicVisible: cardset.publicVisible,
    category: cardset.category as unknown as GroupCategory,
    hashtag: cardset.hashtag
      ? cardset.hashtag.split(",").map((tag) => ({ name: tag.trim() }))
      : [],
    imageRefId: cardset.imageRefId,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{renderTrigger}</DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>카드셋 수정</DialogTitle>
        </DialogHeader>
        <CardsetUpdateForm
          formId={FORM_ID}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
        />
        <div className="flex gap-2 justify-end">
          <Button
            form={FORM_ID}
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            취소
          </Button>
          <Button form={FORM_ID} type="submit">
            수정
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardsetUpdateDialog;
