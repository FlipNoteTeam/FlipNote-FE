import * as React from "react";
import { cn } from "@/shared/lib/utils";

export interface ErrorMessageProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * 폼 에러 메시지 컴포넌트
 * children이 없으면 null 반환
 */
export const ErrorMessage = ({ children, className }: ErrorMessageProps) => {
  if (!children) return null;

  return (
    <span className={cn("text-sm text-red-500", className)}>{children}</span>
  );
};
