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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="fixed top-0 z-10 flex h-[--header-height] w-full items-center border-b bg-white bg-opacity-95 backdrop-blur">
      <div className="container mx-auto flex w-full justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 whitespace-nowrap">
            <img src="/favicon.png" className="size-8" />
            <span className="font-medium">ФСП ЛИНК</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <NavLink to="/">Главная</NavLink>
            <NavLink to="/federations">Федерации</NavLink>
            <NavLink to="/disciplines">Дисциплины</NavLink>
            <NavLink to="/calendar">Календарь</NavLink>
            <NavLink to="/search">Мероприятия</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>

          {isLoading
            ? (
                <div
                  className="h-9 w-24 animate-pulse rounded bg-muted"
                />
              )
            : (
                <div className="hidden items-center gap-2 lg:flex">
                  {(me?.role === 'admin' || me?.federation) && (
                    <NavLink to="/manage">Панель управления</NavLink>
                  )}
                  {!me && <NavLink to="/auth/login">Войти</NavLink>}
                  {me && (
                    <Button
                      variant="ghost"
                      onClick={() => performLogout({})}
                    >
                      Выйти
                    </Button>
                  )}
                </div>
              )}
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Link to="/about" activeProps={{ className: 'text-foreground' }}>
              <HelpCircle className="size-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="absolute left-0 top-[--header-height] w-full border-b bg-white md:hidden">
          <div className="flex flex-col gap-4 p-4">
            <div onClick={toggleMenu}>
              <NavLink to="/">Главная</NavLink>
            </div>
            <div onClick={toggleMenu}>
              <NavLink to="/federations">Федерации</NavLink>
            </div>
            <div onClick={toggleMenu}>
              <NavLink to="/disciplines">Дисциплины</NavLink>
            </div>
            <div onClick={toggleMenu}>
              <NavLink to="/calendar">Календарь</NavLink>
            </div>
            <div onClick={toggleMenu}>
              <NavLink to="/search">Мероприятия</NavLink>
            </div>
            {(me?.role === 'admin' || me?.federation) && (
              <div onClick={toggleMenu}>
                <NavLink to="/manage">Панель управления</NavLink>
              </div>
            )}
            {!me && (
              <div onClick={toggleMenu}>
                <NavLink to="/auth/login">Войти</NavLink>
              </div>
            )}
            {me && (
              <Button
                variant="ghost"
                onClick={() => {
                  performLogout({})
                  toggleMenu()
                }}
              >
                Выйти
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
