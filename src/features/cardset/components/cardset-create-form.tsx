import { GROUP_CATEGORY_MAP, type GroupCategory } from "@/domain/group/types";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Button } from "@/shared/components/button";
import { Checkbox } from "@/shared/components/checkbox";
import {
  Description,
  ErrorMessage,
  RequiredLabel,
} from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { uploadImage } from "@/shared/lib/upload-image";

import { X } from "lucide-react";
import type { ChangeEvent } from "react";
import { useController, useFieldArray, useForm } from "react-hook-form";

export type CardsetCreateFormField = {
  name: string;
  publicVisible?: boolean;
  category: GroupCategory;
  hashtag: { name: string }[];
  imageRefId: number;
};

type Props = {
  onSubmit: (form: CardsetCreateFormField) => void;
  formId?: string;
};

const CardsetCreateForm = ({ onSubmit, formId = "cardset-form" }: Props) => {
  const { control, formState, register, setValue, handleSubmit } =
    useForm<CardsetCreateFormField>({
      defaultValues: {
        hashtag: [],
      },
    });

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
    control,
  });

  const { fields, append, remove } = useFieldArray<CardsetCreateFormField>({
    name: "hashtag",
    control,
  });

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    try {
      const imageRefId = await uploadImage({ file, type: "GROUP" });
      if (imageRefId) setValue("imageRefId", imageRefId);
    } catch (e) {
      console.error(e);
      /** @todo 커스텀 에러 다이얼로그로 변경 */
      window.alert("이미지 업로드를 실패했습니다. 재시도해주세요.");
    }
  };

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
        <Input id="image" type="file" onChange={handleChangeImage} />
      </div>

      <div>
        <Label className="mb-2">해시태그</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                {...register(`hashtag.${index}.name` as const, {
                  required: "해시태그를 입력해주세요",
                })}
                placeholder="해시태그 입력"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: "" })}
            className="w-full"
          >
            해시태그 추가
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CardsetCreateForm;
