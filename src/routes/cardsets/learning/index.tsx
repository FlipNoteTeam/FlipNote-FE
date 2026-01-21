import MemoizeMode from "@/pages/learn/memoize-mode";
import TestMode from "@/pages/learn/test-mode";
import { createFileRoute, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/cardsets/learning/")({
  component: RouteComponent,
});

function RouteComponent() {
  // location.state에서 학습 설정 가져오기
  const { state } = useLocation();
  const studySettings = state as { mode?: "memorize" | "test" } | null;

  console.log("Learning page - Received settings:", studySettings);
  console.log("Study mode:", studySettings?.mode);

  // 1. state가 없는 경우[설정이 안돼있으므로 뒤로 가서 다시 설정하라고 안내해야함.]
  if (!studySettings || !studySettings.mode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            학습에 대한 설정값이 올바르지 않습니다.
          </p>
          <p className="text-gray-600">학습 모드를 다시 설정하고 들어와주세요!</p>
        </div>
      </div>
    );
  }

  // 2. state가 암기 모드인경우
  if (studySettings.mode === "memorize") {
    return <MemoizeMode settings={studySettings} />;
  }

  // 3. state가 시험 모드인경우
  if (studySettings.mode === "test") {
    return <TestMode settings={studySettings} />;
  }

  return null;
}
