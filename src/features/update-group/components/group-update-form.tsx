import { toast } from "sonner";
import { GROUP_CATEGORY_MAP } from "@/domain/group/types";
import { Button } from "@/shared/components/button";
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
import {
  updateGroupFormSchema,
  type UpdateGroupFormField,
} from "@/features/update-group/schemas/form.schema";

import { useController, useForm } from "react-hook-form";

export type { UpdateGroupFormField };

type Props = {
  onSubmit: (form: UpdateGroupFormField) => void;
  formId?: string;
  defaultValues?: Partial<UpdateGroupFormField>;
  submitButtonText?: string;
  showResetButton?: boolean;
};

const GroupUpdateForm = ({
  onSubmit,
  formId = "group-form",
  defaultValues,
  submitButtonText = "생성하기",
  showResetButton = true,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<UpdateGroupFormField>({
    resolver: zodResolver(updateGroupFormSchema),
    defaultValues: {
      applicationRequired: false,
      publicVisible: true,
      ...defaultValues,
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

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <RequiredLabel htmlFor="name">그룹명</RequiredLabel>
        <Input
          id="name"
          {...register("name")}
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
            {...register("maxMember", { valueAsNumber: true })}
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
            try {
              const imageRefId = await uploadImage({ file, type: "GROUP" });
              if (imageRefId) setValue("imageRefId", imageRefId);
            } catch (e) {
              console.error(e);
              toast.error("이미지 업로드를 실패했습니다. 재시도해주세요.");
            }
          }}
        />
      </div>
      <div className="flex gap-2 justify-center">
        {showResetButton && (
          <Button
            type="button"
            className="bg-white border border-gray-500 text-gray-500"
            onClick={() => reset()}
          >
            초기화
          </Button>
        )}
        <Button type="submit" className="bg-black text-white">
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default GroupUpdateForm;
