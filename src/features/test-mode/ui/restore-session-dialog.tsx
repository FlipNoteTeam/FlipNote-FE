import { Clock } from "lucide-react";
import { Button } from "@/shared/components/button";
import { formatTime } from "@/shared/lib/format-time";

type RestoreSessionDialogProps = {
  /** 저장된 타이머의 남은 시간(초). 0이거나 무제한이면 표시하지 않는다. */
  remainingSeconds: number;
  showRemainingTime: boolean;
  onResume: () => void;
  onRestart: () => void;
};

/** 이탈한 시험 세션을 이어서 풀지 물어보는 다이얼로그 */
export const RestoreSessionDialog = ({
  remainingSeconds,
  showRemainingTime,
  onResume,
  onRestart,
}: RestoreSessionDialogProps) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="이전 시험 내역"
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 space-y-5">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold">이전에 풀던 내역이 있습니다</h2>
        <p className="text-sm text-gray-500">이어서 풀겠습니까?</p>
      </div>

      {showRemainingTime && remainingSeconds > 0 && (
        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl py-3">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">남은 시간</span>
          <span className="font-mono font-semibold text-gray-900">
            {formatTime(remainingSeconds)}
          </span>
        </div>
      )}

      <div className="flex gap-3">
        <Button className="flex-1" variant="outline" onClick={onRestart}>
          처음부터
        </Button>
        <Button className="flex-1" onClick={onResume}>
          이어서 풀기
        </Button>
      </div>
    </div>
  </div>
);
