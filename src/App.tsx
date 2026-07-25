import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { routeTree } from "./routeTree.gen";
import useAuthStore from "@/stores/use-auth-store";
import { type AuthState } from "@/stores/use-auth-store";
import { queryClient } from "@/shared/lib/query-client";
import { useEffect } from "react";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: () => { auth: AuthState | undefined };
  }
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** true면 글로벌 onError가 toast를 띄우지 않음 (낙관적 갱신·롤백 등 직접 처리 케이스용). */
      skipErrorToast?: boolean;
      /** 글로벌 onError가 toast로 띄울 fallback 메세지. 서버 message가 없을 때 사용. */
      errorFallback?: string;
    };
  }
}

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

function App() {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
