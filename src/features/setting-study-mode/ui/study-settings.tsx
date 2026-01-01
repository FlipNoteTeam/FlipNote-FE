import { Button } from "@/shared/components/button";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { FormTitle } from "@/shared/components/form";
import { Label } from "@/shared/components/label";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenCheck, Brain, RotateCcw, Settings2Icon } from "lucide-react";
import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studySettingsFormSchema,
  type StudySettingsFormField,
} from "../model/form.schema";
import { useEffect } from "react";
import { MemorizeSettingsForm } from "./memorize-settings-form";
import { TestSettingsForm } from "./test-settings-form";

type StudySettingsProps = {
  groupId: number;
  cardsetId: number;
  totalCardCount?: number;
};

// 모드별 기본값 상수
const MEMORIZE_MODE_DEFAULTS = {
  mode: "memorize" as const,
  isUnlimitedRepeat: false,
  repeatCount: 3,
  navigationType: "manual" as const,
  autoTimerSeconds: 5,
  orderType: "sequential" as const,
};

const getTestModeDefaults = (totalCardCount: number) => ({
  mode: "test" as const,
  isUnlimitedTime: false,
  testTimeMinutes: 30,
  orderType: "sequential" as const,
  testMode: "all" as const,
  totalCardCount,
  randomPickCount: undefined,
});

const StudySettings = ({
  groupId,
  cardsetId,
  totalCardCount = 0,
}: StudySettingsProps) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudySettingsFormField>({
    resolver: zodResolver(studySettingsFormSchema),
    defaultValues: MEMORIZE_MODE_DEFAULTS,
  });

  const { field: modeField } = useController({
    name: "mode",
    control,
  });

  const mode = useWatch({ control, name: "mode" });

  // 모드 변경 시 기본값 설정
  useEffect(() => {
    if (mode === "memorize") {
      reset(MEMORIZE_MODE_DEFAULTS);
    } else if (mode === "test") {
      reset(getTestModeDefaults(totalCardCount));
    }
  }, [mode, reset, totalCardCount]);

  const handleReset = () => {
    if (mode === "memorize") {
      reset(MEMORIZE_MODE_DEFAULTS);
    } else {
      reset(getTestModeDefaults(totalCardCount));
    }
  };

  const onSubmit = (data: StudySettingsFormField) => {
    // location.state로 학습 페이지로 데이터 전달
    navigate({
      to: "/groups/$groupId/cardsets/$cardsetId/study",
      params: { groupId: String(groupId), cardsetId: String(cardsetId) },
      state: data as unknown as true,
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
              <p className="font-bold">시험 모드</p>
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
            type="button"
            onClick={handleReset}
            className="absolute top-4 right-4 text-xs hover:text-blue-500 cursor-pointer p-0!"
            variant="ghost"
          >
            <RotateCcw />
            설정 초기화
          </Button>
          <Label className="text-base font-semibold">세부 설정</Label>

          {/* 암기 모드 설정 */}
          {mode === "memorize" && (
            <MemorizeSettingsForm
              control={control}
              register={register}
              errors={errors}
            />
          )}

          {/* 시험 모드 설정 */}
          {mode === "test" && (
            <TestSettingsForm
              control={control}
              register={register}
              errors={errors}
              totalCardCount={totalCardCount}
            />
          )}
        </div>

        {/* 학습 시작 버튼 */}
        <div className="flex gap-2 justify-end pt-6">
          <Button type="submit" className="text-white px-8">
            학습 시작
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudySettings;
