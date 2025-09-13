import { createRouter, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { routeTree } from "./routeTree.gen";
import useAuthStore from "@/stores/useAuthStore";
import { type AuthState } from "@/stores/useAuthStore";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: () => { auth: AuthState | undefined };
  }
}
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const auth = useAuthStore();

  return (
    <div className="min-w-dvw min-h-dvh p-8 bg-gray-50">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ auth }} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

export default App;
