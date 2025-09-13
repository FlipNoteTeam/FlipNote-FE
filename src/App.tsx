import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import useAuthStore, { type AuthState } from "@/stores/auth";
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
  return (
    <div className="min-w-dvw min-h-dvh p-8 bg-gray-50">
      <QueryClientProvider client={queryClient}>
        <InnerApp />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </div>
  );
}

function InnerApp() {
  const auth = useAuthStore();
  return <RouterProvider router={router} context={{ auth }} />;
}

export default App;
