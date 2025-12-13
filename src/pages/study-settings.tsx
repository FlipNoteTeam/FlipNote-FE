import { Button } from "@/shared/components/button";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Card, CardContent, CardHeader } from "@/shared/components/card";
import {
  Description,
  FormTitle,
  RequiredLabel,
} from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { useNavigate } from "@tanstack/react-router";
import { useController, useForm } from "react-hook-form";

type StudyMode = "memorize" | "test";
type NavigationType = "auto" | "manual";

type StudySettingsFormType = {
  mode: StudyMode;
  navigationType: NavigationType;
  autoTimer?: number;
};

type StudySettingsProps = {
  groupId: number;
  cardsetId: number;
};

const StudySettings = ({ groupId, cardsetId }: StudySettingsProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<StudySettingsFormType>({
    defaultValues: {
      mode: "memorize",
      navigationType: "manual",
      autoTimer: 5,
    },
  });

  const { field: modeField } = useController({
    name: "mode",
    control,
    rules: {
      required: "학습 모드를 선택해주세요",
    },
  });

  const { field: navigationTypeField } = useController({
    name: "navigationType",
    control,
    rules: {
      required: "페이지 넘김 방식을 선택해주세요",
    },
  });

  const navigationType = watch("navigationType");

  const onSubmit = (data: StudySettingsFormType) => {
    // TODO: 실제 API 연동 시 사용할 함수
    // const studyData = convertToStudyStartRequest(data);

    // 학습 시작 페이지로 이동
    navigate({
      to: "/groups/$groupId/cardsets/$cardsetId/study",
      params: { groupId: String(groupId), cardsetId: String(cardsetId) },
      search: {
        mode: data.mode,
        navigationType: data.navigationType,
        autoTimer: data.autoTimer,
      },
    });
  };

  return (
    <Card className="py-8 px-4 gap-0">
      <CardHeader>
        <FormTitle>학습 설정</FormTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <RequiredLabel>학습 모드</RequiredLabel>
            <Description>원하는 학습 방식을 선택해주세요</Description>
            <ButtonCheckboxGroupField
              name="mode"
              value={modeField.value}
              onChange={modeField.onChange}
              onBlur={modeField.onBlur}
              multiple={false}
            >
              <ButtonCheckbox value="memorize">암기 모드</ButtonCheckbox>
              <ButtonCheckbox value="test">시험 모드</ButtonCheckbox>
            </ButtonCheckboxGroupField>
            {errors.mode && (
              <p className="text-sm text-red-500 mt-1">{errors.mode.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel>페이지 넘김</RequiredLabel>
            <Description>카드를 넘기는 방식을 선택해주세요</Description>
            <ButtonCheckboxGroupField
              name="navigationType"
              value={navigationTypeField.value}
              onChange={navigationTypeField.onChange}
              onBlur={navigationTypeField.onBlur}
              multiple={false}
            >
              <ButtonCheckbox value="manual">수동</ButtonCheckbox>
              <ButtonCheckbox value="auto">자동 (타이머)</ButtonCheckbox>
            </ButtonCheckboxGroupField>
            {errors.navigationType && (
              <p className="text-sm text-red-500 mt-1">
                {errors.navigationType.message}
              </p>
            )}
          </div>

          {navigationType === "auto" && (
            <div>
              <Label htmlFor="autoTimer" className="mb-2">
                자동 넘김 시간
              </Label>
              <Description>
                카드가 자동으로 넘어가는 시간을 설정해주세요
              </Description>
              <div className="flex items-end gap-2">
                <Input
                  type="number"
                  id="autoTimer"
                  className="w-20"
                  {...register("autoTimer", {
                    min: { value: 1, message: "최소 1초 이상이어야 합니다." },
                    max: {
                      value: 60,
                      message: "최대 60초까지 설정 가능합니다.",
                    },
                    valueAsNumber: true,
                  })}
                />
                <span className="text-sm">초</span>
              </div>
              {errors.autoTimer && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.autoTimer.message}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-center pt-4">
            <Button
              type="button"
              className="bg-white border border-gray-500 text-gray-500"
              onClick={() =>
                navigate({
                  to: `/groups/$groupId/cardsets/$cardsetId`,
                  params: {
                    groupId: String(groupId),
                    cardsetId: String(cardsetId),
                  },
                })
              }
            >
              취소
            </Button>
            <Button type="submit" className="bg-black text-white">
              학습 시작
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudySettings;
