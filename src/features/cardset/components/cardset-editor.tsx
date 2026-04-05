import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/button";
import { Textarea } from "@/shared/components/textarea";
import { useYjs } from "@/shared/socket/use-yjs";
import type { CardData } from "@/shared/socket/card-types";
import * as Y from "yjs";
import apiClient from "@/shared/apis/fetch";
import useAuthStore from "@/stores/use-auth-store";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Wifi,
  WifiOff,
  Loader2,
  Save,
  GripVertical,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";

type CardsetEditorProps = {
  cardsetId: string;
};

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 520;
const SIDEBAR_DEFAULT = 250;

export function CardsetEditor({ cardsetId }: CardsetEditorProps) {
  const user = useAuthStore(
    (state: ReturnType<typeof useAuthStore.getState>) => state.user,
  );
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

  // 사이드바 상태
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  // 소켓 연결 전 fallback용 로컬 카드
  const [localCards, setLocalCards] = useState<CardData[]>([
    { id: "local-initial", question: "", answer: "" },
  ]);

  // Yjs 협업 기능
  const {
    isConnected,
    hasAccess,
    hasSynced,
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
    cardsetId,
    userId: user ? String(user.userId) : "",
    autoConnect: true,
  });

  const [previewCards, setPreviewCards] = useState<CardData[]>([]);

  const cards = hasAccess && yjsCards.length > 0 ? yjsCards : localCards;
  const currentCard = cards[currentCardIndex];

  // 드래그 리사이즈
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = e.clientX - dragStartXRef.current;
      const newWidth = Math.min(
        SIDEBAR_MAX,
        Math.max(SIDEBAR_MIN, dragStartWidthRef.current + delta),
      );
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = sidebarWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  // Yjs 연결 시 초기 카드 (sync 수신 후에만 추가)
  useEffect(() => {
    if (hasSynced && hasAccess && yjsCards.length === 0) {
      addCard({ question: "", answer: "" });
    }
  }, [hasSynced, hasAccess, yjsCards.length, addCard]);

  // 프리뷰 카드 업데이트
  useEffect(() => {
    if (!hasAccess || cards.length === 0) {
      setPreviewCards(localCards);
      return;
    }
    setPreviewCards(cards);
    const observers: Array<() => void> = [];
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
    return () => observers.forEach((cleanup) => cleanup());
  }, [hasAccess, cards, getCardQuestionText, getCardAnswerText, localCards]);

  // 카드 전환 시 Y.Text observe 설정
  useEffect(() => {
    if (!currentCard) return;
    if (hasAccess) {
      const questionText = getCardQuestionText(currentCardIndex);
      const answerText = getCardAnswerText(currentCardIndex);
      if (!questionText || !answerText) return;
      questionTextRef.current = questionText;
      answerTextRef.current = answerText;
      setQuestionValue(questionText.toString());
      setAnswerValue(answerText.toString());
      const questionObserver = () => {
        if (!isUpdatingRef.current) setQuestionValue(questionText.toString());
      };
      const answerObserver = () => {
        if (!isUpdatingRef.current) setAnswerValue(answerText.toString());
      };
      questionText.observe(questionObserver);
      answerText.observe(answerObserver);
      return () => {
        questionText.unobserve(questionObserver);
        answerText.unobserve(answerObserver);
      };
    } else {
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
    setQuestionValue(newValue);
    if ((e.nativeEvent as InputEvent).isComposing) return;
    if (hasAccess && questionTextRef.current) {
      const oldValue = questionValue;
      isUpdatingRef.current = true;
      applyDelta(questionTextRef.current, getDelta(oldValue, newValue));
      isUpdatingRef.current = false;
    } else {
      setLocalCards((prev) =>
        prev.map((card, idx) =>
          idx === currentCardIndex ? { ...card, question: newValue } : card,
        ),
      );
    }
  };

  const handleQuestionCompositionEnd = (
    e: React.CompositionEvent<HTMLTextAreaElement>,
  ) => {
    const newValue = e.currentTarget.value;
    if (hasAccess && questionTextRef.current) {
      const oldValue = questionTextRef.current.toString();
      isUpdatingRef.current = true;
      applyDelta(questionTextRef.current, getDelta(oldValue, newValue));
      isUpdatingRef.current = false;
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setAnswerValue(newValue);
    if ((e.nativeEvent as InputEvent).isComposing) return;
    if (hasAccess && answerTextRef.current) {
      const oldValue = answerValue;
      isUpdatingRef.current = true;
      applyDelta(answerTextRef.current, getDelta(oldValue, newValue));
      isUpdatingRef.current = false;
    } else {
      setLocalCards((prev) =>
        prev.map((card, idx) =>
          idx === currentCardIndex ? { ...card, answer: newValue } : card,
        ),
      );
    }
  };

  const handleAnswerCompositionEnd = (
    e: React.CompositionEvent<HTMLTextAreaElement>,
  ) => {
    const newValue = e.currentTarget.value;
    if (hasAccess && answerTextRef.current) {
      const oldValue = answerTextRef.current.toString();
      isUpdatingRef.current = true;
      applyDelta(answerTextRef.current, getDelta(oldValue, newValue));
      isUpdatingRef.current = false;
    }
  };

  const handleAddCard = () => {
    if (hasAccess) {
      addCard({ question: "", answer: "" });
    } else {
      setLocalCards((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, question: "", answer: "" },
      ]);
    }
    setCurrentCardIndex(cards.length);
  };

  const handleDeleteCard = (index: number) => {
    if (cards.length <= 1) return;
    if (hasAccess) {
      deleteCard(index);
    } else {
      setLocalCards((prev) => prev.filter((_, i) => i !== index));
    }
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(Math.max(0, cards.length - 2));
    }
  };

  const handleCollaborationConnect = useCallback(async () => {
    try {
      await connect();
    } catch (error) {
      console.error("협업 모드 연결 실패:", error);
    }
  }, [connect]);

  // Awareness
  const selfClientId = (awarenessStates.get(0) as { clientId?: number })
    ?.clientId;
  const collaborators = Array.from(awarenessStates.entries())
    .filter(([clientId]) => clientId !== selfClientId)
    .map(([clientId, state]) => {
      const s = state as {
        user?: { id: string; name: string };
        field?: string;
        cardIndex?: number;
      };
      return {
        clientId,
        user: s.user || { id: `user-${clientId}`, name: `User ${clientId}` },
        field: s.field as "question" | "answer" | undefined,
        cardIndex: s.cardIndex as number | undefined,
      };
    })
    .filter((c) => c.user);

  const getUserColor = (userId: string) => {
    const colors = [
      "bg-violet-500",
      "bg-emerald-500",
      "bg-blue-500",
      "bg-pink-500",
      "bg-amber-500",
      "bg-cyan-500",
    ];
    const hash = userId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const currentCardCollaborators = collaborators.filter(
    (c) => c.cardIndex === currentCardIndex,
  );
  const questionEditors = currentCardCollaborators.filter(
    (c) => c.field === "question",
  );
  const answerEditors = currentCardCollaborators.filter(
    (c) => c.field === "answer",
  );

  const activeSidebarWidth = isSidebarCollapsed ? 56 : sidebarWidth;

  const connectionStatus =
    isConnected && hasAccess
      ? "connected"
      : connectionError
        ? "error"
        : "disconnected";

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden relative">
      {/* 소켓 연결 실패 오버레이 */}
      {connectionError && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-5 max-w-sm w-full mx-4">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <TriangleAlert className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-semibold text-base">연결 실패</p>
              <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                소켓 연결을 실패했습니다.
                <br />
                다시 시도해주세요.
              </p>
            </div>
            <Button
              onClick={handleCollaborationConnect}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </Button>
          </div>
        </div>
      )}

      {/* ── Left Sidebar ── */}
      <aside
        className="bg-white border-r border-gray-100 flex flex-col fixed top-0 left-0 h-screen z-10 transition-[width] duration-200 ease-in-out overflow-hidden"
        style={{ width: activeSidebarWidth }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-3 h-14 border-b border-gray-100 shrink-0">
          {!isSidebarCollapsed && (
            <>
              <span className="text-sm font-semibold text-gray-700 ml-1">
                카드 목록
              </span>
              <div className="flex items-center gap-1">
                {/* 협업 상태 */}
                <div
                  title={
                    connectionStatus === "connected"
                      ? "협업 모드 활성"
                      : connectionStatus === "error"
                        ? "연결 실패"
                        : "연결 중..."
                  }
                  className={`w-7 h-7 flex items-center justify-center rounded-md ${
                    connectionStatus === "connected"
                      ? "text-emerald-500"
                      : connectionStatus === "error"
                        ? "text-red-400"
                        : "text-gray-300"
                  }`}
                >
                  {connectionStatus === "connected" ? (
                    <Wifi className="w-3.5 h-3.5" />
                  ) : connectionStatus === "error" ? (
                    <WifiOff className="w-3.5 h-3.5" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                </div>
                {/* 카드 추가 */}
                <button
                  onClick={handleAddCard}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  title="카드 추가"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          {/* 접기/펴기 토글 */}
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className={`w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer shrink-0 ${isSidebarCollapsed ? "mx-auto" : ""}`}
            title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Card List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {(hasAccess ? previewCards : localCards).map((card, index) => {
            const editingCollaborators = collaborators.filter(
              (c) => c.cardIndex === index,
            );
            const isActive = index === currentCardIndex;
            const isEdited = editingCollaborators.length > 0;

            if (isSidebarCollapsed) {
              return (
                <button
                  key={card.id}
                  onClick={() => setCurrentCardIndex(index)}
                  className={`w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              );
            }

            return (
              <div
                key={card.id}
                onClick={() => setCurrentCardIndex(index)}
                className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 ring-1 ring-indigo-200"
                    : isEdited
                      ? "bg-emerald-50 ring-1 ring-emerald-200"
                      : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {(hasAccess ? previewCards : localCards).length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCard(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-medium">
                    {card.question || (
                      <span className="text-gray-300 font-normal">
                        질문 없음
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
                    {card.answer || (
                      <span className="text-gray-300">답변 없음</span>
                    )}
                  </p>
                </div>
                {isEdited && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {editingCollaborators.map((c) => (
                      <span
                        key={c.clientId}
                        className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full"
                      >
                        {c.user.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Collaborators (expanded only) */}
        {!isSidebarCollapsed &&
          isConnected &&
          hasAccess &&
          collaborators.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
              <span className="text-xs text-gray-400">함께 편집 중</span>
              <div className="flex -space-x-1.5">
                {collaborators.map((c) => (
                  <div
                    key={c.clientId}
                    title={c.user.name}
                    className={`w-6 h-6 rounded-full ${getUserColor(c.user.id)} flex items-center justify-center text-white text-[10px] font-bold border-2 border-white`}
                  >
                    {c.user.name}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Drag handle */}
        {!isSidebarCollapsed && (
          <div
            onMouseDown={handleDragStart}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize group flex items-center justify-center hover:bg-indigo-400/30 transition-colors"
          >
            <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </aside>

      {/* ── Main Editor ── */}
      <main
        className="flex flex-col h-screen transition-[margin] duration-200 ease-in-out"
        style={{
          marginLeft: activeSidebarWidth,
          width: `calc(100% - ${activeSidebarWidth}px)`,
        }}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-8 flex items-center justify-between h-14 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-gray-900">
              카드 {currentCardIndex + 1}
            </h1>
            <span className="text-xs text-gray-300">/</span>
            <span className="text-xs text-gray-400">총 {cards.length}개</span>
          </div>
          <Button
            size="sm"
            onClick={() =>
              apiClient
                .post(`card-sets/${cardsetId}`)
                .then(() => toast.success("저장되었습니다."))
                .catch(() => toast.error("저장에 실패했습니다."))
            }
            className="flex items-center gap-1.5 h-8 px-3 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            저장하기
          </Button>
        </header>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">
          {currentCard && (
            <div className="max-w-2xl mx-auto px-6 py-10">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                {/* Question */}
                <EditorField
                  id="question"
                  label="질문"
                  value={questionValue}
                  onChange={handleQuestionChange}
                  onCompositionEnd={handleQuestionCompositionEnd}
                  onFocus={() => {
                    setFocusedField("question");
                    if (hasAccess) setAwareness("question", currentCardIndex);
                  }}
                  onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "question"}
                  editors={questionEditors}
                  getUserColor={getUserColor}
                  placeholder="질문을 입력하세요..."
                />
                <div className="border-t border-gray-200" />
                {/* Answer */}
                <EditorField
                  id="answer"
                  label="답변"
                  value={answerValue}
                  onChange={handleAnswerChange}
                  onCompositionEnd={handleAnswerCompositionEnd}
                  onFocus={() => {
                    setFocusedField("answer");
                    if (hasAccess) setAwareness("answer", currentCardIndex);
                  }}
                  onBlur={() => setFocusedField(null)}
                  isFocused={focusedField === "answer"}
                  editors={answerEditors}
                  getUserColor={getUserColor}
                  placeholder="답변을 입력하세요..."
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Sub-component ──

type EditorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCompositionEnd: (e: React.CompositionEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
  editors: Array<{ clientId: number; user: { id: string; name: string } }>;
  getUserColor: (id: string) => string;
  placeholder: string;
};

function EditorField({
  id,
  label,
  value,
  onChange,
  onCompositionEnd,
  onFocus,
  onBlur,
  isFocused,
  editors,
  getUserColor,
  placeholder,
}: EditorFieldProps) {
  return (
    <div
      className={`bg-white transition-colors duration-150 p-2 ${
        isFocused
          ? "bg-indigo-50/40"
          : editors.length > 0
            ? "bg-emerald-50/40"
            : ""
      }`}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-gray-500 uppercase tracking-wider"
        >
          {label}
        </label>
        {editors.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex -space-x-1">
              {editors.map((e) => (
                <div
                  key={e.clientId}
                  title={`${e.user.name} 편집 중`}
                  className={`w-5 h-5 rounded-full ${getUserColor(e.user.id)} flex items-center justify-center text-white text-[9px] font-bold border border-white`}
                >
                  {e.user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onCompositionEnd={onCompositionEnd}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full min-h-40 text-base leading-relaxed resize-none border-0 bg-transparent focus:ring-0 focus:outline-none px-5 pb-5 pt-2 text-gray-800 placeholder:text-gray-400"
        placeholder={placeholder}
      />
    </div>
  );
}

// ── Utilities ──

function getDelta(
  oldStr: string,
  newStr: string,
): { index: number; delete: number; insert: string } {
  let i = 0;
  const minLen = Math.min(oldStr.length, newStr.length);
  while (i < minLen && oldStr[i] === newStr[i]) i++;
  let j = 0;
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

function applyDelta(
  ytext: Y.Text,
  delta: { index: number; delete: number; insert: string },
) {
  if (delta.delete > 0) ytext.delete(delta.index, delta.delete);
  if (delta.insert.length > 0) ytext.insert(delta.index, delta.insert);
}
