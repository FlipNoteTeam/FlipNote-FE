import { CloudOff } from "lucide-react";
import { Button } from "@/shared/components/button";
import { EmptyState } from "./empty-state";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay = ({
  message = "앗, 불러오지 못했어요",
  onRetry,
}: ErrorDisplayProps) => {
  return (
    <EmptyState
      variant="error"
      icon={<CloudOff className="w-7 h-7" />}
      title={message}
      description="잠시 후 다시 시도해주세요"
      action={
        onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            다시 시도하기
          </Button>
        )
      }
    />
  );
};

export default ErrorDisplay;
