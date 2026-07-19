import { useCallback, useEffect, useState } from "react";
import type { CardResponse } from "@/shared/apis/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/carousel";
import FlipCard from "@/shared/components/flip-card";

type CardCarouselProps = {
  cards: CardResponse[];
  currentIndex: number;
  isPlaying: boolean;
  durationMs: number;
  onApiReady: (api: CarouselApi) => void;
  onCurrentIndexChange: (currentIndex: number) => void;
  onAdvance: () => void;
};

export const CardCarousel = ({
  cards,
  currentIndex,
  isPlaying,
  durationMs,
  onApiReady,
  onCurrentIndexChange,
  onAdvance,
}: CardCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

  const handleApiReady = useCallback(
    (nextApi: CarouselApi) => {
      setApi(nextApi);
      onApiReady(nextApi);
    },
    [onApiReady],
  );

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      onCurrentIndexChange(api.selectedScrollSnap());
    };

    handleSelect();
    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api, onCurrentIndexChange]);

  useEffect(() => {
    if (!isPlaying || !api || cards.length === 0) return;

    const interval = window.setInterval(onAdvance, durationMs);
    return () => window.clearInterval(interval);
  }, [api, cards.length, durationMs, isPlaying, onAdvance]);

  return (
    <div className="w-full max-w-2xl">
      <Carousel setApi={handleApiReady} opts={{ loop: false }}>
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem
              key={card.id}
              className="flex justify-center"
              aria-current={index === currentIndex ? "true" : undefined}
            >
              <div
                className="w-full"
                style={{ height: "clamp(200px, calc(100dvh - 280px), 500px)" }}
              >
                <FlipCard
                  frontNode={card.question}
                  backNode={card.answer}
                  isActive={index === currentIndex}
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
