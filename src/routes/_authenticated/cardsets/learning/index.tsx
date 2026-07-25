import { MemoizeMode } from "@/features/memoize-mode";
import { TestMode } from "@/features/test-mode";
import { createFileRoute, useLocation } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/cardsets/learning/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "학습 | FlipNote" },
      {
        name: "description",
        content: "카드셋을 활용하여 학습을 진행하세요",
      },
    ],
  }),
});

function RouteComponent() {
  const { state } = useLocation();
  const { groupId, cardsetId, settings } = state;

  if (!settings || !groupId || !cardsetId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            학습에 대한 설정값이 올바르지 않습니다.
          </p>
          <p className="text-gray-600">
            학습 모드를 다시 설정하고 들어와주세요!
          </p>
        </div>
      </div>
    );
  }

  if (settings.mode === "memorize") {
    return <MemoizeMode settings={{ ...settings, groupId, cardsetId }} />;
  }

  if (settings.mode === "test") {
    return <TestMode settings={{ ...settings, groupId, cardsetId }} />;
  }

  return null;
}
