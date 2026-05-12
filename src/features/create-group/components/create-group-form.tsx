import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Checkbox } from "@/shared/components/checkbox";
import {
  Description,
  ErrorMessage,
  RequiredLabel,
} from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";
import { uploadImage } from "@/shared/lib/upload-image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useController, useForm, useWatch } from "react-hook-form";
import {
  groupCreateFormSchema,
  type GroupFormField,
} from "@/domain/group/schemas/form.schema";

type Props = {
  onSubmit: (form: GroupFormField) => void;
  formId?: string;
};

const CreateGroupForm = ({ onSubmit, formId = "group-form" }: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<GroupFormField>({
    resolver: zodResolver(groupCreateFormSchema),
    defaultValues: {
      applicationRequired: false,
      publicVisible: true,
    },
  });

  const { field: categoryField } = useController({
    name: "category",
    control,
  });

  const { field: applicationRequiredField } = useController({
    name: "applicationRequired",
    control,
  });

  const { field: publicVisibleField } = useController({
    name: "publicVisible",
    control,
  });

  const isPublicVisible = useWatch({ control, name: "publicVisible" });

  useEffect(() => {
    if (!isPublicVisible) {
      setValue("applicationRequired", true);
    }
  }, [isPublicVisible, setValue]);

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <RequiredLabel htmlFor="name">그룹명</RequiredLabel>
        <Input
          id="name"
          {...register("name", { required: "그룹명을 입력해주세요" })}
        />
        {!!errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
      </div>
      <div>
        <RequiredLabel>카테고리</RequiredLabel>
        <Description>하나 이상의 카테고리를 선택해주세요</Description>
        <ButtonCheckboxGroupField
          name="category"
          value={categoryField.value}
          onChange={categoryField.onChange}
          onBlur={categoryField.onBlur}
        >
          {Object.entries(GROUP_CATEGORY_MAP).map(([value, name]) => (
            <ButtonCheckbox key={value} value={value}>
              {name}
            </ButtonCheckbox>
          ))}
        </ButtonCheckboxGroupField>
        {!!errors.category && (
          <ErrorMessage>{errors.category.message}</ErrorMessage>
        )}
      </div>
      <div>
        <Label className="mb-2" htmlFor="description">
          그룹 설명
        </Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div className="flex gap-2">
        <Checkbox
          id="applicationRequired"
          checked={applicationRequiredField.value}
          onCheckedChange={applicationRequiredField.onChange}
          disabled={!isPublicVisible}
        />
        <Label htmlFor="applicationRequired">가입신청 여부</Label>
      </div>
      <div className="flex gap-2">
        <Checkbox
          id="publicVisible"
          checked={publicVisibleField.value}
          onCheckedChange={publicVisibleField.onChange}
        />
        <Label htmlFor="publicVisible">공개</Label>
      </div>
      <div>
        <RequiredLabel htmlFor="maxMember" className="mb-2">
          최대 인원
        </RequiredLabel>
        <div className="flex items-end">
          <Input
            type="number"
            id="maxMember"
            className="w-20 inline"
            {...register("maxMember", {
              min: { value: 1, message: "최소 인원은 1명입니다." },
              max: { value: 100, message: "최대 인원은 100명입니다." },
              valueAsNumber: true,
            })}
          />
          <span className="text-sm ml-2 ">명</span>
        </div>
        {errors.maxMember && (
          <ErrorMessage>{errors.maxMember.message}</ErrorMessage>
        )}
      </div>
      <div>
        <Label htmlFor="image" className="mb-2">
          이미지
        </Label>
        <Input
          id="image"
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const imageRefId = await uploadImage({ file, type: "GROUP" });

            if (imageRefId) setValue("imageRefId", imageRefId);
          }}
        />
      </div>
    </form>
  );
};

export default CreateGroupForm;
