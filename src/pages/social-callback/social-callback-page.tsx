import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import BaseLayout from "@/shared/layouts/base-layout";
import { Button } from "@/shared/components/button";

export type SocialCallbackStatus = "success" | "failure" | "conflict";

interface SocialCallbackPageProps {
  status: SocialCallbackStatus;
  title: string;
  message: string;
  onNavigate: () => void;
}

const COUNTDOWN_SECONDS = 5;

const statusConfig: Record<
  SocialCallbackStatus,
  { Icon: typeof CheckCircle; iconClass: string }
> = {
  success: { Icon: CheckCircle, iconClass: "text-green-500" },
  failure: { Icon: XCircle, iconClass: "text-red-500" },
  conflict: { Icon: AlertCircle, iconClass: "text-yellow-500" },
};

export function SocialCallbackPage({
  status,
  title,
  message,
  onNavigate,
}: SocialCallbackPageProps) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (count <= 0) {
      onNavigate();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onNavigate]);

  const { Icon, iconClass } = statusConfig[status];

  return (
    <BaseLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 py-16">
        <Icon className={`w-16 h-16 ${iconClass}`} />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{count}초</span> 후
            자동으로 이동합니다.
          </p>
          <Button onClick={onNavigate}>지금 이동</Button>
        </div>
      </div>
    </BaseLayout>
  );
}
