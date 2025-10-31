import { useState, useEffect } from "react";
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Label } from "@/shared/components/label";
import { useYjs } from "@/shared/socket/useYjs";

interface CardData {
  id: number;
  question: string;
  answer: string;
}

type CardsetEditorProps = {
  cardsetId: string;
};

export function CardsetEditor({ cardsetId }: CardsetEditorProps) {
  const [cards, setCards] = useState<CardData[]>([
    { id: 1, question: "", answer: "" },
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<
    "question" | "answer" | null
  >(null);

  // Yjs 협업 기능
  const {
    isConnected,
    hasAccess,
    connectionError,
    questionText,
    answerText,
    connect,
    updateQuestion,
    updateAnswer,
    setAwareness,
  } = useYjs({
    documentId: cardsetId,
    userId: `user-1`, // 임시 사용자 ID
    autoConnect: true,
  });

  const currentCard = cards[currentCardIndex];

  const updateCard = (field: "question" | "answer", value: string) => {
    // Yjs로 실시간 동기화
    if (hasAccess) {
      if (field === "question") {
        updateQuestion(value);
      } else {
        updateAnswer(value);
      }
    }

    // 로컬 상태도 업데이트
    setCards((prev) =>
      prev.map((card, index) =>
        index === currentCardIndex ? { ...card, [field]: value } : card
      )
    );
  };

  const addCard = () => {
    const newCard: CardData = {
      id: Date.now(),
      question: "새 질문을 입력하세요",
      answer: "새 답변을 입력하세요",
    };
    setCards((prev) => [...prev, newCard]);
    setCurrentCardIndex(cards.length);
  };

  const deleteCard = (index: number) => {
    if (cards.length <= 1) return;
    setCards((prev) => prev.filter((_, i) => i !== index));
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(cards.length - 2);
    }
  };

  // Yjs 텍스트와 로컬 상태 동기화
  useEffect(() => {
    if (hasAccess && isConnected) {
      setCards((prev) =>
        prev.map((card, index) =>
          index === currentCardIndex
            ? { ...card, question: questionText, answer: answerText }
            : card
        )
      );
    }
  }, [questionText, answerText, hasAccess, isConnected, currentCardIndex]);

  console.log("?!!", isConnected, hasAccess);
  // 협업 연결 시도
  const handleCollaborationConnect = async () => {
    try {
      const success = await connect();
      if (success) {
        console.log("협업 모드 연결 성공");
      }
    } catch (error) {
      console.error("협업 모드 연결 실패:", error);
    }
  };

  return (
    <div className="min-h-dvh h-screen flex bg-gray-50">
      {/* Left Sidebar - Card List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-gray-900">카드 목록</h2>
            <Button
              onClick={addCard}
              size="sm"
              variant="ghost"
              className="px-4 py-2"
            >
              + 추가
            </Button>
          </div>

          {/* 협업 상태 표시 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected && hasAccess
                  ? "bg-green-500"
                  : connectionError
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-gray-500">
              {isConnected && hasAccess
                ? "협업 모드 활성"
                : connectionError
                  ? "연결 실패"
                  : "협업 모드 비활성"}
            </span>
            {!isConnected && (
              <Button
                onClick={handleCollaborationConnect}
                size="sm"
                variant="outline"
                className="ml-2 px-2 py-1 text-xs"
              >
                연결
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              className={`cursor-pointer transition-all duration-200 ${
                index === currentCardIndex
                  ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
                  : "hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() => setCurrentCardIndex(index)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    카드 {index + 1}
                  </span>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCard(index);
                      }}
                      className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      질문
                    </p>
                    <p className="text-sm text-gray-900 line-clamp-2 leading-relaxed">
                      {card.question}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      답변
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {card.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              카드 {currentCardIndex + 1} 편집
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              <span>총 {cards.length}개 카드</span>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 p-16 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <Card className="p-12 bg-white shadow-xl rounded-2xl border-0">
              <div className="space-y-16">
                {/* Question Section */}
                <div
                  className={`p-10 rounded-2xl border-3 transition-all duration-200 ${
                    focusedField === "question"
                      ? "border-blue-500 bg-blue-50 shadow-2xl"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-lg"
                  }`}
                >
                  <Label
                    htmlFor="question"
                    className="text-3xl font-bold mb-8 block text-gray-800"
                  >
                    질문
                  </Label>
                  <Textarea
                    id="question"
                    value={
                      hasAccess && isConnected
                        ? questionText
                        : currentCard.question
                    }
                    onChange={(e) => updateCard("question", e.target.value)}
                    onFocus={() => {
                      setFocusedField("question");
                      if (hasAccess) setAwareness("question");
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                    placeholder="질문을 입력하세요..."
                    disabled={isConnected && !hasAccess}
                  />
                </div>

                {/* Answer Section */}
                <div
                  className={`p-10 rounded-2xl border-3 transition-all duration-200 ${
                    focusedField === "answer"
                      ? "border-blue-500 bg-blue-50 shadow-2xl"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-lg"
                  }`}
                >
                  <Label
                    htmlFor="answer"
                    className="text-3xl font-bold mb-8 block text-gray-800"
                  >
                    답변
                  </Label>
                  <Textarea
                    id="answer"
                    value={
                      hasAccess && isConnected ? answerText : currentCard.answer
                    }
                    onChange={(e) => updateCard("answer", e.target.value)}
                    onFocus={() => {
                      setFocusedField("answer");
                      if (hasAccess) setAwareness("answer");
                    }}
                    onBlur={() => setFocusedField(null)}
                    className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                    placeholder="답변을 입력하세요..."
                    disabled={isConnected && !hasAccess}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
