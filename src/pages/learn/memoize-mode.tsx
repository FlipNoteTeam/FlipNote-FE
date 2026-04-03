import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GNB from "@/shared/layouts/gnb";
import FlipCard from "@/shared/components/flip-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/carousel";
import type { MemorizeSettings } from "@/features/setting-study-mode/model/form.schema";
import { Button } from "@/shared/components/button";
import { Label } from "@/shared/components/label";
import { Input } from "@/shared/components/input";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  ListOrdered,
  Loader2,
} from "lucide-react";
import { cardApi, type CardResponse } from "@/shared/apis/card";

// [DEV_MOCK] UI 작업용 임시 목 데이터 - 작업 완료 후 제거
const DEV_MOCK = true;
const MOCK_CARDS: CardResponse[] = [
  { id: "1", question: "React에서 상태 관리를 위한 기본 훅은 무엇인가?", answer: "useState" },
  { id: "2", question: "컴포넌트의 사이드 이펙트를 처리하는 훅은 무엇인가?", answer: "useEffect" },
  { id: "3", question: "컨텍스트 값을 구독할 때 사용하는 훅은 무엇인가?", answer: "useContext" },
  { id: "4", question: "이전 렌더링 값을 기억할 때 사용하는 훅은 무엇인가?", answer: "useRef" },
  { id: "5", question: "비용이 큰 계산 결과를 메모이제이션할 때 사용하는 훅은?", answer: "useMemo" },
  { id: "6", question: "함수를 메모이제이션할 때 사용하는 훅은?", answer: "useCallback" },
];

type MemoizeControllerProps = {
  settings: MemorizeSettings;
  setSettings: React.Dispatch<React.SetStateAction<MemorizeSettings>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

const MemoizeController = ({
  settings,
  setSettings,
  isPlaying,
  setIsPlaying,
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
}: MemoizeControllerProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* 진행 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              {currentIndex + 1} / {totalCount}
            </span>
            <span>{Math.round(((currentIndex + 1) / totalCount) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          {/* 왼쪽: 설정 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 순서 토글 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  orderType:
                    prev.orderType === "sequential" ? "random" : "sequential",
                }))
              }
              title={settings.orderType === "sequential" ? "순차" : "랜덤"}
            >
              {settings.orderType === "sequential" ? (
                <ListOrdered className="h-5 w-5" />
              ) : (
                <Shuffle className="h-5 w-5" />
              )}
            </Button>

            {/* 반복 토글 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  isUnlimitedRepeat: !prev.isUnlimitedRepeat,
                }))
              }
              title={settings.isUnlimitedRepeat ? "무한 반복" : "반복 끝"}
            >
              {settings.isUnlimitedRepeat ? (
                <Repeat className="h-5 w-5" />
              ) : (
                <Repeat1 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* 중앙: 플레이어 컨트롤 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              disabled={currentIndex === 0}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              disabled={
                !settings.isUnlimitedRepeat && currentIndex === totalCount - 1
              }
            >
              <SkipForward className="h-6 w-6" />
            </Button>
          </div>

          {/* 오른쪽: 속도 설정 */}
          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">속도</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.autoTimerSeconds ?? 5}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  autoTimerSeconds: parseInt(e.target.value) || 5,
                }))
              }
              className="w-16 text-center"
            />
            <span className="text-sm text-gray-600">초</span>
          </div>
        </div>
      </div>
    </div>
  );
};


type CardCarouselProps = {
  cards: CardResponse[];
  api: CarouselApi;
  setApi: (api: CarouselApi) => void;
  current: number;
  setCurrent: (index: number) => void;
  isPlaying: boolean;
  duration: number;
  repeat: boolean;
};

const CardCarousel = ({
  cards,
  api,
  setApi,
  current,
  setCurrent,
  isPlaying,
  duration,
  repeat,
}: CardCarouselProps) => {
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api, setCurrent]);

  useEffect(() => {
    if (!isPlaying || !api || cards.length === 0) return;

    const interval = setInterval(() => {
      if (repeat) {
        // 무한 반복: 마지막 슬라이드에서 첫 슬라이드로
        if (current === cards.length - 1) {
          api.scrollTo(0);
        } else {
          api.scrollNext();
        }
      } else {
        // 마지막 슬라이드면 멈춤
        if (api.canScrollNext()) {
          api.scrollNext();
        }
      }
    }, duration);

    return () => clearInterval(interval);
  }, [isPlaying, duration, repeat, api, current, cards.length]);

  return (
    <div className="w-full max-w-2xl">
      <Carousel setApi={setApi} opts={{ loop: false }}>
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={card.id} className="flex justify-center">
              <div
                className="w-full"
                style={{ height: "clamp(200px, calc(100dvh - 280px), 500px)" }}
              >
                <FlipCard
                  frontNode={card.question}
                  backNode={card.answer}
                  isActive={index === current}
                  autoFlip={isPlaying}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

type StudyState = MemorizeSettings & {
  groupId: number;
  cardsetId: number;
};

type MemoizeModeProps = {
  settings: StudyState;
};

const MemoizeMode = ({ settings: studySettings }: MemoizeModeProps) => {
  // 카드 데이터 조회
  // [DEV_MOCK] 실서버 연결 시 queryFn과 enabled를 원래대로 복원:
  // queryFn: () => cardApi.getCards(studySettings.cardsetId),
  // enabled: !!studySettings.cardsetId,
  const {
    data: cardsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", studySettings.cardsetId],
    queryFn: () =>
      DEV_MOCK
        ? Promise.resolve({ data: { data: MOCK_CARDS } })
        : cardApi.getCards(studySettings.cardsetId),
    enabled: DEV_MOCK || !!studySettings.cardsetId,
  });

  const cards = cardsData?.data?.data ?? [];

  // 컨트롤 가능한 설정값들을 state로 관리
  const [settings, setSettings] = useState<MemorizeSettings>({
    mode: "memorize",
    isUnlimitedRepeat: studySettings?.isUnlimitedRepeat ?? false,
    repeatCount: studySettings?.repeatCount ?? 3,
    navigationType: studySettings?.navigationType ?? "auto",
    autoTimerSeconds: studySettings?.autoTimerSeconds ?? 5,
    orderType: studySettings?.orderType ?? "sequential",
  });

  // Carousel API 및 현재 인덱스
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // 재생/일시정지 상태
  const [isPlaying, setIsPlaying] = useState(true);

  const autoPlayDuration = (settings.autoTimerSeconds ?? 5) * 1000;

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  const handleNext = () => {
    if (settings.isUnlimitedRepeat && current === cards.length - 1) {
      api?.scrollTo(0);
    } else {
      api?.scrollNext();
    }
  };

  if (isLoading) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <GNB />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (isError || cards.length === 0) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <GNB />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">카드를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <GNB />
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-32">
        <CardCarousel
          cards={cards}
          api={api}
          setApi={setApi}
          current={current}
          setCurrent={setCurrent}
          isPlaying={isPlaying}
          duration={autoPlayDuration}
          repeat={settings.isUnlimitedRepeat}
        />
      </div>
      <MemoizeController
        settings={settings}
        setSettings={setSettings}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentIndex={current}
        totalCount={cards.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
};

export default MemoizeMode;
