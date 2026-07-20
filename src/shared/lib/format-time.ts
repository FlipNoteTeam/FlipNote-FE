/**
 * 초를 타이머 표기로 바꾼다.
 *
 * 1시간 미만이면 `m:ss`, 이상이면 `h:mm:ss`.
 */
export const formatTime = (seconds: number) => {
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
};
