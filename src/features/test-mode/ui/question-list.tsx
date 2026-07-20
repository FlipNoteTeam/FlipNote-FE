import type { ChangeEvent } from "react";
import { questionAnchorId } from "@/features/test-mode/model/constants";
import type { Answer } from "@/features/test-mode/model/types";
import type { CardResponse } from "@/shared/apis/card";
import { Card } from "@/shared/components/card";
import { Textarea } from "@/shared/components/textarea";

type QuestionListProps = {
  cards: CardResponse[];
  answers: Answer[];
  onAnswerChange: (questionKey: string, value: string) => void;
};

/** 문항과 답변 입력란 목록 */
export const QuestionList = ({
  cards,
  answers,
  onAnswerChange,
}: QuestionListProps) => (
  <Card className="rounded-xs">
    {cards.map((card, index) => {
      const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        onAnswerChange(card.id, event.target.value);
      };

      return (
        <div
          key={`card-${card.id}`}
          id={questionAnchorId(card.id)}
          className="px-2 py-6 space-y-4"
        >
          <h3 className="text-lg font-semibold">
            {index + 1}. {card.question}
          </h3>
          <Textarea
            placeholder="답변을 입력하세요"
            value={
              answers.find((answer) => answer.questionKey === card.id)
                ?.userAnswer ?? ""
            }
            onChange={handleChange}
            className="min-h-[120px] resize-none"
          />
        </div>
      );
    })}
  </Card>
);
