import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { Button } from '@/components/ui/button.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import HelpCircle from '~icons/lucide/help-circle'
import Menu from '~icons/lucide/menu'
import X from '~icons/lucide/x'
import { NavLink } from './NavLink'

const NAVIGATION_ITEMS = [
  { to: '/', label: 'Главная' },
  { to: '/federations', label: 'Федерации' },
  { to: '/disciplines', label: 'Дисциплины' },
  { to: '/calendar', label: 'Календарь' },
  { to: '/search', label: 'Мероприятия' },
  { to: '/participants', label: 'Участники' },
] as const

export function TopBar() {
  const navigate = useNavigate()
  const { data: me, isLoading } = useMe()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: performLogout } = $api.useMutation('post', '/users/logout', {
    onSettled: () => {
      queryClient.resetQueries()
      navigate({ to: '/auth/login' })
    },
  })

  const handleLogout = () => {
    performLogout({})
    setIsMenuOpen(false)
  }

  return (
    <header className="do-not-print fixed top-0 z-50 flex h-[--header-height] w-full items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
            <img src="/favicon.png" alt="Logo" className="size-8" />
            <span className="font-medium">ФСП ЛИНК</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 sm:gap-2 md:flex">
            {NAVIGATION_ITEMS.map(({ to, label }) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Auth section */}
          {isLoading
            ? (
                <div
                  className="h-9 w-24 animate-pulse rounded bg-muted"
                />
              )
            : (
                <div className="hidden items-center gap-2 md:flex">
                  {(me?.role === 'admin' || me?.federation) && (
                    <NavLink to="/manage">Панель управления</NavLink>
                  )}
                  {!me
                    ? (
                        <NavLink to="/auth/login">
                          Войти
                        </NavLink>
                      )
                    : (
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                        >
                          Выйти
                        </Button>
                      )}
                </div>
              )}

          {/* Help button */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Link to="/about" activeProps={{ className: 'text-foreground' }}>
              <HelpCircle className="size-5" aria-label="Помощь" />
            </Link>
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <nav
          className="absolute left-0 top-[--header-height] w-full border-b bg-white/95 backdrop-blur md:hidden"
          aria-label="Мобильное меню"
        >
          <div className="flex flex-col gap-2 p-4">
            {NAVIGATION_ITEMS.map(({ to, label }) => (
              <div key={to} onClick={() => setIsMenuOpen(false)}>
                <NavLink to={to}>{label}</NavLink>
              </div>
            ))}
            {(me?.role === 'admin' || me?.federation) && (
              <div onClick={() => setIsMenuOpen(false)}>
                <NavLink to="/manage">Панель управления</NavLink>
              </div>
            )}
            {!me
              ? (
                  <div onClick={() => setIsMenuOpen(false)}>
                    <NavLink to="/auth/login">
                      Войти
                    </NavLink>
                  </div>
                )
              : (
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                  >
                    Выйти
                  </Button>
                )}
          </div>
        </nav>
      )}
    </header>
  )
}
