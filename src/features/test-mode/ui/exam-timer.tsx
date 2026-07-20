import { Clock, Pause, Play } from "lucide-react";
import { TIME_WARNING_THRESHOLD_SECONDS } from "@/features/test-mode/model/constants";
import { Button } from "@/shared/components/button";
import { formatTime } from "@/shared/lib/format-time";

type ExamTimerProps = {
  remainingSeconds: number;
  isRunning: boolean;
  onToggle: () => void;
};

/** 남은 시간 표시와 일시정지/재개 */
export const ExamTimer = ({
  remainingSeconds,
  isRunning,
  onToggle,
}: ExamTimerProps) => {
  const isUrgent = remainingSeconds < TIME_WARNING_THRESHOLD_SECONDS;

  return (
    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
      <Clock className="h-5 w-5 text-gray-600" />
      <span
        className={`text-lg font-mono font-semibold ${
          isUrgent ? "text-red-600" : "text-gray-900"
        }`}
      >
        {formatTime(remainingSeconds)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        aria-label={isRunning ? "타이머 일시정지" : "타이머 재개"}
        className="h-8 w-8"
      >
        {isRunning ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
