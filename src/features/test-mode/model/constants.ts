/** 설정에 시험 시간이 없을 때 쓰는 기본값(분) */
export const DEFAULT_TEST_MINUTES = 30;

/** 남은 시간이 이 값 미만이면 경고 색으로 표시한다(초) */
export const TIME_WARNING_THRESHOLD_SECONDS = 60;

export const examSessionKey = (cardsetId: number) =>
  `flipnote-exam-session-${cardsetId}`;

export const examTimerKey = (cardsetId: number) =>
  `flipnote-timer-${cardsetId}`;

export const examSeedKey = (cardsetId: number) =>
  `flipnote-exam-seed-${cardsetId}`;

/** 문항 앵커 id — 답변 현황 패널이 이 id로 스크롤을 이동시킨다. */
export const questionAnchorId = (cardId: string) => `question-${cardId}`;
