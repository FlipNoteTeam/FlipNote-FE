import { QueryClient } from "@tanstack/react-query";
import { notifyError } from "@/shared/lib/error";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.skipErrorToast) return;
        notifyError(error, mutation.meta?.errorFallback);
      },
    },
  },
});
