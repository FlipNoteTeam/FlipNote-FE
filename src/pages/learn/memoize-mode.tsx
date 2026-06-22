import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GrobalNavigationBar from "@/shared/layouts/gnb";
import FlipCard from "@/shared/components/flip-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/shared/components/carousel";
import type { MemorizeSettings } from "@/features/setting-study-mode/schemas/form.schema";
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

type MemoizeControllerProps = {
  settings: MemorizeSettings;
  setSettings: React.Dispatch<React.SetStateAction<MemorizeSettings>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
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
  isNextDisabled,
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
              aria-label={
                settings.orderType === "sequential" ? "순차 정렬" : "랜덤 정렬"
              }
            >
              {settings.orderType === "sequential" ? (
                <ListOrdered className="h-5 w-5" />
              ) : (
                <Shuffle className="h-5 w-5" />
              )}
            </Button>

            {/* 반복 토글 + 횟수 설정 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  isUnlimitedRepeat: !prev.isUnlimitedRepeat,
                }))
              }
              aria-label={
                settings.isUnlimitedRepeat ? "무한 반복" : "횟수 반복"
              }
            >
              {settings.isUnlimitedRepeat ? (
                <Repeat className="h-5 w-5" />
              ) : (
                <Repeat1 className="h-5 w-5" />
              )}
            </Button>

            {!settings.isUnlimitedRepeat && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={settings.repeatCount ?? 1}
                  aria-label="반복 횟수"
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      repeatCount: Number.parseInt(e.target.value) || 1,
                    }))
                  }
                  className="w-14 text-center"
                />
                <span className="text-sm text-gray-600">회</span>
              </div>
            )}
          </div>

          {/* 중앙: 플레이어 컨트롤 */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="이전 카드"
              onClick={onPrevious}
              disabled={currentIndex === 0}
            >
              <SkipBack className="h-6 w-6" />
            </Button>

            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              aria-label={isPlaying ? "일시정지" : "재생"}
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
              aria-label="다음 카드"
              onClick={onNext}
              disabled={isNextDisabled}
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
              aria-label="자동 넘김 속도"
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  autoTimerSeconds: Number.parseInt(e.target.value) || 5,
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
  onAdvance: () => void;
};

const CardCarousel = ({
  cards,
  api,
  setApi,
  current,
  setCurrent,
  isPlaying,
  duration,
  onAdvance,
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
      onAdvance();
    }, duration);

    return () => clearInterval(interval);
  }, [isPlaying, duration, onAdvance, api, cards.length]);

  return (
    <div className="w-full max-w-2xl">
      <Carousel setApi={setApi} opts={{ loop: false }}>
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem
              key={card.id}
              className="flex justify-center"
              aria-current={index === current ? "true" : undefined}
            >
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

  const {
    data: cardsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["cards", studySettings.cardsetId],
    queryFn: () => cardApi.getCards(studySettings.cardsetId),
    enabled: !!studySettings.cardsetId,
  });

  const rawCards = useMemo(() => cardsData?.data?.data ?? [], [cardsData]);

  // 컨트롤 가능한 설정값들을 state로 관리
  const [settings, setSettings] = useState<MemorizeSettings>({
    mode: "memorize",
    isUnlimitedRepeat: studySettings?.isUnlimitedRepeat ?? false,
    repeatCount: studySettings?.repeatCount ?? 3,
    navigationType: studySettings?.navigationType ?? "auto",
    autoTimerSeconds: studySettings?.autoTimerSeconds ?? 5,
    orderType: studySettings?.orderType ?? "sequential",
  });

  useEffect(() => {
    console.log("[MemoizeMode] settings:", settings);
  }, [settings]);

  // orderType 변경 시 재계산, 라운드 전환 시엔 advance()에서 직접 setCards
  const baseCards = useMemo(() => {
    if (settings.orderType === "random") {
      return [...rawCards].sort(() => Math.random() - 0.5);
    }
    return rawCards;
  }, [rawCards, settings.orderType]);

  const [cards, setCards] = useState(baseCards);

  useEffect(() => {
    setCards(baseCards);
  }, [baseCards]);

  // Carousel API 및 현재 인덱스
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // 재생/일시정지 상태 — navigationType이 manual이면 초기엔 정지
  const [isPlaying, setIsPlaying] = useState(
    (studySettings?.navigationType ?? "auto") === "auto",
  );

  // 현재 회차 (1-indexed)
  const [currentRound, setCurrentRound] = useState(1);

  const autoPlayDuration = (settings.autoTimerSeconds ?? 5) * 1000;

  const isNextDisabled =
    !settings.isUnlimitedRepeat &&
    currentRound >= (settings.repeatCount ?? 1) &&
    current === cards.length - 1;

  const reshuffle = useCallback(() => {
    if (settings.orderType === "random") {
      setCards([...rawCards].sort(() => Math.random() - 0.5));
    }
  }, [settings.orderType, rawCards]);

  const advance = useCallback(() => {
    if (!api) return;
    if (current < cards.length - 1) {
      api.scrollNext();
      return;
    }
    // 마지막 카드
    if (settings.isUnlimitedRepeat) {
      reshuffle();
      api.scrollTo(0);
      return;
    }
    const nextRound = currentRound + 1;
    if (nextRound <= (settings.repeatCount ?? 1)) {
      reshuffle();
      api.scrollTo(0);
      setCurrentRound(nextRound);
    } else {
      setIsPlaying(false);
    }
  }, [
    api,
    current,
    cards.length,
    settings.isUnlimitedRepeat,
    settings.repeatCount,
    currentRound,
    reshuffle,
  ]);

  const handlePrevious = () => {
    api?.scrollPrev();
  };

  if (isLoading) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <GrobalNavigationBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (isError || cards.length === 0) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden">
        <GrobalNavigationBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">카드를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <GrobalNavigationBar />
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-32">
        <CardCarousel
          cards={cards}
          api={api}
          setApi={setApi}
          current={current}
          setCurrent={setCurrent}
          isPlaying={isPlaying}
          duration={autoPlayDuration}
          onAdvance={advance}
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
        onNext={advance}
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
};

export default MemoizeMode;
