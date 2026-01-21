import { useState, useEffect } from "react";
import BaseLayout from "@/shared/layouts/base-layout";
import { useLocation } from "@tanstack/react-router";
import type { TestSettings } from "@/features/setting-study-mode/model/form.schema";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Card } from "@/shared/components/card";
import { useTimer } from "@/shared/hooks/use-timer";
import { Clock, Play, Pause } from "lucide-react";

// TODO: 실제 문제 세트는 API에서 가져와야 함
const MOCKED_PROBLEMSET = [
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-001",
    question: "HTTP와 HTTPS의 차이는 무엇인가?",
    answer: "HTTPS는 HTTP에 TLS/SSL 암호화를 추가하여 통신 내용을 보호한다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-002",
    question: "CSR과 SSR의 차이점은?",
    answer:
      "CSR은 브라우저에서 렌더링하고, SSR은 서버에서 HTML을 생성해 전달한다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-003",
    question: "REST API의 핵심 원칙은?",
    answer: "무상태성, 자원 기반 URI, HTTP 메서드의 의미적 사용이다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-004",
    question: "브라우저의 로컬 스토리지 특징은?",
    answer: "영구 저장되며, 탭이나 브라우저를 닫아도 데이터가 유지된다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-005",
    question: "쿠키와 세션의 차이는?",
    answer: "쿠키는 클라이언트에 저장되고, 세션은 서버에서 관리된다.",
  },
];

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

const TestMode = () => {
  const { state } = useLocation();
  const studySettings = state as unknown as StudyState;

  // 답변 저장
  const [answers, setAnswers] = useState<Answer[]>(
    MOCKED_PROBLEMSET.map((q) => ({ questionKey: q.key, userAnswer: "" }))
  );

  // 시험 진행 단계: 'answering' | 'grading'
  const [phase, setPhase] = useState<"answering" | "grading">("answering");

  // 채점 결과
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // 타이머 설정
  const testDurationMinutes = studySettings?.testTimeMinutes ?? 30;
  const isUnlimitedTime = studySettings?.isUnlimitedTime ?? false;

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionKey === questionKey ? { ...a, userAnswer: value } : a
      )
    );
  };

  const handleSubmit = () => {
    // 채점 페이지로 이동
    const results: TestResult[] = MOCKED_PROBLEMSET.map((q) => {
      const userAnswer =
        answers.find((a) => a.questionKey === q.key)?.userAnswer || "";
      return {
        questionKey: q.key,
        question: q.question,
        correctAnswer: q.answer,
        userAnswer,
        isCorrect: false, // 초기값, 사용자가 수동으로 채점
      };
    });
    setTestResults(results);
    setPhase("grading");
  };

  // 타이머 초기화 (handleSubmit 이후에 선언)
  const timer = useTimer({
    onComplete: () => {
      // 시간 종료 시 자동 제출
      alert("시험 시간이 종료되었습니다. 자동으로 제출됩니다.");
      handleSubmit();
    },
  });

  // 타이머 시작
  useEffect(() => {
    if (!isUnlimitedTime && phase === "answering") {
      timer.start(testDurationMinutes * 60);
    }
    return () => {
      timer.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGradeChange = (questionKey: string, isCorrect: boolean) => {
    setTestResults((prev) =>
      prev.map((r) => (r.questionKey === questionKey ? { ...r, isCorrect } : r))
    );
  };

  const handleFinish = () => {
    const correctCount = testResults.filter((r) => r.isCorrect).length;
    const totalCount = testResults.length;
    const score = Math.round((correctCount / totalCount) * 100);

    alert(
      `채점이 완료되었습니다!\n정답: ${correctCount}/${totalCount}\n점수: ${score}점`
    );
    // TODO: 결과 저장 및 결과 페이지로 이동
  };

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

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <BaseLayout>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* 헤더와 타이머 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">시험 모드</h1>

          <div className="flex items-center gap-4">
            {/* 타이머 */}
            {!isUnlimitedTime && (
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600" />
                <span
                  className={`text-lg font-mono font-semibold ${
                    timer.remainingSeconds < 60 ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {formatTime(timer.remainingSeconds)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (timer.isRunning ? timer.pause() : timer.resume())}
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
          {MOCKED_PROBLEMSET.map((card, index) => (
            <Card key={card.key} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">
                {index + 1}. {card.question}
              </h3>
              <Textarea
                placeholder="답변을 입력하세요..."
                value={
                  answers.find((a) => a.questionKey === card.key)?.userAnswer ||
                  ""
                }
                onChange={(e) => handleAnswerChange(card.key, e.target.value)}
                className="min-h-[120px]"
              />
            </Card>
          ))}
        </div>
      </div>
    </BaseLayout>
  );
};

export default TestMode;
