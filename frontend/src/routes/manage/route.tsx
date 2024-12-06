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

      <nav className="flex flex-col p-2">
        <Button asChild variant="link" className="mb-1 justify-start">
          <Link
            to="/manage/admin/home"
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
            to="/manage/region/home"
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
            to="/manage/region/events"
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
            to="/manage/region/requests"
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
            to="/manage/region/feedback"
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
            to="/manage/region/profile"
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
