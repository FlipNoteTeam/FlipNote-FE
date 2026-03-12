import * as React from "react";
import {
  HeadContent,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { AuthState } from "@/stores/use-auth-store";
import { ErrorBoundary } from "@/shared/components/error-boundary";

interface RouterContext {
  auth: AuthState | undefined;
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <HeadContent />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </React.Fragment>
  );
}
