// Web Worker for accurate timer with drift compensation
let timerId = null;
let startTime = null;
let targetDuration = null;
let elapsed = 0;

function tick() {
  if (!startTime || !targetDuration) return;

  const now = Date.now();
  const actualElapsed = now - startTime;

  // 1초마다 메시지 전송
  if (Math.floor(actualElapsed / 1000) > Math.floor(elapsed / 1000)) {
    const remainingSeconds = Math.max(0, Math.ceil((targetDuration - actualElapsed) / 1000));
    self.postMessage({
      type: 'tick',
      elapsed: actualElapsed,
      remaining: remainingSeconds,
    });
  }

  elapsed = actualElapsed;

  // 타이머 종료 체크
  if (actualElapsed >= targetDuration) {
    self.postMessage({ type: 'complete' });
    stopTimer();
    return;
  }

  // 시간 보정: 다음 틱까지의 정확한 시간 계산
  const drift = actualElapsed % 1000;
  const nextTick = 1000 - drift;

  timerId = setTimeout(tick, nextTick);
}

function startTimer(duration) {
  stopTimer();
  startTime = Date.now();
  targetDuration = duration;
  elapsed = 0;
  tick();
}

function stopTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  startTime = null;
  targetDuration = null;
  elapsed = 0;
}

function pauseTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  elapsed = Date.now() - startTime;
}

function resumeTimer() {
  if (!targetDuration) return;

  // 일시정지된 시간만큼 시작 시간 조정
  startTime = Date.now() - elapsed;
  tick();
}

self.onmessage = function(e) {
  const { type, duration } = e.data;

  switch (type) {
    case 'start':
      startTimer(duration);
      break;
    case 'stop':
      stopTimer();
      break;
    case 'pause':
      pauseTimer();
      break;
    case 'resume':
      resumeTimer();
      break;
    default:
      console.warn('Unknown message type:', type);
  }
};
