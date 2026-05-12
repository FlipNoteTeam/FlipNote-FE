import { toast } from "sonner";
import type { ApiError } from "@/shared/apis";

const DEFAULT_FALLBACK = "요청에 실패했습니다.";

const isApiError = (error: unknown): error is ApiError => {
  if (typeof error !== "object" || error === null) return false;
  return "response" in error;
};

/**
 * `ApiError`의 response.data.message를 추출. 없으면 fallback.
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string => {
  if (isApiError(error)) {
    const message = error.response?.data?.message;
    // 공백만 있는 문자열도 빈 값으로 취급 (blank toast 방지)
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }
  return fallback;
};

/**
 * 에러를 toast.error로 노출. mutation 호출부의
 * `toast.error(error?.response?.data?.message || "...")` 보일러플레이트 대체.
 */
export const notifyError = (error: unknown, fallback?: string): void => {
  toast.error(getErrorMessage(error, fallback));
};
