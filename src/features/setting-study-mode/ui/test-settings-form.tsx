import { Checkbox } from "@/shared/components/checkbox";
import { Description } from "@/shared/components/form";
import { Label } from "@/shared/components/label";
import { NumberInput } from "@/shared/components/number-input";
import { ToggleGroup } from "@/shared/components/toggle-group";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";
import type { StudySettingsFormField } from "../model/form.schema";

type TestSettingsFormProps = {
  control: Control<StudySettingsFormField>;
  register: UseFormRegister<StudySettingsFormField>;
  errors: FieldErrors<StudySettingsFormField>;
  totalCardCount: number;
};

export function TestSettingsForm({
  control,
  register,
  errors,
  totalCardCount,
}: TestSettingsFormProps) {
  const { field: orderTypeField } = useController({
    name: "orderType",
    control,
  });

  const { field: testModeField } = useController({
    name: "testMode",
    control,
  });

  const { field: testTimeMinutesField } = useController({
    name: "testTimeMinutes",
    control,
  });

  const isUnlimitedTime = useWatch({ control, name: "isUnlimitedTime" });
  const testMode = useWatch({ control, name: "testMode" });

  return (
    <>
      {/* 시험 시간 */}
      <fieldset className="space-y-3">
        <Label className="text-sm font-medium">시험 시간</Label>
        <div className="flex items-center gap-2">
          <NumberInput
            className="w-24"
            disabled={isUnlimitedTime}
            value={testTimeMinutesField.value}
            onChange={(e) => testTimeMinutesField.onChange(parseInt(e.target.value) || 1)}
            onBlur={testTimeMinutesField.onBlur}
            min={1}
            max={180}
          />
          <span className="text-sm">분</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="unlimited-time" {...register("isUnlimitedTime")} />
          <label htmlFor="unlimited-time" className="text-sm cursor-pointer">
            제한 없음
          </label>
        </div>
        {"testTimeMinutes" in errors && errors.testTimeMinutes && (
          <p className="text-sm text-red-500 mt-1">
            {errors.testTimeMinutes.message}
          </p>
        )}
      </fieldset>

      {/* 시험 순서와 시험 모드 */}
      <div className="w-full flex justify-stretch items-start gap-2">
        <fieldset className="space-y-3 grow">
          <Label className="text-sm font-medium">시험 순서</Label>
          <ToggleGroup
            name="orderType"
            value={orderTypeField.value}
            onChange={orderTypeField.onChange}
            onBlur={orderTypeField.onBlur}
            options={[
              { value: "sequential", label: "순차 시험" },
              { value: "random", label: "랜덤 시험" },
            ]}
          />
          {errors.orderType && (
            <p className="text-sm text-red-500 mt-1">
              {errors.orderType.message}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3 grow">
          <Label className="text-sm font-medium">시험 모드</Label>
          <ToggleGroup
            name="testMode"
            value={testModeField.value}
            onChange={testModeField.onChange}
            onBlur={testModeField.onBlur}
            options={[
              { value: "all", label: "전체 시험" },
              { value: "random", label: "랜덤 뽑기" },
            ]}
          />
          {"testMode" in errors && errors.testMode && (
            <p className="text-sm text-red-500 mt-1">
              {errors.testMode.message}
            </p>
          )}

          {/* 랜덤 뽑기 개수 */}
          {testMode === "random" && (
            <div className="space-y-3 mt-3">
              <Label htmlFor="randomPickCount" className="text-sm font-medium">
                랜덤 뽑기 개수
              </Label>
              <Description>
                전체 {totalCardCount}개 중 몇 개를 시험 볼까요?
              </Description>
              <div className="flex items-center gap-2">
                <input
                  id="randomPickCount"
                  type="number"
                  className="w-24 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-center"
                  {...register("randomPickCount", {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === "" ? undefined : Number(v)),
                  })}
                  min={1}
                  max={totalCardCount}
                />
                <span className="text-sm">개</span>
              </div>
              {"randomPickCount" in errors && errors.randomPickCount && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.randomPickCount.message}
                </p>
              )}
            </div>
          )}
        </fieldset>
      </div>
    </>
  );
}
