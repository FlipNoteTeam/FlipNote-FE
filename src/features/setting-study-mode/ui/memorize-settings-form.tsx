import { Checkbox } from "@/shared/components/checkbox";
import { Description } from "@/shared/components/form";
import { Label } from "@/shared/components/label";
import { NumberInput } from "@/shared/components/number-input";
import { ToggleGroup } from "@/shared/components/toggle-group";
import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { useController, useWatch } from "react-hook-form";
import type { StudySettingsFormField } from "../model/form.schema";

type MemorizeSettingsFormProps = {
  control: Control<StudySettingsFormField>;
  register: UseFormRegister<StudySettingsFormField>;
  errors: FieldErrors<StudySettingsFormField>;
};

export function MemorizeSettingsForm({
  control,
  register,
  errors,
}: MemorizeSettingsFormProps) {
  const { field: orderTypeField } = useController({
    name: "orderType",
    control,
  });

  const { field: navigationTypeField } = useController({
    name: "navigationType",
    control,
  });

  const { field: repeatCountField } = useController({
    name: "repeatCount",
    control,
  });

  const { field: autoTimerSecondsField } = useController({
    name: "autoTimerSeconds",
    control,
  });

  const navigationType = useWatch({ control, name: "navigationType" });
  const isUnlimitedRepeat = useWatch({ control, name: "isUnlimitedRepeat" });

  return (
    <>
      {/* 반복 횟수 */}
      <fieldset className="space-y-3">
        <Label className="text-sm font-medium">반복 횟수</Label>
        <div className="flex items-center gap-2">
          <NumberInput
            min={1}
            max={100}
            className="w-24"
            disabled={isUnlimitedRepeat}
            value={repeatCountField.value}
            onChange={(e) => repeatCountField.onChange(parseInt(e.target.value) || 1)}
            onBlur={repeatCountField.onBlur}
          />
          <span className="text-sm">회</span>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="unlimited-repeat" {...register("isUnlimitedRepeat")} />
          <label htmlFor="unlimited-repeat" className="text-sm cursor-pointer">
            제한 없음
          </label>
        </div>
        {"repeatCount" in errors && errors.repeatCount && (
          <p className="text-sm text-red-500 mt-1">
            {errors.repeatCount.message}
          </p>
        )}
      </fieldset>

      {/* 카드 순서와 페이지 넘김 */}
      <div className="w-full flex justify-stretch items-stretch gap-2">
        <fieldset className="space-y-3 grow">
          <Label className="text-sm font-medium">카드 순서</Label>
          <ToggleGroup
            name="orderType"
            value={orderTypeField.value}
            onChange={orderTypeField.onChange}
            onBlur={orderTypeField.onBlur}
            options={[
              { value: "sequential", label: "순차 진행" },
              { value: "random", label: "랜덤 섞기" },
            ]}
          />
          {errors.orderType && (
            <p className="text-sm text-red-500 mt-1">
              {errors.orderType.message}
            </p>
          )}
        </fieldset>

        <fieldset className="space-y-3 grow">
          <Label className="text-sm font-medium">페이지 넘김</Label>
          <ToggleGroup
            name="navigationType"
            value={navigationTypeField.value}
            onChange={navigationTypeField.onChange}
            onBlur={navigationTypeField.onBlur}
            options={[
              { value: "manual", label: "수동" },
              { value: "auto", label: "자동" },
            ]}
          />
          {"navigationType" in errors && errors.navigationType && (
            <p className="text-sm text-red-500 mt-1">
              {errors.navigationType.message}
            </p>
          )}
        </fieldset>
      </div>

      {/* 자동 넘김 시간 */}
      {navigationType === "auto" && (
        <div className="space-y-3 bg-blue-50 p-5 rounded-lg">
          <Label htmlFor="autoTimerSeconds" className="text-sm font-medium">
            자동 넘김 시간
          </Label>
          <Description>
            카드가 자동으로 넘어가는 시간을 설정해주세요
          </Description>
          <div className="flex items-center gap-2">
            <NumberInput
              id="autoTimerSeconds"
              className="w-24"
              value={autoTimerSecondsField.value}
              onChange={(e) => autoTimerSecondsField.onChange(parseInt(e.target.value) || 1)}
              onBlur={autoTimerSecondsField.onBlur}
            />
            <span className="text-sm">초</span>
          </div>
          {"autoTimerSeconds" in errors && errors.autoTimerSeconds && (
            <p className="text-sm text-red-500 mt-1">
              {errors.autoTimerSeconds.message}
            </p>
          )}
        </div>
      )}
    </>
  );
}
