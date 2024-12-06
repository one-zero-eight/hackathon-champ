import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { Button } from '@/components/ui/button.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

export function TopBar() {
  const { data: me } = useMe()
  const { data: myFederation } = $api.useQuery('get', '/federations/{id}', {
    params: { path: { id: me?.federation ?? '' } },
  }, { enabled: !!me?.federation })

  const queryClient = useQueryClient()
  const { mutate: performLogout } = $api.useMutation('post', '/users/logout', {
    onSettled: () => queryClient.resetQueries(),
  })

  return (
    <header className="fixed top-0 z-10 flex h-[--header-height] w-full justify-between border-b bg-white bg-opacity-90 backdrop-blur">
      <div className="flex items-center gap-2 px-2">
        <img src="/favicon.png" className="size-8" />
        <Button asChild variant="link">
          <Link to="/" activeProps={{ className: 'underline' }}>
            Главная
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/disciplines"
            activeProps={{ className: 'underline' }}
          >
            Дисциплины
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/federations"
            activeProps={{ className: 'underline' }}
          >
            Региональные федерации
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/calendar"
            activeProps={{ className: 'underline' }}
          >
            Календарь
          </Link>
        </Button>
        <Button asChild variant="link">
          <Link
            to="/search"
            activeProps={{ className: 'underline' }}
          >
            Поиск
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 px-2">
        {!me && (
          <Button asChild variant="link">
            <Link
              to="/auth/login"
              activeProps={{ className: 'underline' }}
            >
              Войти
            </Link>
          </Button>
        )}
        {me?.role === 'admin' && (
          <>
            <div className="text-lg">{me.login}</div>
            <Button asChild variant="link">
              <Link
                to="/manage/admin"
                activeProps={{ className: 'underline' }}
              >
                Панель администратора
              </Link>
            </Button>
            <Button variant="link" onClick={() => performLogout({})}>
              Выйти
            </Button>
          </>
        )}
        {me?.federation && (
          <>
            <div className="text-lg">{me.login}</div>
            <Button asChild variant="link">
              <Link
                to="/manage/regional"
                activeProps={{ className: 'underline' }}
              >
                {myFederation?.region || 'Панель управления'}
              </Link>
            </Button>
            <Button variant="link" onClick={() => performLogout({})}>
              Выйти
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
