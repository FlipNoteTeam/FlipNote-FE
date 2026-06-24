import { useEffect, useRef, useState, useCallback } from "react";

type TimerStatus = "idle" | "running" | "paused" | "completed";

type TimerPersistedState =
  | { status: "running"; endTime: number }
  | { status: "paused"; remainingMs: number };

type UseTimerOptions = {
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
  storageKey?: string;
};

export const useTimer = (options: UseTimerOptions = {}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const workerRef = useRef<Worker | null>(null);
  const remainingRef = useRef(0);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const persist = useCallback((state: TimerPersistedState) => {
    const key = optionsRef.current.storageKey;
    if (key) sessionStorage.setItem(key, JSON.stringify(state));
  }, []);

  const clearPersisted = useCallback(() => {
    const key = optionsRef.current.storageKey;
    if (key) sessionStorage.removeItem(key);
  }, []);

  // Worker 초기화 + 새로고침 복원
  useEffect(() => {
    const worker = new Worker("/timer-worker.js");

    worker.onmessage = (e) => {
      const { type, remaining } = e.data;

      if (type === "tick") {
        setRemainingSeconds(remaining);
        remainingRef.current = remaining;
        optionsRef.current.onTick?.(remaining);
      } else if (type === "complete") {
        setStatus("completed");
        setRemainingSeconds(0);
        remainingRef.current = 0;
        const key = optionsRef.current.storageKey;
        if (key) sessionStorage.removeItem(key);
        optionsRef.current.onComplete?.();
      }
    };

    worker.onerror = (error) => {
      console.error("Timer worker error:", error);
    };

    workerRef.current = worker;

    // 새로고침 후 상태 복원
    const key = optionsRef.current.storageKey;
    if (key) {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        try {
          const saved = JSON.parse(raw) as TimerPersistedState;

          if (saved.status === "running") {
            const remainingMs = saved.endTime - Date.now();
            if (remainingMs > 0) {
              const remaining = remainingMs / 1000;
              setRemainingSeconds(remaining);
              remainingRef.current = remaining;
              setStatus("running");
              worker.postMessage({ type: "start", duration: remainingMs });
            } else {
              // 새로고침하는 사이 시간이 만료된 경우
              sessionStorage.removeItem(key);
              setStatus("completed");
              optionsRef.current.onComplete?.();
            }
          } else if (saved.status === "paused") {
            const remaining = saved.remainingMs / 1000;
            setRemainingSeconds(remaining);
            remainingRef.current = remaining;
            setStatus("paused");
            // resume() 시 targetDuration이 필요하므로 start+pause로 워커 초기화
            worker.postMessage({ type: "start", duration: saved.remainingMs });
            worker.postMessage({ type: "pause" });
          }
        } catch {
          sessionStorage.removeItem(key);
        }
      }
    }

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const start = useCallback((durationInSeconds: number) => {
    if (!workerRef.current) return;

    const durationMs = durationInSeconds * 1000;
    setRemainingSeconds(durationInSeconds);
    remainingRef.current = durationInSeconds;
    setStatus("running");
    workerRef.current.postMessage({ type: "start", duration: durationMs });

    persist({ status: "running", endTime: Date.now() + durationMs });
  }, [persist]);

  const pause = useCallback(() => {
    if (!workerRef.current || status !== "running") return;

    setStatus("paused");
    workerRef.current.postMessage({ type: "pause" });

    persist({ status: "paused", remainingMs: remainingRef.current * 1000 });
  }, [status, persist]);

  const resume = useCallback(() => {
    if (!workerRef.current || status !== "paused") return;

    setStatus("running");
    workerRef.current.postMessage({ type: "resume" });

    persist({ status: "running", endTime: Date.now() + remainingRef.current * 1000 });
  }, [status, persist]);

  const stop = useCallback(() => {
    if (!workerRef.current) return;

    setStatus("idle");
    setRemainingSeconds(0);
    remainingRef.current = 0;
    workerRef.current.postMessage({ type: "stop" });
    clearPersisted();
  }, [clearPersisted]);

  const reset = useCallback(() => {
    stop();
  }, [stop]);

  // 이탈 시 호출 — 워커는 hook cleanup이 종료하므로 sessionStorage만 paused로 저장
  const pauseAndKeep = useCallback(() => {
    persist({ status: "paused", remainingMs: remainingRef.current * 1000 });
  }, [persist]);

  return {
    remainingSeconds,
    status,
    start,
    pause,
    resume,
    stop,
    reset,
    pauseAndKeep,
    isRunning: status === "running",
    isPaused: status === "paused",
    isCompleted: status === "completed",
  };
};
