import MemoizeMode from "@/pages/learn/memoize-mode";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cardsets/learning/")({
  component: RouteComponent,
});

function RouteComponent() {
  //   const { state } = useLocation();
  //   console.log("STATE:", state);
  //   IDEA ) 시험이나 암기 중에 나가짐 >> 그럼 그거 sessionStorage에 저장해놓고 복구할까 말까? 물어보셈.

  // 1. state가 없는 경우[설정이 안돼있으므로 뒤로 가서 다시 설정하라고 안내해야함.]

  //   if (!state)
  //     return (
  //       <div>
  //         학습에 대한 설정값이 올바르지 않습니다. 학습 모드를 다시 설정하고
  //         들어와주세요!
  //       </div>
  //     );

  // 2. state가 암기 모드인경우
  return <MemoizeMode />;

  // 3. state가 시험 모드인경우
}
