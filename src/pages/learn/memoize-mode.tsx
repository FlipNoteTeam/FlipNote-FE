import { useEffect, useState } from "react";
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
} from "lucide-react";

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

type CardCarouselProps = {
  api: CarouselApi;
  setApi: (api: CarouselApi) => void;
  current: number;
  setCurrent: (index: number) => void;
  isPlaying: boolean;
  duration: number;
  repeat: boolean;
};

const CardCarousel = ({
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
    if (!isPlaying || !api) return;

    const interval = setInterval(() => {
      if (repeat) {
        // 무한 반복: 마지막 슬라이드에서 첫 슬라이드로
        if (current === MOCKED_PROBLEMSET.length - 1) {
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
  }, [isPlaying, duration, repeat, api, current]);

  return (
    <div className="w-full max-w-5xl mx-auto mb-32">
      <Carousel setApi={setApi} opts={{ loop: false }}>
        <CarouselContent>
          {MOCKED_PROBLEMSET.map((card, index) => (
            <CarouselItem key={card.key} className="flex justify-center">
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
    if (
      settings.isUnlimitedRepeat &&
      current === MOCKED_PROBLEMSET.length - 1
    ) {
      api?.scrollTo(0);
    } else {
      api?.scrollNext();
    }
  };

  return (
    <BaseLayout>
      <div className="space-y-6">
        {/* 카드 캐러셀 */}
        <CardCarousel
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
          totalCount={MOCKED_PROBLEMSET.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
    </BaseLayout>
  );
};

export default MemoizeMode;
