import { useEffect, useRef, useState, useCallback } from "react";

type TimerStatus = "idle" | "running" | "paused" | "completed";

type UseTimerOptions = {
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
};

export const useTimer = (options: UseTimerOptions = {}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const workerRef = useRef<Worker | null>(null);
  const isVisibleRef = useRef(true);

  // options를 ref로 저장하여 최신 콜백을 항상 참조
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Worker 초기화
  useEffect(() => {
    const worker = new Worker("/timer-worker.js");

    worker.onmessage = (e) => {
      const { type, remaining } = e.data;

      if (type === "tick") {
        setRemainingSeconds(remaining);
        optionsRef.current.onTick?.(remaining);
      } else if (type === "complete") {
        setStatus("completed");
        setRemainingSeconds(0);
        optionsRef.current.onComplete?.();
      }
    };

    worker.onerror = (error) => {
      console.error("Timer worker error:", error);
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []); // 의존성 배열 비우기

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      isVisibleRef.current = isVisible;

      if (!workerRef.current) return;

      if (!isVisible && status === "running") {
        // 탭 비활성화 시 일시정지
        workerRef.current.postMessage({ type: "pause" });
      } else if (isVisible && status === "running") {
        // 탭 활성화 시 재개
        workerRef.current.postMessage({ type: "resume" });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status]);

  const start = useCallback((durationInSeconds: number) => {
    if (!workerRef.current) return;

    setRemainingSeconds(durationInSeconds);
    setStatus("running");
    workerRef.current.postMessage({
      type: "start",
      duration: durationInSeconds * 1000,
    });
  }, []);

  const pause = useCallback(() => {
    if (!workerRef.current || status !== "running") return;

    setStatus("paused");
    workerRef.current.postMessage({ type: "pause" });
  }, [status]);

  const resume = useCallback(() => {
    if (!workerRef.current || status !== "paused") return;

    setStatus("running");
    workerRef.current.postMessage({ type: "resume" });
  }, [status]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;

    setStatus("idle");
    setRemainingSeconds(0);
    workerRef.current.postMessage({ type: "stop" });
  }, []);

  const reset = useCallback(() => {
    stop();
  }, [stop]);

  return {
    remainingSeconds,
    status,
    start,
    pause,
    resume,
    stop,
    reset,
    isRunning: status === "running",
    isPaused: status === "paused",
    isCompleted: status === "completed",
  };
};
