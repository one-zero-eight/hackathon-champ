import { useMe, useMyFederation } from '@/api/me.ts'
import { NavLink } from '@/components/NavLink'
import { Separator } from '@/components/ui/separator.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import Award from '~icons/lucide/award'
import BarChart from '~icons/lucide/bar-chart-2'
import Home from '~icons/lucide/home'
import Mail from '~icons/lucide/mail'
import MessageSquare from '~icons/lucide/message-square'
import User from '~icons/lucide/user'
import Users from '~icons/lucide/users'

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me, isLoading } = useMe()

  return (
    <div className="mt-[calc(var(--header-height)*-1)] flex-grow bg-gray-50 print:bg-transparent">
      <aside
        className="do-not-print fixed bottom-0 left-0 top-[var(--header-height)] w-[var(--manage-sidebar-width)] overflow-y-auto border-r bg-white"
      >
        <div className="flex min-h-full flex-col">
          {isLoading
            ? (
                <SidebarSkeleton />
              )
            : (
                <>
                  {me?.role === 'admin' && <AdminNav />}
                  {me?.role === 'admin' && me?.federation && <Separator />}
                  {me?.federation && <FederationNav />}
                  <div className="grow" />
                  <nav className="flex flex-col gap-1 p-2">
                    <NavLink to="/manage/email" icon={Mail}>
                      Настройки email
                    </NavLink>
                  </nav>
                </>
              )}
        </div>
      </aside>

      <main className="pl-[var(--manage-sidebar-width)] pt-[var(--header-height)] print:pl-0">
        <Outlet />
      </main>
    </div>
  )
}

function AdminNav() {
  return (
    <>
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">Администрация</h2>
        <p className="text-sm text-muted-foreground">
          Управление общероссийской федерацией
        </p>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <NavLink to="/manage/admin/home" icon={Home}>
          Самое важное
        </NavLink>
        <NavLink to="/manage/federations" icon={Users}>
          Федерации
        </NavLink>
        <NavLink to="/manage/admin/users" icon={Users}>
          Пользователи
        </NavLink>
        <NavLink to="/manage/events/all" icon={Award}>
          Мероприятия
        </NavLink>
        <NavLink to="/manage/analytics" icon={BarChart}>
          Аналитика
        </NavLink>
        <NavLink to="/manage/feedback/all" icon={MessageSquare}>
          Запросы
        </NavLink>
      </nav>
    </>
  )
}

function FederationNav() {
  const { data: myFederation, isLoading } = useMyFederation()

  if (isLoading) {
    return <FederationNavSkeleton />
  }

  return (
    <>
      <div className="border-b p-4">
        <h2 className="text-lg font-medium">{myFederation?.region}</h2>
        <p className="text-sm text-muted-foreground">
          Кабинет регионального представителя федерации
        </p>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <NavLink to="/manage/region/home" icon={Home}>
          Самое важное
        </NavLink>
        <NavLink to="/manage/events/region" icon={Award}>
          Мероприятия
        </NavLink>
        <NavLink
          to="/manage/analytics/$id"
          params={{ id: myFederation?.id }}
          icon={BarChart}
        >
          Аналитика
        </NavLink>
        <NavLink to="/manage/feedback/region" icon={MessageSquare}>
          Связь с федерацией
        </NavLink>
        <NavLink
          to="/manage/federations/$id"
          params={{ id: myFederation?.id }}
          icon={User}
        >
          Настройки профиля
        </NavLink>
      </nav>
    </>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-5 w-48" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

function FederationNavSkeleton() {
  return (
    <>
      <div className="border-b p-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-1 h-5 w-48" />
      </div>
      <div className="space-y-2 p-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </>
  )
}
