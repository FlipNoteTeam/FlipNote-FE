import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BaseLayout from "@/shared/layouts/base-layout";
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
    <div className="w-full max-w-5xl mx-auto mb-32">
      <Carousel setApi={setApi} opts={{ loop: false }}>
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={card.id} className="flex justify-center">
              <FlipCard
                frontNode={card.question}
                backNode={card.answer}
                isActive={index === current}
                autoFlip={isPlaying}
              />
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
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </BaseLayout>
    );
  }

  if (isError || cards.length === 0) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">카드를 불러올 수 없습니다.</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* 카드 캐러셀 */}
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

        {/* 컨트롤러 */}
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
    </BaseLayout>
  );
};

export default MemoizeMode;
