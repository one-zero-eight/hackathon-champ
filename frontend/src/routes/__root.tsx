import { useMe } from '@/api/me.ts'
import { TopBar } from '@/components/TopBar.tsx'
import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const { data: me } = useMe()

  return (
    <div className="flex min-h-full flex-col">
      <div className="do-not-print h-[var(--header-height)] w-full flex-shrink-0"></div>
      {me?.role === 'admin' && <div className="fixed left-8 top-3 z-[10000] rounded-lg bg-orange-600 px-2 py-1 text-lg font-semibold text-white">Админ</div>}
      <TopBar />
      <Outlet />
      <ScrollRestoration />
    </div>
  )
}
