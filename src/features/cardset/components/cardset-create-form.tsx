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
import { useGroupMembers } from "@/domain/members/hooks/use-group-members";
import { MemberSelectDialog } from "@/domain/members/components/member-select-dialog";
import type { GroupMemberInfo } from "@/shared/apis";

import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useController, useFieldArray, useForm } from "react-hook-form";

const ROLE_LABEL_MAP: Record<GroupMemberInfo["role"], string> = {
  OWNER: "소유자",
  HEAD_MANAGER: "총괄 매니저",
  MANAGER: "매니저",
  STAFF: "스태프",
  MEMBER: "일반 회원",
};

export type CardsetCreateFormField = {
  name: string;
  publicVisible?: boolean;
  category: GroupCategory;
  hashtag: { name: string }[];
  imageRefId: number;
  managers: number[];
};

type Props = {
  groupId: number;
  onSubmit: (form: CardsetCreateFormField) => void;
  formId?: string;
};

const CardsetCreateForm = ({
  groupId,
  onSubmit,
  formId = "cardset-form",
}: Props) => {
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);

  const { data: members = [] } = useGroupMembers(groupId);

  const { control, formState, register, setValue, handleSubmit } =
    useForm<CardsetCreateFormField>({
      defaultValues: {
        hashtag: [],
        managers: [],
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

  const { field: managersField } = useController({
    name: "managers",
    control,
  });

  const { fields, append, remove } = useFieldArray<CardsetCreateFormField>({
    name: "hashtag",
    control,
  });

  const selectedManagerIds: number[] = managersField.value ?? [];
  const selectedManagers = members.filter((m) =>
    selectedManagerIds.includes(m.id)
  );
  const availableManagers = members
    .filter((m) => !selectedManagerIds.includes(m.id))
    .map((m) => ({ ...m, subtitle: ROLE_LABEL_MAP[m.role] }));

  const addManager = (member: GroupMemberInfo) => {
    managersField.onChange([...selectedManagerIds, member.id]);
    setManagerDialogOpen(false);
  };

  const removeManager = (id: number) => {
    managersField.onChange(selectedManagerIds.filter((mId) => mId !== id));
  };

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

      <div>
        <Label className="mb-1">카드셋 관리자</Label>
        <Description>관리자만 카드셋을 수정할 수 있습니다.</Description>
        {selectedManagers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedManagers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 bg-accent rounded-full pl-1.5 pr-2 py-1 text-sm"
              >
                <img
                  src={
                    m.profile ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.name}`
                  }
                  alt={m.name}
                  className="size-5 rounded-full object-cover"
                />
                <span>{m.name}</span>
                <button
                  type="button"
                  onClick={() => removeManager(m.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setManagerDialogOpen(true)}
        >
          <UserPlus className="size-4 mr-1.5" />
          관리자 추가
        </Button>
      </div>

      <MemberSelectDialog
        open={managerDialogOpen}
        onOpenChange={setManagerDialogOpen}
        members={availableManagers}
        onSelect={addManager}
        title="카드셋 관리자 추가"
        description="카드셋을 관리할 멤버를 선택하세요."
      />
    </form>
  );
};

export default CardsetCreateForm;
