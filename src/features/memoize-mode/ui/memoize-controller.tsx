import type { ChangeEvent } from "react";
import {
  ListOrdered,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  DEFAULT_AUTO_TIMER_SECONDS,
  MAX_AUTO_TIMER_SECONDS,
  MAX_REPEAT_COUNT,
  MIN_AUTO_TIMER_SECONDS,
  MIN_REPEAT_COUNT,
} from "@/features/memoize-mode/model/constants";
import type { MemoizeControlSettings } from "@/features/memoize-mode/model/types";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";

type MemoizeProgress = {
  currentIndex: number;
  totalCount: number;
  currentRound: number;
};

type MemoizePlayback = {
  isPlaying: boolean;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
};

type MemoizeControllerActions = {
  toggleOrderType: () => void;
  toggleRepeatMode: () => void;
  changeRepeatCount: (repeatCount: number) => void;
  changeAutoTimerSeconds: (seconds: number) => void;
  togglePlayback: () => void;
  previous: () => void;
  next: () => void;
};

type MemoizeControllerProps = {
  progress: MemoizeProgress;
  settings: MemoizeControlSettings;
  playback: MemoizePlayback;
  actions: MemoizeControllerActions;
};

type ProgressIndicatorProps = MemoizeProgress & {
  repeatCount: number;
  isUnlimitedRepeat: boolean;
};

const ProgressIndicator = ({
  currentIndex,
  totalCount,
  currentRound,
  repeatCount,
  isUnlimitedRepeat,
}: ProgressIndicatorProps) => {
  const progress = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>
          {currentIndex + 1} / {totalCount}
        </span>
        {/* 무한 반복은 회차 카운트가 무의미하므로 회차 표시를 렌더하지 않는다. */}
        {!isUnlimitedRepeat && (
          <span aria-label="현재 회차">
            {currentRound} / {repeatCount}회차
          </span>
        )}
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200">
        <div
          className="h-1.5 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

type StudySettingsControlsProps = {
  settings: Pick<
    MemoizeControlSettings,
    "orderType" | "isUnlimitedRepeat" | "repeatCount"
  >;
  disabled: boolean;
  onToggleOrderType: () => void;
  onToggleRepeatMode: () => void;
  onRepeatCountChange: (repeatCount: number) => void;
};

const StudySettingsControls = ({
  settings,
  disabled,
  onToggleOrderType,
  onToggleRepeatMode,
  onRepeatCountChange,
}: StudySettingsControlsProps) => {
  const handleRepeatCountChange = (event: ChangeEvent<HTMLInputElement>) => {
    onRepeatCountChange(Number.parseInt(event.target.value, 10));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleOrderType}
        disabled={disabled}
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

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeatMode}
        disabled={disabled}
        aria-label={settings.isUnlimitedRepeat ? "무한 반복" : "횟수 반복"}
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
            min={MIN_REPEAT_COUNT}
            max={MAX_REPEAT_COUNT}
            value={settings.repeatCount ?? MIN_REPEAT_COUNT}
            aria-label="반복 횟수"
            onChange={handleRepeatCountChange}
            disabled={disabled}
            className="w-14 text-center"
          />
          <span className="text-sm text-gray-600">회</span>
        </div>
      )}
    </div>
  );
};

type PlaybackControlsProps = MemoizePlayback & {
  onTogglePlayback: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

const PlaybackControls = ({
  isPlaying,
  isPreviousDisabled,
  isNextDisabled,
  onTogglePlayback,
  onPrevious,
  onNext,
}: PlaybackControlsProps) => (
  <div className="flex items-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      aria-label="이전 카드"
      onClick={onPrevious}
      disabled={isPreviousDisabled}
    >
      <SkipBack className="h-6 w-6" />
    </Button>

    <Button
      variant="default"
      size="icon"
      className="h-12 w-12 rounded-full"
      aria-label={isPlaying ? "일시정지" : "재생"}
      onClick={onTogglePlayback}
    >
      {isPlaying ? (
        <Pause className="h-6 w-6" />
      ) : (
        <Play className="ml-0.5 h-6 w-6" />
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
);

type PlaybackSpeedControlProps = {
  seconds: number;
  onSecondsChange: (seconds: number) => void;
};

const PlaybackSpeedControl = ({
  seconds,
  onSecondsChange,
}: PlaybackSpeedControlProps) => {
  const handleSecondsChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSecondsChange(Number.parseInt(event.target.value, 10));
  };

  return (
    <div className="flex items-center gap-3">
      <Label className="text-sm whitespace-nowrap">속도</Label>
      <Input
        type="number"
        min={MIN_AUTO_TIMER_SECONDS}
        max={MAX_AUTO_TIMER_SECONDS}
        value={seconds}
        aria-label="자동 넘김 속도"
        onChange={handleSecondsChange}
        className="w-16 text-center"
      />
      <span className="text-sm text-gray-600">초</span>
    </div>
  );
};

export const MemoizeController = ({
  progress,
  settings,
  playback,
  actions,
}: MemoizeControllerProps) => (
  <div className="fixed right-0 bottom-0 left-0 border-t bg-white shadow-lg">
    <div className="mx-auto max-w-7xl px-6 py-4">
      <ProgressIndicator
        {...progress}
        repeatCount={settings.repeatCount ?? MIN_REPEAT_COUNT}
        isUnlimitedRepeat={settings.isUnlimitedRepeat}
      />

      <div className="flex items-center justify-between gap-6">
        <StudySettingsControls
          settings={settings}
          disabled={playback.isPlaying}
          onToggleOrderType={actions.toggleOrderType}
          onToggleRepeatMode={actions.toggleRepeatMode}
          onRepeatCountChange={actions.changeRepeatCount}
        />
        <PlaybackControls
          {...playback}
          onTogglePlayback={actions.togglePlayback}
          onPrevious={actions.previous}
          onNext={actions.next}
        />
        <PlaybackSpeedControl
          seconds={settings.autoTimerSeconds ?? DEFAULT_AUTO_TIMER_SECONDS}
          onSecondsChange={actions.changeAutoTimerSeconds}
        />
      </div>
    </div>
  </div>
);
