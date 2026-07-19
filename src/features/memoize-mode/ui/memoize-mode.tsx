import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemoizeSession } from "@/features/memoize-mode/model/use-memoize-session";
import type { MemoizeSessionSettings } from "@/features/memoize-mode/model/types";
import { CardCarousel } from "@/features/memoize-mode/ui/card-carousel";
import { MemoizeController } from "@/features/memoize-mode/ui/memoize-controller";
import { cardApi } from "@/shared/apis/card";
import GrobalNavigationBar from "@/shared/layouts/gnb";

type MemoizeModeProps = {
  settings: MemoizeSessionSettings & {
    groupId: number;
    cardsetId: number;
  };
};

export const MemoizeMode = ({ settings: studySettings }: MemoizeModeProps) => {
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

  const {
    cards,
    settings,
    isPlaying,
    currentIndex,
    currentRound,
    autoPlayDurationMs,
    isPreviousDisabled,
    isNextDisabled,
    registerCarouselApi,
    changeCurrentIndex,
    toggleOrderType,
    toggleRepeatMode,
    changeRepeatCount,
    changeAutoTimerSeconds,
    togglePlayback,
    previous,
    next,
  } = useMemoizeSession(studySettings, rawCards);

  if (isLoading) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <GrobalNavigationBar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (isError || cards.length === 0) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <GrobalNavigationBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-gray-500">카드를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <GrobalNavigationBar />
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 pb-32">
        <CardCarousel
          cards={cards}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          durationMs={autoPlayDurationMs}
          onApiReady={registerCarouselApi}
          onCurrentIndexChange={changeCurrentIndex}
          onAdvance={next}
        />
      </div>
      <MemoizeController
        progress={{ currentIndex, totalCount: cards.length, currentRound }}
        settings={settings}
        playback={{ isPlaying, isPreviousDisabled, isNextDisabled }}
        actions={{
          toggleOrderType,
          toggleRepeatMode,
          changeRepeatCount,
          changeAutoTimerSeconds,
          togglePlayback,
          previous,
          next,
        }}
      />
    </div>
  );
};
