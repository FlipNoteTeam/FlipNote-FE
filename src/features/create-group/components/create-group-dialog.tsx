import CreateGroupForm from "./create-group-form";
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
import { type CreateGroupFormField } from "../schemas/form.schema";
import { createGroupRequestSchema } from "../schemas/request.schema";

const FORM_ID = "group-create-form";

type Props = {
  renderTrigger: ReactNode;
};

const CreateGroupDialog = ({ renderTrigger }: Props) => {
  const { mutate } = useMutation({
    mutationFn: (data: GroupCreateRequest) => groupApi.createGroup(data),
  });

  const handleSubmit = (form: CreateGroupFormField) => {
    const requestData = {
      name: form.name,
      category: form.category,
      description: form.description ?? "",
      joinPolicy: form.applicationRequired ? "APPROVAL" : "OPEN",
      visibility: form.publicVisible ? "PUBLIC" : "PRIVATE",
      maxMember: form.maxMember,
      imageRefId: form.imageRefId ? form.imageRefId : undefined,
    };

    // API 요청 직전 최종 검증
    const validatedData = createGroupRequestSchema.parse(requestData);

    mutate(validatedData);
  };

  return (
    <Dialog>
      <DialogTrigger>{renderTrigger}</DialogTrigger>
      <DialogContent
        className="max-w-2xl p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-6">
          <DialogTitle>그룹 생성</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] p-5 overflow-y-auto space-y-4">
          <CreateGroupForm formId={FORM_ID} onSubmit={handleSubmit} />
          <div className="flex gap-2 justify-end">
            <Button form={FORM_ID} type="reset" variant="outline">
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

export default CreateGroupDialog;
