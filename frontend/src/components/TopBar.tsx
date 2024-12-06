import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { Button } from '@/components/ui/button.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import HelpCircle from '~icons/lucide/help-circle'
import { NavLink } from './NavLink'

export function TopBar() {
  const { data: me, isLoading } = useMe()

  const queryClient = useQueryClient()
  const { mutate: performLogout } = $api.useMutation('post', '/users/logout', {
    onSettled: () => queryClient.resetQueries(),
  })

  return (
    <header className="fixed top-0 z-10 flex h-[--header-height] w-full items-center border-b bg-white bg-opacity-95 backdrop-blur">
      <div className="container mx-auto flex w-full justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src="/favicon.png" className="size-8" />
          </Link>
          <NavLink to="/">Главная</NavLink>
          <NavLink to="/federations">Федерации</NavLink>
          <NavLink to="/disciplines">Дисциплины</NavLink>
          <NavLink to="/calendar">Календарь</NavLink>
          <NavLink to="/search">Мероприятия</NavLink>
        </div>

        <div className="flex items-center gap-2">
          {isLoading
            ? (
                <div className="h-9 w-24 animate-pulse rounded bg-muted" />
              )
            : (
                <>
                  {(me?.role === 'admin' || me?.federation) && (
                    <NavLink to="/manage">Панель управления</NavLink>
                  )}
                  {!me && (
                    <NavLink to="/auth/login">Войти</NavLink>
                  )}
                  {me && (
                    <Button variant="ghost" onClick={() => performLogout({})}>
                      Выйти
                    </Button>
                  )}
                </>
              )}
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Link
              to="/about"
              activeProps={{ className: 'text-foreground' }}
            >
              <HelpCircle className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
