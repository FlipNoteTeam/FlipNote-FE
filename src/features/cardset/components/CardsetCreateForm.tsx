import { GROUP_CATEGORY_MAP, type GroupCategory } from "@/domain/group/types";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Checkbox } from "@/shared/components/checkbox";
import { ErrorMessage, RequiredLabel } from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { uploadImage } from "@/shared/lib/upload-image";
import { Description } from "@radix-ui/react-dialog";
import type { ChangeEvent } from "react";
import { useController, useForm } from "react-hook-form";

export type CardsetCreateFormField = {
  name: string;
  publicVisible?: boolean;
  category: GroupCategory;
  hashtag: string[];
  imageRefId: number;
};

type Props = {
  onSubmit: (form: CardsetCreateFormField) => void;
  formId?: string;
};

const CardsetCreateForm = ({ onSubmit, formId = "cardset-form" }: Props) => {
  const { control, formState, register, setValue, handleSubmit } =
    useForm<CardsetCreateFormField>();

  const { errors } = formState;

  const { field: categoryField } = useController({
    name: "category",
    control,
    rules: {
      required: "하나 이상의 카테고리를 선택해주세요",
    },
  });

  const { field: publicVisibleField } = useController({
    name: "publicVisible",
  });

  return (
    <form id={formId} className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <RequiredLabel htmlFor="name">카드셋명</RequiredLabel>
        <Input
          id="name"
          {...register("name", { required: "카드셋명을 입력해주세요" })}
        />
        {!!errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
      </div>

      <div className="flex gap-2">
        <Checkbox
          id="publicVisible"
          checked={publicVisibleField.value}
          onCheckedChange={publicVisibleField.onChange}
        />
        <RequiredLabel htmlFor="publicVisible">공개여부</RequiredLabel>
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
        <Label htmlFor="image" className="mb-2">
          이미지
        </Label>
        <Input
          id="image"
          type="file"
          onChange={async (e: ChangeEvent<HTMLInputElement>) => {
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

export default CardsetCreateForm;
