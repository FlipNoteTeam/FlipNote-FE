import { Button } from "@/shared/components/button";
import {
  ButtonCheckbox,
  ButtonCheckboxGroupField,
} from "@/shared/components/button-checkbox";
import { FormTitle } from "@/shared/components/form";
import { Label } from "@/shared/components/label";
import { BookOpenCheck, Brain, RotateCcw, Settings2Icon } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { MemorizeSettingsForm } from "./memorize-settings-form";
import { TestSettingsForm } from "./test-settings-form";
import {
  useStudySettingsForm,
  getDefaultsByMode,
} from "../hooks/use-study-settings-form";

type StudySettingsProps = {
  groupId: number;
  cardsetId: number;
  totalCardCount?: number;
};

const StudySettings = ({
  groupId,
  cardsetId,
  totalCardCount = 0,
}: StudySettingsProps) => {
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    reset,
    errors,
    mode,
    modeField,
    settingsStorage,
  } = useStudySettingsForm({ cardsetId });

  const handleModeChange = (value: string | number | string[]) => {
    const newMode = value as "memorize" | "test";
    modeField.onChange(newMode);
    reset(getDefaultsByMode(newMode));
  };

  const handleReset = () => {
    reset(getDefaultsByMode(mode));
  };

  const onSubmit = handleSubmit((data) => {
    if (data.mode === "test" && data.testMode === "all") {
      delete data.randomPickCount;
    }

    settingsStorage.set(data);

    navigate({
      to: "/cardsets/learning",
      state: { groupId, cardsetId, settings: data },
    });
  });

  return (
    <div className="mt-8">
      <FormTitle>
        <Settings2Icon size="20" className="inline mr-1" />
        <span>학습 모드 선택</span>
      </FormTitle>

      <form className="space-y-10" onSubmit={onSubmit}>
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

          {mode === "memorize" && (
            <MemorizeSettingsForm control={control} errors={errors} />
          )}

          {mode === "test" && (
            <TestSettingsForm
              control={control}
              errors={errors}
              totalCardCount={totalCardCount}
            />
          )}
        </div>

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
