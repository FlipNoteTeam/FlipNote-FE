import { GROUP_CATEGORY_MAP } from "@/domain/group";
import { groupApi, type GroupCategory } from "@/shared/apis";
import { Button } from "@/shared/components/button";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import { Checkbox } from "@/shared/components/checkbox";
import {
  Description,
  ErrorMessage,
  FormTitle,
  RequiredLabel,
} from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Textarea } from "@/shared/components/textarea";

import { useMutation } from "@tanstack/react-query";

import { useController, useForm } from "react-hook-form";

type FormType = {
  name: string;
  category: GroupCategory;
  description: string;
  applicationRequired: boolean;
  publicVisible: boolean;
  maxMember: number;
  image: string;
};

const CreateGroup = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormType>();

  const { mutate } = useMutation({
    mutationFn: groupApi.createGroup,
  });

  const { field: categoryField } = useController({
    name: "category",
    control,
    rules: {
      required: "하나 이상의 카테고리를 선택해주세요",
    },
  });

  const { field: applicationRequiredField } = useController({
    name: "applicationRequired",
    defaultValue: false,
    control,
  });

  const { field: publicVisibleField } = useController({
    name: "publicVisible",
    defaultValue: true,
    control,
  });

  const onSubmit = (data: FormType) => {
    mutate(data);
  };

  return (
    <Card className="py-8 px-4 gap-0">
      <CardHeader>
        <FormTitle>그룹 생성</FormTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <RequiredLabel htmlFor="name">그룹명</RequiredLabel>
            <Input
              id="name"
              {...register("name", { required: "그룹명을 입력해주세요" })}
            />
            {!!errors.name && (
              <ErrorMessage>{errors.name.message}</ErrorMessage>
            )}
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
            </ButtonCheckboxGroupField>{" "}
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
            <Input id="image" type="file" />
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              type="button"
              className="bg-white border border-gray-500 text-gray-500"
            >
              초기화
            </Button>
            <Button type="submit" className="bg-black text-white">
              생성하기
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateGroup;
