import { Checkbox } from "@/shared/components/checkbox";
import { Description } from "@/shared/components/form";
import { Label } from "@/shared/components/label";
import { NumberInput } from "@/shared/components/number-input";
import { ToggleGroup } from "@/shared/components/toggle-group";
import type { ChangeEvent } from "react";
import type { Control, FieldErrors } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";
import type { StudySettingsFormField } from "../schemas/form.schema";

type TestSettingsFormProps = {
  control: Control<StudySettingsFormField>;
  errors: FieldErrors<StudySettingsFormField>;
  totalCardCount: number;
};

export function TestSettingsForm({
  control,
  errors,
  totalCardCount,
}: TestSettingsFormProps) {
  const { field: orderTypeField } = useController({
    name: "orderType",
    control,
  });
  const { field: testModeField } = useController({ name: "testMode", control });
  const { field: testTimeMinutesField } = useController({
    name: "testTimeMinutes",
    control,
  });
  const { field: isUnlimitedTimeField } = useController({
    name: "isUnlimitedTime",
    control,
  });
  const { field: randomPickCountField } = useController({
    name: "randomPickCount",
    control,
  });

  const isUnlimitedTime = useWatch({ control, name: "isUnlimitedTime" });
  const testMode = useWatch({ control, name: "testMode" });

  /**
   * 폼에 noValidate가 없어 범위를 벗어난 값은 브라우저가 제출 자체를 막아버리고,
   * zod 메시지는 화면에 도달하지 못한다. 그래서 하한(1) 위반은 입력 시점에 끊는다.
   * 빈 값은 undefined로 남겨 제출 시 "문제 개수를 입력해주세요" 안내가 뜨게 둔다.
   */
  const handleRandomPickCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (raw === "") {
      randomPickCountField.onChange(undefined);
      return;
    }

    randomPickCountField.onChange(Math.max(1, Number(raw)));
  };

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
            onChange={(e) =>
              testTimeMinutesField.onChange(parseInt(e.target.value) || 1)
            }
            onBlur={testTimeMinutesField.onBlur}
            min={1}
            max={180}
          />
          <span className="text-sm">분</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="unlimited-time"
            checked={Boolean(isUnlimitedTimeField.value)}
            onCheckedChange={isUnlimitedTimeField.onChange}
            onBlur={isUnlimitedTimeField.onBlur}
            ref={isUnlimitedTimeField.ref}
          />
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
                최대 문제 개수
              </Label>
              <Description>
                입력한 개수만큼 무작위로 출제합니다. 순서도 함께 섞입니다.
              </Description>
              <div className="flex items-center gap-2">
                <NumberInput
                  id="randomPickCount"
                  className="w-24"
                  value={randomPickCountField.value ?? ""}
                  onChange={handleRandomPickCountChange}
                  onBlur={randomPickCountField.onBlur}
                  ref={randomPickCountField.ref}
                  min={1}
                />
                <span className="text-sm">개</span>
              </div>
              {/* 상한이 아니라 참고용 — 카드가 더 적으면 있는 만큼만 출제된다 */}
              <p className="text-sm text-gray-500">
                현재 카드셋의 카드는 {totalCardCount}개입니다. 이보다 많이
                입력하면 {totalCardCount}개만 출제됩니다.
              </p>
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
