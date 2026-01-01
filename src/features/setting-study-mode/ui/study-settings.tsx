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
import { useController, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  studySettingsFormSchema,
  type StudySettingsFormField,
} from "../model/form.schema";

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
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StudySettingsFormField>({
    resolver: zodResolver(studySettingsFormSchema),
    defaultValues: {
      mode: "memorize",
      isUnlimitedRepeat: false,
      repeatCount: 3,
      navigationType: "manual",
      autoTimerSeconds: 5,
      orderType: "sequential",
    },
  });

  const { field: modeField } = useController({
    name: "mode",
    control,
  });

  const { field: orderTypeField } = useController({
    name: "orderType",
    control,
  });

  const { field: navigationTypeField } = useController({
    name: "navigationType",
    control,
  });

  const { field: testModeField } = useController({
    name: "testMode",
    control,
  });

  const mode = useWatch({ control, name: "mode" });
  const navigationType = useWatch({ control, name: "navigationType" });
  const isUnlimitedRepeat = useWatch({ control, name: "isUnlimitedRepeat" });
  const isUnlimitedTime = useWatch({ control, name: "isUnlimitedTime" });
  const testMode = useWatch({ control, name: "testMode" });

  const handleReset = () => {
    if (mode === "memorize") {
      reset({
        mode: "memorize",
        isUnlimitedRepeat: false,
        repeatCount: 3,
        navigationType: "manual",
        autoTimerSeconds: 5,
        orderType: "sequential",
      });
    } else {
      reset({
        mode: "test",
        isUnlimitedTime: false,
        testTimeMinutes: 30,
        orderType: "sequential",
        testMode: "all",
        totalCardCount,
        randomPickCount: undefined,
      });
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
            <>
              {/* 반복 횟수 */}
              <fieldset className="space-y-3">
                <Label className="text-sm font-medium">반복 횟수</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="w-24"
                    disabled={isUnlimitedRepeat}
                    {...register("repeatCount", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm">회</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="unlimited-repeat"
                    {...register("isUnlimitedRepeat")}
                  />
                  <label
                    htmlFor="unlimited-repeat"
                    className="text-sm cursor-pointer"
                  >
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
                  <Label
                    htmlFor="autoTimerSeconds"
                    className="text-sm font-medium"
                  >
                    자동 넘김 시간
                  </Label>
                  <Description>
                    카드가 자동으로 넘어가는 시간을 설정해주세요
                  </Description>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      id="autoTimerSeconds"
                      className="w-24"
                      {...register("autoTimerSeconds", {
                        valueAsNumber: true,
                      })}
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
          )}

          {/* 시험 모드 설정 */}
          {mode === "test" && (
            <>
              {/* 시험 시간 */}
              <fieldset className="space-y-3">
                <Label className="text-sm font-medium">시험 시간</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={180}
                    className="w-24"
                    disabled={isUnlimitedTime}
                    {...register("testTimeMinutes", {
                      valueAsNumber: true,
                    })}
                  />
                  <span className="text-sm">분</span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="unlimited-time"
                    {...register("isUnlimitedTime")}
                  />
                  <label
                    htmlFor="unlimited-time"
                    className="text-sm cursor-pointer"
                  >
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
                        <Input
                          type="number"
                          id="randomPickCount"
                          min={1}
                          max={totalCardCount}
                          className="w-24"
                          {...register("randomPickCount", {
                            valueAsNumber: true,
                          })}
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
