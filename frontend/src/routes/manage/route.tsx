import { useMe, useMyFederation } from '@/api/me.ts'
import { NavLink } from '@/components/NavLink'
import { Separator } from '@/components/ui/separator.tsx'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import Award from '~icons/lucide/award'
import Home from '~icons/lucide/home'
import MessageSquare from '~icons/lucide/message-square'
import User from '~icons/lucide/user'
import Users from '~icons/lucide/users'

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me } = useMe()

  return (
    <div className="mt-[calc(var(--header-height)*-1)] flex-grow bg-gray-50">
      <aside
        className="fixed bottom-0 left-0 top-[var(--header-height)] w-[var(--manage-sidebar-width)] overflow-y-auto border-r bg-white"
      >
        <div>
          {me?.role === 'admin' && <AdminNav />}
          {me?.role === 'admin' && me?.federation && <Separator />}
          {me?.federation && <FederationNav />}
        </div>
      </aside>

      <main className="pl-[var(--manage-sidebar-width)] pt-[var(--header-height)]">
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
        <NavLink to="/manage/events/all" icon={Award}>
          Мероприятия
        </NavLink>
      </nav>
    </>
  )
}

function FederationNav() {
  const { data: myFederation } = useMyFederation()

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

        <NavLink to="/manage/region/feedback" icon={MessageSquare}>
          Связь с федерацией
        </NavLink>

        <NavLink to="/manage/federations/$id" params={{ id: myFederation?.id }} icon={User}>
          Настройки профиля
        </NavLink>
      </nav>
    </>
  )
}
