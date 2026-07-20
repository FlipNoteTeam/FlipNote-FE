import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { questionAnchorId } from "@/features/test-mode/model/constants";
import type { Answer } from "@/features/test-mode/model/types";
import type { CardResponse } from "@/shared/apis/card";

type AnswerNavPanelProps = {
  cards: CardResponse[];
  answers: Answer[];
};

/** 문항별 응답 여부를 보여주고 해당 문항으로 스크롤시키는 플로팅 패널 */
export const AnswerNavPanel = ({ cards, answers }: AnswerNavPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const scrollToQuestion = (cardId: string) => {
    document
      .getElementById(questionAnchorId(cardId))
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      <button
        onClick={toggleOpen}
        aria-label={isOpen ? "답변 현황 접기" : "답변 현황 펼치기"}
        className="bg-white border-y border-l shadow-md rounded-l-lg h-10 w-5 flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        {isOpen ? (
          <ChevronRight className="h-3 w-3 text-gray-500" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-500" />
        )}
      </button>
      <div
        className={`bg-white border shadow-md rounded-tl-lg rounded-bl-lg overflow-hidden transition-all duration-200 ${
          isOpen ? "w-12" : "w-0"
        }`}
      >
        <div className="p-2 flex flex-col items-center gap-1.5 max-h-[calc(100dvh-8rem)] overflow-y-auto">
          {cards.map((card, index) => {
            const isAnswered = !!answers
              .find((answer) => answer.questionKey === card.id)
              ?.userAnswer.trim();

            const handleClick = () => scrollToQuestion(card.id);

            return (
              <button
                key={card.id}
                onClick={handleClick}
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
  );
};
