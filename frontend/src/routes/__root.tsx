import { TopBar } from '@/components/TopBar.tsx'
import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-full flex-col">
      <div className="h-[var(--header-height)] w-full flex-shrink-0"></div>
      <TopBar />
      <Outlet />
      <ScrollRestoration />
    </div>
  ),
})
