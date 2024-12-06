import { useMe, useMyFederation } from '@/api/me.ts'
import { Button } from '@/components/ui/button.tsx'
import { Separator } from '@/components/ui/separator.tsx'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import Award from '~icons/lucide/award'
import FileText from '~icons/lucide/file-text'
import Home from '~icons/lucide/home'
import MessageSquare from '~icons/lucide/message-square'
import User from '~icons/lucide/user'

export const Route = createFileRoute('/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me } = useMe()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-64 border-r bg-white"
      >
        {me?.role === 'admin' && <AdminNav />}
        {me?.role === 'admin' && me?.federation && <Separator />}
        {me?.federation && <FederationNav />}
      </aside>

      <Outlet />
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

      <nav className="flex flex-col p-2">
        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/admin"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <Home className="size-5" />
            Самое важное
          </Link>
        </Button>
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

      <nav className="flex flex-col p-2">
        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/regional"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <Home className="size-5" />
            Самое важное
          </Link>
        </Button>

        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/events"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <Award className="size-5" />
            Мероприятия
          </Link>
        </Button>

        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/requests"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <FileText className="size-5" />
            Заявки
          </Link>
        </Button>

        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/feedback"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <MessageSquare className="size-5" />
            Связь с федерацией
          </Link>
        </Button>

        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/profile"
            className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium underline-offset-4"
            activeProps={{
              className: 'underline',
            }}
          >
            <User className="size-5" />
            Настройки профиля
          </Link>
        </Button>
      </nav>
    </>
  )
}
