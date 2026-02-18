export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <div className="text-white text-lg">인증 중..</div>
      <div className="text-gray-100 text-sm">
        초기 인증과정을 진행중입니다. 잠시만 기다려주세요.
      </div>
    </div>
  );
}
