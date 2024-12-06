import { TopBar } from "@/components/TopBar.tsx";
import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="flex flex-col">
      <div className="w-full h-[var(--header-height)]"></div>
      <TopBar />
      <Outlet />
      <ScrollRestoration />
    </div>
  ),
});
