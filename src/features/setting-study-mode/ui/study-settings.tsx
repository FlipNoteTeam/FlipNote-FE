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
  totalCardCount: totalCardCount || 10, // 0이면 기본값 10
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
    shouldUnregister: true, // 조건부 필드가 언마운트되면 자동으로 등록 해제
  });

  const { field: modeField } = useController({
    name: "mode",
    control,
  });

  const mode = useWatch({ control, name: "mode" });

  // 모드 변경 핸들러
  const handleModeChange = (value: string | number | string[]) => {
    const newMode = value as "memorize" | "test";
    modeField.onChange(newMode);

    // 모드 변경 시 즉시 해당 모드의 기본값으로 리셋
    if (newMode === "memorize") {
      reset(MEMORIZE_MODE_DEFAULTS);
    } else if (newMode === "test") {
      reset(getTestModeDefaults(totalCardCount));
    }
  };

  const handleReset = () => {
    if (mode === "memorize") {
      reset(MEMORIZE_MODE_DEFAULTS);
    } else {
      reset(getTestModeDefaults(totalCardCount));
    }
  };

  const onSubmit = (data: StudySettingsFormField) => {
    // location.state로 학습 페이지로 데이터 전달

    // testMode가 'all'이면 randomPickCount 제거
    const cleanedData = { ...data };
    if (cleanedData.mode === "test" && cleanedData.testMode === "all") {
      delete cleanedData.randomPickCount;
    }

    const studyOption = {
      groupId,
      cardsetId,
      ...cleanedData,
    };

    console.log("Submitting study options:", studyOption);

    navigate({
      to: "/cardsets/learning",
      state: studyOption,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
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
            onChange={handleModeChange}
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

        {/* 디버깅: 폼 에러 표시 */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="font-semibold text-red-700 mb-2">폼 검증 에러:</p>
            <pre className="text-xs text-red-600">
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
        )}

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
