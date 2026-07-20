import {
  examSeedKey,
  examSessionKey,
  examTimerKey,
} from "@/features/test-mode/model/constants";
import type { ExamSession } from "@/features/test-mode/model/types";
import { createShuffleSeed } from "@/shared/lib/shuffle";

type PersistedTimer =
  | { status: "running"; endTime: number }
  | { status: "paused"; remainingMs: number };

/**
 * 시험 세션의 sessionStorage 접근을 한곳에 모은다.
 *
 * 답변·타이머·출제 시드가 서로 다른 키에 흩어져 있고 초기 렌더에서 동기적으로
 * 읽어야 해서, 키 조합과 파싱 실패 처리를 컴포넌트 밖으로 뺐다.
 */
export const createExamSessionStorage = (cardsetId: number) => {
  const sessionKey = examSessionKey(cardsetId);
  const timerKey = examTimerKey(cardsetId);
  const seedKey = examSeedKey(cardsetId);

  return {
    timerKey,

    hasSavedSession: () => !!sessionStorage.getItem(sessionKey),

    readAnswers: (): ExamSession["answers"] | null => {
      const raw = sessionStorage.getItem(sessionKey);
      if (!raw) return null;
      try {
        return (JSON.parse(raw) as ExamSession).answers;
      } catch {
        // 파싱 실패 시 복원 포기
        return null;
      }
    },

    saveAnswers: (answers: ExamSession["answers"]) => {
      sessionStorage.setItem(
        sessionKey,
        JSON.stringify({ answers } satisfies ExamSession),
      );
    },

    clearSession: () => {
      sessionStorage.removeItem(sessionKey);
      sessionStorage.removeItem(seedKey);
    },

    hasPersistedTimer: () => !!sessionStorage.getItem(timerKey),

    /** 저장된 타이머의 남은 시간(초). 없으면 0. */
    readRemainingSeconds: (): number => {
      const raw = sessionStorage.getItem(timerKey);
      if (!raw) return 0;
      try {
        const saved = JSON.parse(raw) as PersistedTimer;
        if (saved.status === "running")
          return Math.max(0, (saved.endTime - Date.now()) / 1000);
        return saved.remainingMs / 1000;
      } catch {
        return 0;
      }
    },

    /**
     * 출제 시드를 읽고, 없으면 새로 발급해 저장한다.
     *
     * 답변은 questionKey(카드 id) 기준으로 복원되므로 새로고침 때마다 다시 뽑으면
     * 복원된 답변이 화면에 없는 카드를 가리켜 세션이 깨진다. 시드를 세션에 묶어두고
     * "처음부터"에서만 새로 발급한다.
     */
    readOrCreateSeed: (): number => {
      const saved = Number(sessionStorage.getItem(seedKey));
      if (Number.isFinite(saved) && saved > 0) return saved;

      const seed = createShuffleSeed();
      sessionStorage.setItem(seedKey, String(seed));
      return seed;
    },

    renewSeed: (): number => {
      sessionStorage.removeItem(seedKey);
      const seed = createShuffleSeed();
      sessionStorage.setItem(seedKey, String(seed));
      return seed;
    },
  };
};

export type ExamSessionStorage = ReturnType<typeof createExamSessionStorage>;
