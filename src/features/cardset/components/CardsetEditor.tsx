import { useState, useEffect } from "react";
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Label } from "@/shared/components/label";
import { useYjs } from "@/shared/socket/useYjs";

type CardsetEditorProps = {
  cardsetId: string;
};

export function CardsetEditor({ cardsetId }: CardsetEditorProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<
    "question" | "answer" | null
  >(null);

  // Yjs 협업 기능 - 카드셋 전체를 하나의 Doc으로 관리
  const {
    isConnected,
    hasAccess,
    connectionError,
    cards,
    connect,
    addCard,
    deleteCard,
    updateCardQuestion,
    updateCardAnswer,
    setAwareness,
  } = useYjs({
    documentId: cardsetId,
    userId: `user-1`, // 임시 사용자 ID
    autoConnect: true,
  });

  const currentCard = cards[currentCardIndex];

  // 카드가 없으면 초기 카드 추가
  useEffect(() => {
    if (hasAccess && cards.length === 0) {
      addCard({ question: "", answer: "" });
    }
  }, [hasAccess, cards.length, addCard]);

  const handleAddCard = () => {
    addCard({ question: "새 질문을 입력하세요", answer: "새 답변을 입력하세요" });
    setCurrentCardIndex(cards.length);
  };

  const handleDeleteCard = (index: number) => {
    if (cards.length <= 1) return;
    deleteCard(index);
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(Math.max(0, cards.length - 2));
    }
  };

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
              onClick={handleAddCard}
              size="sm"
              variant="ghost"
              className="px-4 py-2"
              disabled={!hasAccess}
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
                        handleDeleteCard(index);
                      }}
                      className="text-gray-400 hover:text-red-500 h-6 w-6 p-0"
                      disabled={!hasAccess}
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
                      {card.question || "질문을 입력하세요"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      답변
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {card.answer || "답변을 입력하세요"}
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
            {currentCard && (
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
                      value={currentCard.question}
                      onChange={(e) =>
                        updateCardQuestion(currentCardIndex, e.target.value)
                      }
                      onFocus={() => {
                        setFocusedField("question");
                        if (hasAccess) setAwareness("question", currentCardIndex);
                      }}
                      onBlur={() => setFocusedField(null)}
                      className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                      placeholder="질문을 입력하세요..."
                      disabled={!hasAccess}
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
                      value={currentCard.answer}
                      onChange={(e) =>
                        updateCardAnswer(currentCardIndex, e.target.value)
                      }
                      onFocus={() => {
                        setFocusedField("answer");
                        if (hasAccess)
                          setAwareness("answer", currentCardIndex);
                      }}
                      onBlur={() => setFocusedField(null)}
                      className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                      placeholder="답변을 입력하세요..."
                      disabled={!hasAccess}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
