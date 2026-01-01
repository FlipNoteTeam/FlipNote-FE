import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import BaseLayout from "@/shared/layouts/base-layout";
import FlipCard from "@/shared/components/flip-card";
import { Button } from "@/shared/components/button";
// import { useLocation } from "@tanstack/react-router";

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
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-006",
    question: "이벤트 버블링이란?",
    answer: "이벤트가 가장 안쪽 요소에서 바깥쪽 요소로 전파되는 현상이다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-007",
    question: "useEffect의 실행 시점은?",
    answer: "렌더링이 완료된 후 실행된다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-008",
    question: "불변성이 중요한 이유는?",
    answer: "상태 변경 추적이 쉬워지고, 예측 가능한 코드 작성이 가능해진다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-009",
    question: "JWT의 단점은?",
    answer: "토큰 폐기가 어렵고, 크기가 커질 수 있다.",
  },
  {
    key: "a1f3c9b2-1e4a-4d8b-9c12-010",
    question: "Debounce와 Throttle의 차이는?",
    answer:
      "Debounce는 마지막 호출만 실행하고, Throttle은 일정 주기로 실행한다.",
  },
];

// const MOCKED_DATA = {
//   cardsetId: "cardsetId",
//   problemSet: MOCKED_PROBLEMSET.map((problem) => problem.key),
//   state: { current: "a1f3c9b2-1e4a-4d8b-9c12-001" },
// };

const CardCarousel = ({
  autoPlay = false,
  duration,
  repeat = false,
}:
  | { autoPlay?: false; duration?: never; repeat?: never }
  | { autoPlay: true; duration: number; repeat?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const moveNext = useCallback(() => {
    if (repeat) {
      setCurrentIndex((i) => (i + 1) % MOCKED_PROBLEMSET.length);
    } else {
      if (currentIndex >= MOCKED_PROBLEMSET.length - 1) return;
      setCurrentIndex((i) => Math.min(i + 1, MOCKED_PROBLEMSET.length - 1));
    }
  }, [currentIndex, repeat]);

  const movePrev = useCallback(() => {
    if (repeat) {
      setCurrentIndex(
        (i) => (i - 1 + MOCKED_PROBLEMSET.length) % MOCKED_PROBLEMSET.length
      );
    } else {
      if (currentIndex < 0) return;
      setCurrentIndex((i) => Math.max(i - 1, 0));
    }
  }, [currentIndex, repeat]);

  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(() => {
        moveNext();
      }, duration);
      return () => clearInterval(interval);
    }
  }, [autoPlay, duration, moveNext]);

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-gray-100">
      {MOCKED_PROBLEMSET.map((card, index) => {
        const relativeIndex = index - currentIndex;
        const isMiddle = relativeIndex === 0;
        if (relativeIndex < -1 || relativeIndex > 1) return null;

        return (
          <motion.div
            key={card.key}
            className="absolute left-1/2 top-1/2 w-64 h-40
                       -translate-x-1/2 -translate-y-1/2
                       flex items-center justify-center"
            animate={{
              x: relativeIndex * 400,
              scale: isMiddle ? 1 : 0.8,
              opacity: isMiddle ? 1 : 0.6,
              zIndex: isMiddle ? 10 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <FlipCard frontNode={card.question} backNode={card.answer} />
          </motion.div>
        );
      })}

      {/* Controls */}
      {!autoPlay && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
          <Button
            onClick={movePrev}
            className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-40"
            disabled={currentIndex === 0}
          >
            이전
          </Button>
          <Button
            onClick={moveNext}
            className="px-4 py-2 rounded bg-gray-800 text-white disabled:opacity-40"
            disabled={currentIndex === MOCKED_PROBLEMSET.length - 1}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
};

const MemoizeMode = () => {
  // @TODO STATE OPTION 타입 정의
  // const { state } = useLocation();

  // console.log(":::", state);
  // 로딩은 - 질문지 준비 중..같은 걸로

  // 2. 블라인드 모드 - 질문만 쭉-보여주는 모드(원하는 곳에서만 답변 눌러서 보기)

  return (
    <BaseLayout>
      {/* // 1. 일반 모드 - 질문/답 순서로 보여주는 모드 */}

      <CardCarousel autoPlay duration={10 * 1000} repeat />
    </BaseLayout>
  );
};

export default MemoizeMode;
