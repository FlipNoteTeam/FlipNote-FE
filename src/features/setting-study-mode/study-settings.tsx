import { Button } from "@/shared/components/button";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { Checkbox } from "@/shared/components/checkbox";
import { Description, FormTitle } from "@/shared/components/form";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { ToggleGroup } from "@/shared/components/toggle-group";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenCheck, Brain, RotateCcw, Settings2Icon } from "lucide-react";
import { useController, useForm } from "react-hook-form";

type StudyMode = "memorize" | "test";
type OrderType = "random" | "order";
type NavigationType = "auto" | "manual";

type StudySettingsFormType = {
  mode: StudyMode;
  orderType: OrderType;
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

  const { field: orderTypeField } = useController({
    name: "orderType",
    control,
    rules: {
      required: "카드 순서를 선택해주세요",
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
    <div className="mt-8">
      <FormTitle>
        <Settings2Icon size="20" className="inline mr-1" />
        <span>학습 모드 선택</span>
      </FormTitle>

      <form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
        {/* 학습 모드 선택 */}
        <div className="space-y-3">
          <ButtonCheckboxGroupField
            name="mode"
            value={modeField.value}
            onChange={modeField.onChange}
            onBlur={modeField.onBlur}
            multiple={false}
          >
            <ButtonCheckbox value="memorize" className="grow">
              <Brain />
              <p className="font-bold">암기 모드</p>
              <p>반복 학습을 통해 단기 기억을 장기 기억으로 전환합니다.</p>
            </ButtonCheckbox>
            <ButtonCheckbox value="test" className="grow">
              <BookOpenCheck />
              <p>시험 모드</p>
              <p>실전처럼 테스트를 진행하고 성취도를 확인합니다.</p>
            </ButtonCheckbox>
          </ButtonCheckboxGroupField>
          {errors.mode && (
            <p className="text-sm text-red-500 mt-1">{errors.mode.message}</p>
          )}
        </div>

        {/* 세부 설정 */}
        <div className="bg-gray-50 p-6 rounded-lg relative space-y-6">
          <Button
            type="reset"
            className="absolute top-4 right-4 text-xs hover:text-blue-500 cursor-pointer p-0!"
            variant="ghost"
          >
            <RotateCcw />
            설정 초기화
          </Button>
          <Label className="text-base font-semibold">세부 설정</Label>

          {/* 반복 횟수 */}
          <fieldset className="space-y-3">
            <Label className="text-sm font-medium">반복 횟수</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={20}
                defaultValue={3}
                className="w-fit"
              />
              <span className="text-sm">회</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="loop-count" />
              <label htmlFor="loop-count" className="text-sm cursor-pointer">
                제한 없음
              </label>
            </div>
          </fieldset>

          {/* 카드 순서 */}
          <div className="w-full flex justify-stretch items-stretch gap-2">
            <fieldset className="space-y-3 grow">
              <Label className="text-sm font-medium">카드 순서</Label>
              <ToggleGroup
                name="orderType"
                value={orderTypeField.value}
                onChange={orderTypeField.onChange}
                onBlur={orderTypeField.onBlur}
                options={[
                  { value: "random", label: "랜덤 섞기" },
                  { value: "order", label: "순차 진행" },
                ]}
              />
            </fieldset>

            {/* 페이지 넘김 */}
            <fieldset className="space-y-3 grow">
              <Label className="text-sm font-medium">페이지 넘김</Label>
              <ToggleGroup
                name="navigationType"
                value={navigationTypeField.value}
                onChange={navigationTypeField.onChange}
                onBlur={navigationTypeField.onBlur}
                options={[
                  { value: "manual", label: "수동" },
                  { value: "auto", label: "자동 (타이머)" },
                ]}
              />
              {errors.navigationType && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.navigationType.message}
                </p>
              )}
            </fieldset>
          </div>
        </div>

        {/* 자동 넘김 시간 */}
        {navigationType === "auto" && (
          <div className="space-y-3 bg-blue-50 p-5 rounded-lg">
            <Label htmlFor="autoTimer" className="text-sm font-medium">
              자동 넘김 시간
            </Label>
            <Description>
              카드가 자동으로 넘어가는 시간을 설정해주세요
            </Description>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                id="autoTimer"
                className="w-24"
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

        {/* 학습 시작 버튼 */}
        <div className="flex gap-2 justify-end pt-6">
          <Button type="button" variant="outline" className="px-8">
            설정 저장
          </Button>
          <Button type="submit" className="text-white px-8">
            학습 시작
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudySettings;
