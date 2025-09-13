import * as React from "react";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import type { AuthState } from "@/stores/auth";

interface RouterContext {
  auth: AuthState;
}
export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
