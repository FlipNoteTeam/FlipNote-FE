import { useCallback, useMemo, useReducer, useRef } from "react";
import {
  DEFAULT_AUTO_TIMER_SECONDS,
  DEFAULT_REPEAT_COUNT,
  MAX_AUTO_TIMER_SECONDS,
  MAX_REPEAT_COUNT,
  MIN_AUTO_TIMER_SECONDS,
  MIN_REPEAT_COUNT,
} from "@/features/memoize-mode/model/constants";
import {
  advanceShuffleSeed,
  createShuffleSeed,
  shuffle,
} from "@/features/memoize-mode/model/shuffle";
import type { MemoizeSessionSettings } from "@/features/memoize-mode/model/types";
import type { CardResponse } from "@/shared/apis/card";
import type { CarouselApi } from "@/shared/components/carousel";

type MemoizeSessionState = {
  settings: MemoizeSessionSettings;
  isPlaying: boolean;
  currentIndex: number;
  currentRound: number;
  shuffleSeed: number;
};

type MemoizeSessionAction =
  | { type: "order-type-toggled" }
  | { type: "repeat-mode-toggled" }
  | { type: "repeat-count-changed"; repeatCount: number }
  | { type: "auto-timer-changed"; seconds: number }
  | { type: "playback-toggled" }
  | { type: "playback-finished" }
  | { type: "current-index-changed"; currentIndex: number }
  | { type: "round-advanced" };

const clampInteger = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(Math.trunc(value), min), max);
};

const resetContentProgress = (
  state: MemoizeSessionState,
  settings: MemoizeSessionSettings,
): MemoizeSessionState => ({
  ...state,
  settings,
  isPlaying: false,
  currentIndex: 0,
  currentRound: 1,
  shuffleSeed: advanceShuffleSeed(state.shuffleSeed),
});

const memoizeSessionReducer = (
  state: MemoizeSessionState,
  action: MemoizeSessionAction,
): MemoizeSessionState => {
  switch (action.type) {
    case "order-type-toggled":
      return resetContentProgress(state, {
        ...state.settings,
        orderType:
          state.settings.orderType === "sequential" ? "random" : "sequential",
      });
    case "repeat-mode-toggled":
      return resetContentProgress(state, {
        ...state.settings,
        isUnlimitedRepeat: !state.settings.isUnlimitedRepeat,
      });
    case "repeat-count-changed":
      return resetContentProgress(state, {
        ...state.settings,
        repeatCount: action.repeatCount,
      });
    case "auto-timer-changed":
      return {
        ...state,
        settings: {
          ...state.settings,
          autoTimerSeconds: action.seconds,
        },
      };
    case "playback-toggled":
      return { ...state, isPlaying: !state.isPlaying };
    case "playback-finished":
      return { ...state, isPlaying: false };
    case "current-index-changed":
      if (state.currentIndex === action.currentIndex) return state;
      return { ...state, currentIndex: action.currentIndex };
    case "round-advanced":
      return {
        ...state,
        currentIndex: 0,
        currentRound: state.currentRound + 1,
        shuffleSeed: advanceShuffleSeed(state.shuffleSeed),
      };
  }
};

const createInitialSessionState = (
  studySettings: MemoizeSessionSettings,
): MemoizeSessionState => ({
  settings: {
    isUnlimitedRepeat: studySettings.isUnlimitedRepeat,
    repeatCount: studySettings.repeatCount ?? DEFAULT_REPEAT_COUNT,
    navigationType: studySettings.navigationType,
    autoTimerSeconds:
      studySettings.autoTimerSeconds ?? DEFAULT_AUTO_TIMER_SECONDS,
    orderType: studySettings.orderType,
  },
  isPlaying: studySettings.navigationType === "auto",
  currentIndex: 0,
  currentRound: 1,
  shuffleSeed: createShuffleSeed(),
});

export const useMemoizeSession = (
  studySettings: MemoizeSessionSettings,
  rawCards: CardResponse[],
) => {
  const carouselApiRef = useRef<CarouselApi>(undefined);
  const [state, dispatch] = useReducer(
    memoizeSessionReducer,
    studySettings,
    createInitialSessionState,
  );

  const cards = useMemo(() => {
    if (state.settings.orderType === "sequential") return rawCards;
    return shuffle(rawCards, state.shuffleSeed);
  }, [rawCards, state.settings.orderType, state.shuffleSeed]);

  const registerCarouselApi = useCallback((api: CarouselApi) => {
    carouselApiRef.current = api;
  }, []);

  const changeCurrentIndex = useCallback((currentIndex: number) => {
    dispatch({ type: "current-index-changed", currentIndex });
  }, []);

  const resetCarousel = useCallback(() => {
    carouselApiRef.current?.scrollTo(0);
  }, []);

  const toggleOrderType = useCallback(() => {
    if (state.isPlaying) return;
    dispatch({ type: "order-type-toggled" });
    resetCarousel();
  }, [resetCarousel, state.isPlaying]);

  const toggleRepeatMode = useCallback(() => {
    if (state.isPlaying) return;
    dispatch({ type: "repeat-mode-toggled" });
    resetCarousel();
  }, [resetCarousel, state.isPlaying]);

  const changeRepeatCount = useCallback(
    (repeatCount: number) => {
      if (state.isPlaying) return;
      dispatch({
        type: "repeat-count-changed",
        repeatCount: clampInteger(
          repeatCount,
          MIN_REPEAT_COUNT,
          MAX_REPEAT_COUNT,
        ),
      });
      resetCarousel();
    },
    [resetCarousel, state.isPlaying],
  );

  const changeAutoTimerSeconds = useCallback((seconds: number) => {
    dispatch({
      type: "auto-timer-changed",
      seconds: clampInteger(
        seconds,
        MIN_AUTO_TIMER_SECONDS,
        MAX_AUTO_TIMER_SECONDS,
      ),
    });
  }, []);

  const togglePlayback = useCallback(() => {
    dispatch({ type: "playback-toggled" });
  }, []);

  const previous = useCallback(() => {
    carouselApiRef.current?.scrollPrev();
  }, []);

  const next = useCallback(() => {
    const api = carouselApiRef.current;
    if (!api || cards.length === 0) return;

    if (state.currentIndex < cards.length - 1) {
      api.scrollNext();
      return;
    }

    const repeatCount = state.settings.repeatCount ?? MIN_REPEAT_COUNT;
    const hasNextRound =
      state.settings.isUnlimitedRepeat || state.currentRound < repeatCount;

    if (hasNextRound) {
      dispatch({ type: "round-advanced" });
      api.scrollTo(0);
      return;
    }

    dispatch({ type: "playback-finished" });
  }, [
    cards.length,
    state.currentIndex,
    state.currentRound,
    state.settings.isUnlimitedRepeat,
    state.settings.repeatCount,
  ]);

  const isNextDisabled =
    !state.settings.isUnlimitedRepeat &&
    state.currentRound >= (state.settings.repeatCount ?? MIN_REPEAT_COUNT) &&
    state.currentIndex === cards.length - 1;

  return {
    cards,
    settings: state.settings,
    isPlaying: state.isPlaying,
    currentIndex: state.currentIndex,
    currentRound: state.currentRound,
    autoPlayDurationMs:
      (state.settings.autoTimerSeconds ?? DEFAULT_AUTO_TIMER_SECONDS) * 1000,
    isPreviousDisabled: state.currentIndex === 0,
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
  };
};
