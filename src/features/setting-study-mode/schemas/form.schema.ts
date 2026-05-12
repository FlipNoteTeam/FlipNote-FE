import { z } from "zod";

// 단일 진실 공급원 (Single Source of Truth)
export const STUDY_MODES = ["memorize", "test"] as const;
export const ORDER_TYPES = ["random", "sequential"] as const;
export const NAVIGATION_TYPES = ["auto", "manual"] as const;
export const TEST_MODES = ["all", "random"] as const;

export type StudyMode = (typeof STUDY_MODES)[number];
export type OrderType = (typeof ORDER_TYPES)[number];
export type NavigationType = (typeof NAVIGATION_TYPES)[number];
export type TestMode = (typeof TEST_MODES)[number];

// 암기 모드 설정 스키마
export const memorizeSettingsSchema = z
  .object({
    mode: z.literal("memorize"),
    repeatCount: z
      .number({ message: "반복 횟수를 입력해주세요" })
      .int({ message: "정수를 입력해주세요" })
      .positive({ message: "1 이상의 숫자를 입력해주세요" })
      .optional(),
    isUnlimitedRepeat: z.boolean(),
    navigationType: z.enum(NAVIGATION_TYPES, {
      message: "페이지 넘김 방식을 선택해주세요",
    }),
    autoTimerSeconds: z
      .number({ message: "자동 넘김 시간을 입력해주세요" })
      .int({ message: "정수를 입력해주세요" })
      .min(1, { message: "최소 1초 이상이어야 합니다" })
      .optional(),
    orderType: z.enum(ORDER_TYPES, {
      message: "카드 순서를 선택해주세요",
    }),
  })
  .refine((data) => data.isUnlimitedRepeat || data.repeatCount !== undefined, {
    message: "반복 횟수를 입력해주세요",
    path: ["repeatCount"],
  })
  .refine(
    (data) =>
      data.navigationType !== "auto" || data.autoTimerSeconds !== undefined,
    {
      message: "자동 넘김 시간을 입력해주세요",
      path: ["autoTimerSeconds"],
    }
  );

// 시험 모드 설정 스키마
export const testSettingsSchema = z
  .object({
    mode: z.literal("test"),
    testTimeMinutes: z
      .number({ message: "시험 시간을 입력해주세요" })
      .int({ message: "정수를 입력해주세요" })
      .positive({ message: "1 이상의 숫자를 입력해주세요" })
      .optional(),
    isUnlimitedTime: z.boolean(),
    orderType: z.enum(ORDER_TYPES, {
      message: "순차/랜덤을 선택해주세요",
    }),
    testMode: z.enum(TEST_MODES, {
      message: "시험 모드를 선택해주세요",
    }),
    totalCardCount: z.number().int().positive().optional(), // 전체 카드 개수 (컨텍스트로 전달)
    randomPickCount: z
      .number({ message: "카드 개수를 입력해주세요" })
      .int({ message: "정수를 입력해주세요" })
      .positive({ message: "1 이상의 숫자를 입력해주세요" })
      .optional(),
  })
  .refine(
    (data) => data.isUnlimitedTime || data.testTimeMinutes !== undefined,
    {
      message: "시험 시간을 입력해주세요",
      path: ["testTimeMinutes"],
    }
  )
  .refine(
    (data) => data.testMode !== "random" || data.randomPickCount !== undefined,
    {
      message: "랜덤 뽑기 개수를 입력해주세요",
      path: ["randomPickCount"],
    }
  )
  .refine(
    (data) => {
      if (
        data.testMode === "random" &&
        data.randomPickCount &&
        data.totalCardCount
      ) {
        return data.randomPickCount <= data.totalCardCount;
      }
      return true;
    },
    {
      message: "랜덤 뽑기 개수는 전체 카드 개수를 초과할 수 없습니다",
      path: ["randomPickCount"],
    }
  );

// 통합 폼 스키마
export const studySettingsFormSchema = z.discriminatedUnion("mode", [
  memorizeSettingsSchema,
  testSettingsSchema,
]);

export type MemorizeSettings = z.infer<typeof memorizeSettingsSchema>;
export type TestSettings = z.infer<typeof testSettingsSchema>;
export type StudySettingsFormField = z.infer<typeof studySettingsFormSchema>;
