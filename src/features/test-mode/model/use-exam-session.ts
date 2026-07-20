import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_TEST_MINUTES } from "@/features/test-mode/model/constants";
import { createExamSessionStorage } from "@/features/test-mode/model/exam-session-storage";
import { selectTestCards } from "@/features/test-mode/model/select-test-cards";
import type {
  Answer,
  ExamPhase,
  TestResult,
  TestSessionSettings,
} from "@/features/test-mode/model/types";
import type { CardResponse } from "@/shared/apis/card";
import { useTimer } from "@/shared/hooks/use-timer";

type UseExamSessionParams = {
  settings: TestSessionSettings;
  rawCards: CardResponse[];
};

/**
 * 시험 세션 상태를 소유하는 훅.
 *
 * 출제 카드 결정, 답변 보관, 진행 단계, 타이머, 이탈 시 보존/복원을 묶는다.
 * UI 컴포넌트는 여기서 나온 값과 액션만 그린다.
 */
export const useExamSession = ({
  settings,
  rawCards,
}: UseExamSessionParams) => {
  const storage = useMemo(
    () => createExamSessionStorage(settings.cardsetId),
    [settings.cardsetId],
  );

  const testDurationMinutes = settings.testTimeMinutes ?? DEFAULT_TEST_MINUTES;
  const isUnlimitedTime = settings.isUnlimitedTime;

  // 이전 세션 존재 여부와 남은 시간은 초기 렌더에서 동기적으로 읽어야
  // 타이머 시작 여부를 정할 수 있다.
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(() =>
    storage.hasSavedSession(),
  );
  const [savedRemainingSeconds] = useState(() =>
    storage.readRemainingSeconds(),
  );
  const [selectionSeed, setSelectionSeed] = useState(() =>
    storage.readOrCreateSeed(),
  );

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [phase, setPhase] = useState<ExamPhase>("answering");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // 이탈 시점(cleanup·pagehide)에 최신 값을 읽어야 해서 ref로도 들고 있는다.
  const answersRef = useRef<Answer[]>([]);
  const phaseRef = useRef<ExamPhase>("answering");
  const submittedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 시험 순서(orderType)와 출제 범위(testMode·randomPickCount)를 적용한 출제 카드
  const cards = useMemo(
    () =>
      selectTestCards(
        rawCards,
        {
          orderType: settings.orderType,
          testMode: settings.testMode,
          randomPickCount: settings.randomPickCount,
        },
        selectionSeed,
      ),
    [
      rawCards,
      settings.orderType,
      settings.testMode,
      settings.randomPickCount,
      selectionSeed,
    ],
  );

  // 카드 로드 후 답변 슬롯 초기화 (복원 다이얼로그가 떠 있으면 사용자 선택을 기다린다)
  useEffect(() => {
    if (cards.length > 0 && answers.length === 0 && !restoreDialogOpen) {
      setAnswers(cards.map((card) => ({ questionKey: card.id, userAnswer: "" })));
    }
  }, [cards, answers.length, restoreDialogOpen]);

  const changeAnswer = useCallback((questionKey: string, value: string) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionKey === questionKey
          ? { ...answer, userAnswer: value }
          : answer,
      ),
    );
  }, []);

  // 제출은 타이머 onComplete에서도 호출되는데, useTimer가 훅 선언 순서상 아래에
  // 있어 ref로 최신 구현을 넘긴다.
  const submitRef = useRef<() => void>(() => {});

  const submit = useCallback(() => {
    submittedRef.current = true;
    setTestResults(
      cards.map((card) => ({
        questionKey: card.id,
        question: card.question,
        correctAnswer: card.answer,
        userAnswer:
          answersRef.current.find((answer) => answer.questionKey === card.id)
            ?.userAnswer ?? "",
        isCorrect: false,
      })),
    );
    setPhase("grading");
  }, [cards]);

  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  const timer = useTimer({
    storageKey: storage.timerKey,
    onComplete: () => {
      alert("시험 시간이 종료되었습니다. 자동으로 제출됩니다.");
      submitRef.current();
    },
  });

  // 타이머 시작 및 이탈 시 상태 저장
  // - 최초 진입에서만 새 타이머 시작. 복원 다이얼로그가 열려 있거나 이미
  //   진행 중인 타이머가 있으면 useTimer의 복원값을 덮어쓰지 않는다.
  // - SPA 이동은 effect cleanup, 새로고침·탭 닫기는 pagehide로 동일하게 저장.
  useEffect(() => {
    if (!isUnlimitedTime && !restoreDialogOpen && !storage.hasPersistedTimer()) {
      timer.start(testDurationMinutes * 60);
    }

    const finalizeOnLeave = () => {
      // 제출 완료 시에만 세션 삭제
      if (submittedRef.current || phaseRef.current === "grading") {
        timer.stop();
        storage.clearSession();
        return;
      }

      // 이탈: 답변이 있을 때만 세션과 타이머 상태를 함께 보존한다.
      // pauseAndKeep을 무조건 호출하면 StrictMode 이중 마운트나 답변 없는
      // 이탈에서 타이머가 paused로 덮여, hasPersistedTimer 가드가 start()를
      // 막은 채 멈춘 타이머로 복원되는 문제가 생긴다.
      const hasProgress = answersRef.current.some(
        (answer) => answer.userAnswer.trim().length > 0,
      );
      if (hasProgress) {
        storage.saveAnswers(answersRef.current);
        timer.pauseAndKeep();
      }
    };

    // 새로고침·탭 닫기 시엔 React cleanup이 실행되지 않으므로 pagehide로 저장
    window.addEventListener("pagehide", finalizeOnLeave);

    return () => {
      window.removeEventListener("pagehide", finalizeOnLeave);
      finalizeOnLeave();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumeSavedSession = useCallback(() => {
    const savedAnswers = storage.readAnswers();
    if (savedAnswers) setAnswers(savedAnswers);
    if (timer.isPaused) timer.resume();
    setRestoreDialogOpen(false);
  }, [storage, timer]);

  const restartSession = useCallback(() => {
    timer.stop();
    storage.clearSession();
    // 새 시험이므로 출제도 다시 뽑는다
    setSelectionSeed(storage.renewSeed());
    setRestoreDialogOpen(false);
    // 카드 로드 후 답변 초기화는 위 effect가 담당
    setAnswers([]);
    if (!isUnlimitedTime) {
      timer.start(testDurationMinutes * 60);
    }
  }, [isUnlimitedTime, storage, testDurationMinutes, timer]);

  const changeGrade = useCallback((questionKey: string, isCorrect: boolean) => {
    setTestResults((prev) =>
      prev.map((result) =>
        result.questionKey === questionKey ? { ...result, isCorrect } : result,
      ),
    );
  }, []);

  const finishGrading = useCallback(() => {
    const correctCount = testResults.filter((result) => result.isCorrect).length;
    const totalCount = testResults.length;
    const score = Math.round((correctCount / totalCount) * 100);

    alert(
      `채점이 완료되었습니다!\n정답: ${correctCount}/${totalCount}\n점수: ${score}점`,
    );
  }, [testResults]);

  return {
    cards,
    answers,
    phase,
    testResults,
    timer,
    isUnlimitedTime,
    restoreDialogOpen,
    savedRemainingSeconds,
    changeAnswer,
    submit,
    resumeSavedSession,
    restartSession,
    changeGrade,
    finishGrading,
  };
};
