import type { TestResult } from "@/features/test-mode/model/types";
import { Button } from "@/shared/components/button";
import { Card } from "@/shared/components/card";

type GradingViewProps = {
  results: TestResult[];
  onGradeChange: (questionKey: string, isCorrect: boolean) => void;
  onFinish: () => void;
};

/** 제출 후 정답을 확인하며 스스로 채점하는 화면 */
export const GradingView = ({
  results,
  onGradeChange,
  onFinish,
}: GradingViewProps) => (
  <div className="max-w-4xl mx-auto py-8 space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">채점하기</h1>
      <Button onClick={onFinish}>채점 완료</Button>
    </div>

    <div className="space-y-6">
      {results.map((result, index) => {
        const markCorrect = () => onGradeChange(result.questionKey, true);
        const markWrong = () => onGradeChange(result.questionKey, false);

        return (
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
                onClick={markCorrect}
                className="flex-1"
              >
                정답
              </Button>
              <Button
                variant={!result.isCorrect ? "default" : "outline"}
                onClick={markWrong}
                className="flex-1"
              >
                오답
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  </div>
);
