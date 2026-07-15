import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { cardApi } from "@/shared/apis/card";
import BaseLayout from "@/shared/layouts/base-layout";
import { useLocation } from "@tanstack/react-router";
import type { TestSettings } from "@/features/setting-study-mode/schemas/form.schema";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Card } from "@/shared/components/card";
import { useTimer } from "@/shared/hooks/use-timer";
import {
  Clock,
  Play,
  Pause,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type StudyState = TestSettings & {
  groupId: number;
  cardsetId: number;
};

type Answer = {
  questionKey: string;
  userAnswer: string;
};

type TestResult = {
  questionKey: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
};

type ExamSession = {
  answers: Answer[];
};

const formatTime = (seconds: number) => {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};

const TestMode = () => {
  const { state } = useLocation();
  const studySettings = state as unknown as StudyState | null;

  const cardsetId = studySettings?.cardsetId ?? "exam";
  const savedSessionKey = `flipnote-exam-session-${cardsetId}`;
  const timerKey = `flipnote-timer-${cardsetId}`;

  // 이전 세션 존재 여부와 남은 시간을 초기 렌더에서 동기적으로 읽음
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(
    () => !!sessionStorage.getItem(savedSessionKey),
  );

  const [savedRemainingSeconds] = useState<number>(() => {
    const raw = sessionStorage.getItem(timerKey);
    if (!raw) return 0;
    try {
      const saved = JSON.parse(raw) as
        | { status: "running"; endTime: number }
        | { status: "paused"; remainingMs: number };
      if (saved.status === "running")
        return Math.max(0, (saved.endTime - Date.now()) / 1000);
      if (saved.status === "paused") return saved.remainingMs / 1000;
    } catch {
      // 파싱 실패 시 0 반환
    }
    return 0;
  });

  // 카드 데이터 조회
  const {
    data: cardsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", studySettings?.cardsetId],
    queryFn: () => cardApi.getCards(studySettings!.cardsetId),
    enabled: !!studySettings?.cardsetId,
  });

  const cards = useMemo(() => cardsData?.data?.data ?? [], [cardsData]);

  // 답변 저장
  const [answers, setAnswers] = useState<Answer[]>([]);
  const answersRef = useRef<Answer[]>([]);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // 카드 데이터가 로드되면 answers 초기화 (복원 세션에서는 건너뜀)
  useEffect(() => {
    if (cards.length > 0 && answers.length === 0 && !restoreDialogOpen) {
      setAnswers(cards.map((q) => ({ questionKey: q.id, userAnswer: "" })));
    }
  }, [cards, answers.length, restoreDialogOpen]);

  // 시험 진행 단계: 'answering' | 'grading'
  const [phase, setPhase] = useState<"answering" | "grading">("answering");
  const phaseRef = useRef<"answering" | "grading">("answering");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const submittedRef = useRef(false);

  // 답변 현황 패널 열림/닫힘
  const [isNavOpen, setIsNavOpen] = useState(true);

  // 채점 결과
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // 타이머 설정
  const testDurationMinutes = studySettings?.testTimeMinutes ?? 30;
  const isUnlimitedTime = studySettings?.isUnlimitedTime ?? false;

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionKey === questionKey ? { ...a, userAnswer: value } : a,
      ),
    );
  };

  const handleSubmit = () => {
    submittedRef.current = true;
    const results: TestResult[] = cards.map((q) => {
      const userAnswer =
        answersRef.current.find((a) => a.questionKey === q.id)?.userAnswer ||
        "";
      return {
        questionKey: q.id,
        question: q.question,
        correctAnswer: q.answer,
        userAnswer,
        isCorrect: false,
      };
    });
    setTestResults(results);
    setPhase("grading");
  };

  // 타이머 초기화
  const timer = useTimer({
    storageKey: timerKey,
    onComplete: () => {
      alert("시험 시간이 종료되었습니다. 자동으로 제출됩니다.");
      handleSubmit();
    },
  });

  // 타이머 시작 — 복원 다이얼로그가 없을 때만 바로 시작
  useEffect(() => {
    if (!isUnlimitedTime && !restoreDialogOpen) {
      timer.start(testDurationMinutes * 60);
    }

    return () => {
      // 제출 완료 시에만 세션 삭제
      if (submittedRef.current || phaseRef.current === "grading") {
        timer.stop();
        sessionStorage.removeItem(savedSessionKey);
        return;
      }

      // 이탈: 답변이 있으면 세션 업데이트, 없으면 기존 세션 유지 (삭제하지 않음)
      const hasProgress = answersRef.current.some(
        (a) => a.userAnswer.trim().length > 0,
      );
      if (hasProgress) {
        sessionStorage.setItem(
          savedSessionKey,
          JSON.stringify({ answers: answersRef.current } satisfies ExamSession),
        );
      }
      timer.pauseAndKeep();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 복원 다이얼로그 — 이어서 풀기
  const handleResume = () => {
    const raw = sessionStorage.getItem(savedSessionKey);
    if (raw) {
      try {
        const session = JSON.parse(raw) as ExamSession;
        setAnswers(session.answers);
      } catch {
        // 파싱 실패 시 빈 상태로 시작
      }
    }
    if (timer.isPaused) timer.resume();
    setRestoreDialogOpen(false);
  };

  // 복원 다이얼로그 — 처음부터
  const handleRestart = () => {
    timer.stop();
    sessionStorage.removeItem(savedSessionKey);
    setRestoreDialogOpen(false);
    // 카드 로드 후 answers 초기화는 useEffect가 담당
    setAnswers([]);
    if (!isUnlimitedTime) {
      timer.start(testDurationMinutes * 60);
    }
  };

  const handleGradeChange = (questionKey: string, isCorrect: boolean) => {
    setTestResults((prev) =>
      prev.map((r) =>
        r.questionKey === questionKey ? { ...r, isCorrect } : r,
      ),
    );
  };

  const handleFinish = () => {
    const correctCount = testResults.filter((r) => r.isCorrect).length;
    const totalCount = testResults.length;
    const score = Math.round((correctCount / totalCount) * 100);

    alert(
      `채점이 완료되었습니다!\n정답: ${correctCount}/${totalCount}\n점수: ${score}점`,
    );
  };

  if (isLoading) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </BaseLayout>
    );
  }

  if (isError || cards.length === 0) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">카드를 불러올 수 없습니다.</p>
        </div>
      </BaseLayout>
    );
  }

  if (phase === "grading") {
    return (
      <BaseLayout>
        <div className="max-w-4xl mx-auto py-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">채점하기</h1>
            <Button onClick={handleFinish}>채점 완료</Button>
          </div>

          <div className="space-y-6">
            {testResults.map((result, index) => (
              <Card key={result.questionKey} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {result.question}
                  </h3>
                </div>

                <div className="space-y-2">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-600 mb-1">정답</p>
                    <p className="text-gray-900">{result.correctAnswer}</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded">
                    <p className="text-sm text-blue-600 mb-1">내 답변</p>
                    <p className="text-gray-900">
                      {result.userAnswer || "(답변 없음)"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={result.isCorrect ? "default" : "outline"}
                    onClick={() => handleGradeChange(result.questionKey, true)}
                    className="flex-1"
                  >
                    정답
                  </Button>
                  <Button
                    variant={!result.isCorrect ? "default" : "outline"}
                    onClick={() => handleGradeChange(result.questionKey, false)}
                    className="flex-1"
                  >
                    오답
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      {/* 이전 세션 복원 다이얼로그 */}
      {restoreDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="이전 시험 내역"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-5">
            <div className="space-y-1 text-center">
              <h2 className="text-xl font-bold">이전에 풀던 내역이 있습니다</h2>
              <p className="text-sm text-gray-500">이어서 풀겠습니까?</p>
            </div>

            {!isUnlimitedTime && savedRemainingSeconds > 0 && (
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl py-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">남은 시간</span>
                <span className="font-mono font-semibold text-gray-900">
                  {formatTime(savedRemainingSeconds)}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="outline"
                onClick={handleRestart}
              >
                처음부터
              </Button>
              <Button className="flex-1" onClick={handleResume}>
                이어서 풀기
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* 헤더와 타이머 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">시험</h1>

          <div className="flex items-center gap-4">
            {/* 타이머 */}
            {!isUnlimitedTime && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <span
                  className={`text-lg font-mono font-semibold ${
                    timer.remainingSeconds < 60
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {formatTime(timer.remainingSeconds)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    timer.isRunning ? timer.pause() : timer.resume()
                  }
                  className="h-8 w-8"
                >
                  {timer.isRunning ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}

            <Button onClick={handleSubmit}>제출하기</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xs">
            {cards.map((card, index) => (
              <div
                key={`card-${card.id}`}
                id={`question-${card.id}`}
                className="px-2 py-6 space-y-4"
              >
                <h3 className="text-lg font-semibold">
                  {index + 1}. {card.question}
                </h3>
                <Textarea
                  placeholder="답변을 입력하세요"
                  value={
                    answers.find((a) => a.questionKey === card.id)
                      ?.userAnswer || ""
                  }
                  onChange={(e) => handleAnswerChange(card.id, e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* 답변 현황 플로팅 패널 */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="bg-white border-y border-l shadow-md rounded-l-lg h-10 w-5 flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {isNavOpen ? (
            <ChevronRight className="h-3 w-3 text-gray-500" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-500" />
          )}
        </button>
        <div
          className={`bg-white border shadow-md rounded-tl-lg rounded-bl-lg overflow-hidden transition-all duration-200 ${
            isNavOpen ? "w-12" : "w-0"
          }`}
        >
          <div className="p-2 flex flex-col items-center gap-1.5 max-h-[calc(100dvh-8rem)] overflow-y-auto">
            {cards.map((card, index) => {
              const isAnswered = !!answers
                .find((a) => a.questionKey === card.id)
                ?.userAnswer.trim();
              return (
                <button
                  key={card.id}
                  onClick={() =>
                    document
                      .getElementById(`question-${card.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                    isAnswered
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default TestMode;
