import CreateGroupForm, {
  type CreateGroupFormField,
} from "@/domain/group/components/CreateGroupForm";
import { groupApi, type GroupCreateRequest } from "@/shared/apis";
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

const FORM_ID = "group-create-form";

type Props = {
  renderTrigger: ReactNode;
};

const CreateGroupDialog = ({ renderTrigger }: Props) => {
  const { mutate } = useMutation({
    mutationFn: (data: GroupCreateRequest) => groupApi.createGroup(data),
  });

  const handleSubmit = (form: CreateGroupFormField) => {
    const data: GroupCreateRequest = {
      name: form.name,
      category: form.category,
      description: form.description,
      applicationRequired: form.applicationRequired,
      publicVisible: form.publicVisible,
      maxMember: form.maxMember,
      image: form.imageRefId ? String(form.imageRefId) : undefined,
    };

    mutate(data);
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>그룹 생성</DialogTitle>
        </DialogHeader>
        <CreateGroupForm formId={FORM_ID} onSubmit={handleSubmit} />
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

export default CreateGroupDialog;
