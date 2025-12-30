import CreateGroupForm from "@/features/create-group/components/CreateGroupForm";
import { type CreateGroupFormField } from "@/features/create-group/schemas/form.schema";
import { createGroupRequestSchema } from "@/features/create-group/schemas/request.schema";
import { groupApi } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { FormTitle } from "@/shared/components/form";

import { useMutation } from "@tanstack/react-query";

const FORM_ID = "group-create-form";

const CreateGroup = () => {
  const { mutate } = useMutation({
    mutationFn: groupApi.createGroup,
  });

  const onSubmit = (form: CreateGroupFormField) => {
    const requestData = {
      name: form.name,
      category: form.category,
      description: form.description ?? "",
      applicationRequired: form.applicationRequired,
      publicVisible: form.publicVisible,
      maxMember: form.maxMember,
      image: form.imageRefId ? String(form.imageRefId) : undefined,
    };

    // API 요청 직전 최종 검증
    const validatedData = createGroupRequestSchema.parse(requestData);

    mutate(validatedData);
  };

  return (
    <Card className="py-8 px-4 gap-0">
      <CardHeader>
        <FormTitle>그룹 생성</FormTitle>
      </CardHeader>
      <CardContent>
        <CreateGroupForm formId={FORM_ID} onSubmit={onSubmit} />
        <div className="flex gap-2 justify-center mt-4">
          <Button
            form={FORM_ID}
            type="reset"
            className="bg-white border border-gray-500 text-gray-500"
          >
            초기화
          </Button>
          <Button form={FORM_ID} type="submit" className="bg-black text-white">
            생성하기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateGroup;
