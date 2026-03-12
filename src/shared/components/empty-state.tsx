import { type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  variant?: "default" | "error";
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) => {
  const iconBgColor = variant === "error" ? "bg-red-50" : "bg-gray-50";
  const iconTextColor = variant === "error" ? "text-red-300" : "text-gray-300";
  const titleColor = variant === "error" ? "text-gray-700" : "text-gray-600";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-70 gap-4",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            iconBgColor,
          )}
        >
          <div className={iconTextColor}>{icon}</div>
        </div>
      )}
      <div className="text-center">
        <p className={cn("font-semibold", titleColor)}>{title}</p>
        {description && (
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
