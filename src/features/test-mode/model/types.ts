import type { TestSettings } from "@/features/setting-study-mode/schemas/form.schema";

/** 시험 세션 구동에 필요한 설정 (학습 설정 + 대상 카드셋) */
export type TestSessionSettings = TestSettings & {
  groupId: number;
  cardsetId: number;
};

/** 문항별 사용자 답변. questionKey는 카드 id다. */
export type Answer = {
  questionKey: string;
  userAnswer: string;
};

/** 채점 화면에서 다루는 문항별 결과 */
export type TestResult = {
  questionKey: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
};

/** sessionStorage에 보존되는 진행 중 시험 세션 */
export type ExamSession = {
  answers: Answer[];
};

/** 시험 진행 단계 */
export type ExamPhase = "answering" | "grading";
