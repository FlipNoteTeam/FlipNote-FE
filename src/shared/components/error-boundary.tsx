import * as React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ErrorFallback error={this.state.error} onReset={this.reset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-4xl font-bold text-gray-800">오류가 발생했습니다</p>
        <p className="text-sm text-gray-500">
          {error?.message ?? "알 수 없는 오류가 발생했습니다."}
        </p>
      </div>
      <div className="flex gap-2">
        {onReset && (
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            다시 시도
          </button>
        )}
        <button
          onClick={() => (window.location.href = "/")}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          홈으로 이동
        </button>
      </div>
    </div>
  );
}
