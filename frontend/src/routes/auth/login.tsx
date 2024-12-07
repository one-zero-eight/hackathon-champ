import type { FormEvent } from 'react'
import { $api } from '@/api'
import { useMe } from '@/api/me'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import Loader2 from '~icons/lucide/loader'

function RotatingLogo() {
  const logoRef = useRef<HTMLImageElement>(null)
  const [rotation, setRotation] = useState(20)
  const frameRef = useRef<number>()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!logoRef.current)
      return

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current)
    }

    frameRef.current = requestAnimationFrame(() => {
      const rect = logoRef.current!.getBoundingClientRect()
      const logoX = rect.left + rect.width / 2
      const logoY = rect.top + rect.height / 2

      const deltaX = e.clientX - logoX
      const deltaY = e.clientY - logoY

      const degrees = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90
      setRotation(degrees)
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [handleMouseMove])

  return (
    <div className="relative">
      {/* Logo background effect */}
      <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl" />

      {/* Actual logo */}
      <img
        ref={logoRef}
        src="/favicon.png"
        alt="Platform Logo"
        style={{
          transform: `rotate(${rotation - 34}deg)`,
          willChange: 'transform',
        }}
        className="relative size-48 object-contain drop-shadow-2xl"
      />
    </div>
  )
}

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirectTo?: string } => {
    return {
      redirectTo: (search.redirectTo as string | undefined) || undefined,
    }
  },
})

function RouteComponent() {
  const { redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const { data: me, isLoading: isLoadingMe } = useMe()

  // Redirect if already authenticated
  useEffect(() => {
    if (me && !isLoadingMe) {
      navigate({ to: '/manage/region/home' })
    }
  }, [me, isLoadingMe, navigate])

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [register, setRegister] = useState(false)

  const queryClient = useQueryClient()
  const {
    mutate: performLogin,
    error: errorLogin,
    reset: resetLogin,
    isPending: isPendingLogin,
  } = $api.useMutation('post', '/users/login', {
    onSettled: () => queryClient.resetQueries(),
  })
  const {
    mutate: performRegister,
    error: errorRegister,
    reset: resetRegister,
    isPending: isPendingRegister,
  } = $api.useMutation('post', '/users/register', {
    onSettled: () => queryClient.resetQueries(),
    onSuccess: () => window.location.assign(redirectTo || '/'),
  })

  useEffect(() => {
    if (errorLogin) {
      console.error(errorLogin)
    }
  }, [errorLogin])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (register) {
      performRegister({ params: { query: { login, password } } })
    }
    else {
      performLogin({ params: { query: { login, password } } })
    }
  }

  // Update loading state UI
  if (isLoadingMe) {
    return (
      <main className="fixed inset-0 bg-white">
        <div className="flex h-full items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-20 blur-lg" />
            <Loader2 className="relative size-8 animate-spin text-violet-500" />
          </div>
        </div>
      </main>
    )
  }

  if (me)
    return null

  return (
    <main className="fixed inset-0 flex min-h-screen bg-white">
      {/* Left panel - Decorative */}
      <div className="hidden w-1/2 bg-gradient-to-br from-violet-50 via-violet-100/50 to-fuchsia-50 lg:block">
        <div className="relative flex h-full flex-col items-center justify-center p-8">
          <div className="absolute inset-0">
            <div className="absolute left-1/4 top-1/4 size-32 rounded-full bg-violet-200/50 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 size-32 rounded-full bg-fuchsia-200/50 blur-3xl" />
          </div>

          <div className="relative space-y-12 text-center">
            {/* Logo section */}
            <div className="mx-auto flex items-center justify-center">
              <RotatingLogo />
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Платформа ФСП Линк
              </h1>
              <div className="space-y-4">
                <p className="mx-auto max-w-sm text-gray-600">
                  Современное решение для эффективного управления и мониторинга федераций спортивного программирования
                </p>
                <p className="mx-auto max-w-sm text-sm text-gray-500">
                  Аналитика • Мониторинг • Управление
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="relative flex w-full flex-col justify-center bg-white lg:w-1/2">
        <div className="mx-auto w-full max-w-[440px] px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              {register ? 'Создать аккаунт' : 'Войти в систему'}
            </h2>
            <p className="mt-2 text-gray-600">
              {register
                ? 'Заполните форму для создания аккаунта'
                : 'Войдите в свой аккаунт для продолжения'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="Логин"
                  type="text"
                  className="h-12 border-gray-200 bg-white text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              <div>
                <Input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Пароль"
                  type="password"
                  className="h-12 border-gray-200 bg-white text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
                  autoComplete={register ? 'new-password' : 'current-password'}
                />
              </div>
            </div>

            {(errorLogin || errorRegister) && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {((errorLogin?.detail || errorLogin || '') || (errorRegister?.detail || errorRegister || '')).toString()}
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="relative h-12 w-full overflow-hidden bg-violet-500 text-base font-medium text-white transition-all hover:bg-violet-600 disabled:opacity-70"
                disabled={isPendingLogin || isPendingRegister}
              >
                {isPendingLogin || isPendingRegister
                  ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        <span>{register ? 'Создание...' : 'Вход...'}</span>
                      </div>
                    )
                  : (
                      register ? 'Создать аккаунт' : 'Войти'
                    )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRegister(v => !v)
                  resetLogin()
                  resetRegister()
                }}
                className="h-12 w-full text-base font-normal text-gray-600 hover:bg-gray-50 hover:text-violet-600"
              >
                {!register
                  ? 'Нет аккаунта? Создать'
                  : 'Уже есть аккаунт? Войти'}
              </Button>

              <div className="text-center">
                <Button
                  asChild
                  type="button"
                  variant="link"
                  className="h-12 text-base font-normal text-gray-500 hover:text-violet-600"
                >
                  <Link to="/auth/start-reset-password">
                    Забыли пароль?
                  </Link>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
