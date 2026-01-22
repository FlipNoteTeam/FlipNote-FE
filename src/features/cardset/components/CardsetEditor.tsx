import { useState, useEffect, useRef } from "react";
import { Card } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { Label } from "@/shared/components/label";
import { useYjs } from "@/shared/socket/useYjs";
import type { CardData } from "@/shared/socket/card-types";
import * as Y from "yjs";
import { nestClient } from "@/shared/apis/fetch";

type CardsetEditorProps = {
  cardsetId: string;
};

export function CardsetEditor({ cardsetId }: CardsetEditorProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [focusedField, setFocusedField] = useState<
    "question" | "answer" | null
  >(null);

  // Y.Text 동기화를 위한 로컬 상태
  const [questionValue, setQuestionValue] = useState("");
  const [answerValue, setAnswerValue] = useState("");
  const questionTextRef = useRef<Y.Text | null>(null);
  const answerTextRef = useRef<Y.Text | null>(null);
  const isUpdatingRef = useRef(false);

  // 소켓 연결 전 fallback용 로컬 카드
  const [localCards, setLocalCards] = useState<CardData[]>([
    {
      id: "local-initial",
      question: "",
      answer: "",
    },
  ]);

  // Yjs 협업 기능 - 카드셋 전체를 하나의 Doc으로 관리
  const {
    isConnected,
    hasAccess,
    connectionError,
    cards: yjsCards,
    awarenessStates,
    connect,
    addCard,
    deleteCard,
    setAwareness,
    getCardQuestionText,
    getCardAnswerText,
  } = useYjs({
    cardsetId: cardsetId,
    userId: `user-1`, // 임시 사용자 ID
    autoConnect: true,
  });

  // 좌측 프리뷰용 실시간 카드 상태
  const [previewCards, setPreviewCards] = useState<CardData[]>([]);

  // 연결된 경우 Yjs 카드 사용, 아니면 로컬 카드 사용
  const cards = hasAccess && yjsCards.length > 0 ? yjsCards : localCards;
  const currentCard = cards[currentCardIndex];

  // Yjs 연결 시 초기 카드가 없으면 추가
  useEffect(() => {
    if (hasAccess && yjsCards.length === 0) {
      addCard({ question: "", answer: "" });
    }
  }, [hasAccess, yjsCards.length, addCard]);

  // 좌측 프리뷰용 실시간 업데이트: 모든 카드의 Y.Text에 observer 등록
  useEffect(() => {
    if (!hasAccess || cards.length === 0) {
      setPreviewCards(localCards);
      return;
    }

    // 초기 프리뷰 카드 설정
    setPreviewCards(cards);

    const observers: Array<() => void> = [];

    // 각 카드의 question과 answer Y.Text에 observer 등록
    cards.forEach((_, index) => {
      const questionText = getCardQuestionText(index);
      const answerText = getCardAnswerText(index);

      if (questionText && answerText) {
        const updatePreview = () => {
          setPreviewCards((prev) => {
            const newCards = [...prev];
            if (newCards[index]) {
              newCards[index] = {
                ...newCards[index],
                question: questionText.toString(),
                answer: answerText.toString(),
              };
            }
            return newCards;
          });
        };

        questionText.observe(updatePreview);
        answerText.observe(updatePreview);

        observers.push(() => {
          questionText.unobserve(updatePreview);
          answerText.unobserve(updatePreview);
        });
      }
    });

    return () => {
      observers.forEach((cleanup) => cleanup());
    };
  }, [hasAccess, cards.length, getCardQuestionText, getCardAnswerText, localCards]);

  // 카드 전환 시 값 로드 및 Y.Text observe 설정
  useEffect(() => {
    if (!currentCard) return;

    if (hasAccess) {
      // Yjs 모드: Y.Text observe 설정
      const questionText = getCardQuestionText(currentCardIndex);
      const answerText = getCardAnswerText(currentCardIndex);

      if (!questionText || !answerText) return;

      questionTextRef.current = questionText;
      answerTextRef.current = answerText;

      // 초기 값 설정
      setQuestionValue(questionText.toString());
      setAnswerValue(answerText.toString());

      // Y.Text 변경 감지
      const questionObserver = () => {
        if (!isUpdatingRef.current) {
          setQuestionValue(questionText.toString());
        }
      };

      const answerObserver = () => {
        if (!isUpdatingRef.current) {
          setAnswerValue(answerText.toString());
        }
      };

      questionText.observe(questionObserver);
      answerText.observe(answerObserver);

      return () => {
        questionText.unobserve(questionObserver);
        answerText.unobserve(answerObserver);
      };
    } else {
      // 로컬 모드: 로컬 카드 값 로드
      setQuestionValue(currentCard.question);
      setAnswerValue(currentCard.answer);
    }
  }, [
    currentCardIndex,
    hasAccess,
    currentCard,
    getCardQuestionText,
    getCardAnswerText,
  ]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (hasAccess && questionTextRef.current) {
      // Yjs 연결 시: Y.Text 업데이트
      const oldValue = questionValue;
      isUpdatingRef.current = true;

      const delta = getDelta(oldValue, newValue);
      applyDelta(questionTextRef.current, delta);

      setQuestionValue(newValue);
      isUpdatingRef.current = false;
    } else {
      // 로컬 모드: localCards 상태 업데이트
      setQuestionValue(newValue);
      setLocalCards((prev) =>
        prev.map((card, idx) =>
          idx === currentCardIndex ? { ...card, question: newValue } : card
        )
      );
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    if (hasAccess && answerTextRef.current) {
      // Yjs 연결 시: Y.Text 업데이트
      const oldValue = answerValue;
      isUpdatingRef.current = true;

      const delta = getDelta(oldValue, newValue);
      applyDelta(answerTextRef.current, delta);

      setAnswerValue(newValue);
      isUpdatingRef.current = false;
    } else {
      // 로컬 모드: localCards 상태 업데이트
      setAnswerValue(newValue);
      setLocalCards((prev) =>
        prev.map((card, idx) =>
          idx === currentCardIndex ? { ...card, answer: newValue } : card
        )
      );
    }
  };

  const handleAddCard = () => {
    if (hasAccess) {
      // Yjs 모드: Yjs에 카드 추가
      addCard({
        question: "새 질문을 입력하세요",
        answer: "새 답변을 입력하세요",
      });
    } else {
      // 로컬 모드: localCards에 카드 추가
      setLocalCards((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          question: "새 질문을 입력하세요",
          answer: "새 답변을 입력하세요",
        },
      ]);
    }
    setCurrentCardIndex(cards.length);
  };

  const handleDeleteCard = (index: number) => {
    if (cards.length <= 1) return;

    if (hasAccess) {
      // Yjs 모드: Yjs에서 카드 삭제
      deleteCard(index);
    } else {
      // 로컬 모드: localCards에서 카드 삭제
      setLocalCards((prev) => prev.filter((_, i) => i !== index));
    }

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

  // Awareness에서 다른 사용자들 추출 (자신 제외)
  const collaborators = Array.from(awarenessStates.entries())
    .filter(([clientId]) => clientId !== awarenessStates.get(0)?.clientId) // 자신 제외
    .map(([clientId, state]) => ({
      clientId,
      user: state.user || { id: `user-${clientId}`, name: `User ${clientId}` },
      field: state.field as "question" | "answer" | undefined,
      cardIndex: state.cardIndex as number | undefined,
    }))
    .filter((collab) => collab.user); // user 정보가 있는 것만

  // 사용자별 고유한 색상 생성
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const hash = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // 현재 카드를 편집 중인 협업자 찾기
  const currentCardCollaborators = collaborators.filter(
    (collab) => collab.cardIndex === currentCardIndex
  );
  const questionEditors = currentCardCollaborators.filter(
    (collab) => collab.field === "question"
  );
  const answerEditors = currentCardCollaborators.filter(
    (collab) => collab.field === "answer"
  );

  return (
    <div className="min-h-dvh h-screen flex bg-gray-50">
      {/* Left Sidebar - Card List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-md font-semibold text-gray-900">카드 목록</h2>
            <Button
              onClick={handleAddCard}
              size="sm"
              variant="ghost"
              className="px-4 py-2"
            >
              + 추가
            </Button>
          </div>

          {/* 협업 상태 표시 */}
          <div className="flex flex-col gap-3">
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

            {/* 협업자 표시 */}
            {isConnected && hasAccess && collaborators.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">협업 중:</span>
                <div className="flex -space-x-2">
                  {collaborators.map((collab) => (
                    <div
                      key={collab.clientId}
                      className="relative group"
                      title={`${collab.user.name}${collab.cardIndex !== undefined ? ` - 카드 ${collab.cardIndex + 1} ${collab.field === "question" ? "질문" : "답변"} 편집 중` : ""}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full ${getUserColor(collab.user.id)} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm`}
                      >
                        {collab.user.name.charAt(0).toUpperCase()}
                      </div>
                      {/* 툴팁 */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        {collab.user.name}
                        {collab.cardIndex !== undefined && (
                          <div className="text-gray-300">
                            카드 {collab.cardIndex + 1} ·{" "}
                            {collab.field === "question" ? "질문" : "답변"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(hasAccess ? previewCards : localCards).map((card, index) => {
            // 이 카드를 편집 중인 협업자 찾기
            const editingCollaborators = collaborators.filter(
              (collab) => collab.cardIndex === index
            );
            const isBeingEdited = editingCollaborators.length > 0;

            return (
              <Card
                key={card.id}
                className={`cursor-pointer transition-all duration-200 ${
                  index === currentCardIndex
                    ? "ring-2 ring-blue-500 border-blue-200 bg-blue-50"
                    : isBeingEdited
                      ? "ring-2 ring-green-400 border-green-200 bg-green-50"
                      : "hover:border-gray-300 hover:shadow-md"
                }`}
                onClick={() => setCurrentCardIndex(index)}
              >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    카드 {index + 1}
                  </span>
                  {(hasAccess ? previewCards : localCards).length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(index);
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

                {/* 협업자 편집 중 표시 */}
                {isBeingEdited && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-green-600 font-medium">
                        편집 중:
                      </span>
                      {editingCollaborators.map((collab) => (
                        <span
                          key={collab.clientId}
                          className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
                        >
                          {collab.user.name} ({collab.field === "question" ? "질문" : "답변"})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col ml-96">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              카드 {currentCardIndex + 1} 편집
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
              <span>총 {cards.length}개 카드</span>
              <Button
                type={"button"}
                onClick={(e) => {
                  e.preventDefault();
                  nestClient.post(`/api/v1/card-sets/${cardsetId}`);
                }}
              >
                저장하기
              </Button>
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
                    className={`p-10 rounded-2xl border-3 transition-all duration-200 relative ${
                      focusedField === "question"
                        ? "border-blue-500 bg-blue-50 shadow-2xl"
                        : questionEditors.length > 0
                          ? "border-green-500 bg-green-50 shadow-lg"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-lg"
                    }`}
                  >
                    {/* 협업자 표시 뱃지 */}
                    {questionEditors.length > 0 && (
                      <div className="absolute -top-3 -right-3 flex -space-x-1">
                        {questionEditors.map((editor) => (
                          <div
                            key={editor.clientId}
                            className={`w-8 h-8 rounded-full ${getUserColor(editor.user.id)} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md`}
                            title={`${editor.user.name} 편집 중`}
                          >
                            {editor.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                    <Label
                      htmlFor="question"
                      className="text-3xl font-bold mb-8 block text-gray-800"
                    >
                      질문
                    </Label>
                    <Textarea
                      id="question"
                      value={questionValue}
                      onChange={handleQuestionChange}
                      onFocus={() => {
                        setFocusedField("question");
                        if (hasAccess)
                          setAwareness("question", currentCardIndex);
                      }}
                      onBlur={() => setFocusedField(null)}
                      className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                      placeholder="질문을 입력하세요..."
                    />
                  </div>

                  {/* Answer Section */}
                  <div
                    className={`p-10 rounded-2xl border-3 transition-all duration-200 relative ${
                      focusedField === "answer"
                        ? "border-blue-500 bg-blue-50 shadow-2xl"
                        : answerEditors.length > 0
                          ? "border-green-500 bg-green-50 shadow-lg"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-lg"
                    }`}
                  >
                    {/* 협업자 표시 뱃지 */}
                    {answerEditors.length > 0 && (
                      <div className="absolute -top-3 -right-3 flex -space-x-1">
                        {answerEditors.map((editor) => (
                          <div
                            key={editor.clientId}
                            className={`w-8 h-8 rounded-full ${getUserColor(editor.user.id)} flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md`}
                            title={`${editor.user.name} 편집 중`}
                          >
                            {editor.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                    )}
                    <Label
                      htmlFor="answer"
                      className="text-3xl font-bold mb-8 block text-gray-800"
                    >
                      답변
                    </Label>
                    <Textarea
                      id="answer"
                      value={answerValue}
                      onChange={handleAnswerChange}
                      onFocus={() => {
                        setFocusedField("answer");
                        if (hasAccess) setAwareness("answer", currentCardIndex);
                      }}
                      onBlur={() => setFocusedField(null)}
                      className="w-full min-h-56 text-2xl leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none placeholder-gray-400"
                      placeholder="답변을 입력하세요..."
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

// 두 문자열의 차이를 계산
function getDelta(
  oldStr: string,
  newStr: string
): { index: number; delete: number; insert: string } {
  let i = 0;
  const minLen = Math.min(oldStr.length, newStr.length);

  // 앞에서부터 같은 부분 찾기
  while (i < minLen && oldStr[i] === newStr[i]) {
    i++;
  }

  let j = 0;
  // 뒤에서부터 같은 부분 찾기
  while (
    j < minLen - i &&
    oldStr[oldStr.length - 1 - j] === newStr[newStr.length - 1 - j]
  ) {
    j++;
  }

  return {
    index: i,
    delete: oldStr.length - i - j,
    insert: newStr.slice(i, newStr.length - j),
  };
}

// Y.Text에 delta 적용
function applyDelta(
  ytext: Y.Text,
  delta: { index: number; delete: number; insert: string }
) {
  if (delta.delete > 0) {
    ytext.delete(delta.index, delta.delete);
  }
  if (delta.insert.length > 0) {
    ytext.insert(delta.index, delta.insert);
  }
}
