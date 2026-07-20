import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { TestSessionSettings } from "@/features/test-mode/model/types";
import { useExamSession } from "@/features/test-mode/model/use-exam-session";
import { AnswerNavPanel } from "@/features/test-mode/ui/answer-nav-panel";
import { ExamTimer } from "@/features/test-mode/ui/exam-timer";
import { GradingView } from "@/features/test-mode/ui/grading-view";
import { QuestionList } from "@/features/test-mode/ui/question-list";
import { RestoreSessionDialog } from "@/features/test-mode/ui/restore-session-dialog";
import { cardApi } from "@/shared/apis/card";
import { Button } from "@/shared/components/button";
import BaseLayout from "@/shared/layouts/base-layout";

type TestModeProps = {
  settings: TestSessionSettings;
};

export const TestMode = ({ settings }: TestModeProps) => {
  const {
    data: cardsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", settings.cardsetId],
    queryFn: () => cardApi.getCards(settings.cardsetId),
  });

  const rawCards = useMemo(() => cardsData?.data?.data ?? [], [cardsData]);

  const {
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
  } = useExamSession({ settings, rawCards });

  const toggleTimer = () => {
    if (timer.isRunning) {
      timer.pause();
      return;
    }
    timer.resume();
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
        <GradingView
          results={testResults}
          onGradeChange={changeGrade}
          onFinish={finishGrading}
        />
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      {restoreDialogOpen && (
        <RestoreSessionDialog
          remainingSeconds={savedRemainingSeconds}
          showRemainingTime={!isUnlimitedTime}
          onResume={resumeSavedSession}
          onRestart={restartSession}
        />
      )}

      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">시험</h1>

          <div className="flex items-center gap-4">
            {!isUnlimitedTime && (
              <ExamTimer
                remainingSeconds={timer.remainingSeconds}
                isRunning={timer.isRunning}
                onToggle={toggleTimer}
              />
            )}

            <Button onClick={submit}>제출하기</Button>
          </div>
        </div>

        <div className="space-y-6">
          <QuestionList
            cards={cards}
            answers={answers}
            onAnswerChange={changeAnswer}
          />
        </div>
      </div>

      <AnswerNavPanel cards={cards} answers={answers} />
    </BaseLayout>
  );
};
