import type { FormEvent } from 'react'
import { $api } from '@/api'
import { useMe } from '@/api/me'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Loader2 from '~icons/lucide/loader'

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

  // Show loading state while checking authentication
  if (isLoadingMe) {
    return (
      <main className="fixed inset-0 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex h-full items-center justify-center">
          <Loader2 className="size-8 animate-spin text-purple-500" />
        </div>
      </main>
    )
  }

  // Don't render the form if user is authenticated
  if (me)
    return null

  return (
    <main className="fixed inset-0 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex h-full flex-col items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-[min(400px,calc(100vw-2rem))] transition-all duration-200 sm:shadow-lg">
          <CardHeader className="space-y-2 px-6 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
            <CardTitle className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              {register ? 'Регистрация' : 'Вход в систему'}
            </CardTitle>
            <CardDescription className="text-center text-sm text-muted-foreground sm:text-base">
              {register
                ? 'Создайте аккаунт для доступа к платформе'
                : 'Войдите в свой аккаунт для продолжения'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Логин"
                    type="text"
                    className="h-11 text-base sm:h-12"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Пароль"
                    type="password"
                    className="h-11 text-base sm:h-12"
                    autoComplete={register ? 'new-password' : 'current-password'}
                  />
                </div>
              </div>

              {(errorLogin || errorRegister) && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive sm:text-base">
                  {((errorLogin?.detail || errorLogin || '') || (errorRegister?.detail || errorRegister || '')).toString()}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <Button
                  type="submit"
                  className="h-11 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-base font-semibold hover:from-purple-600 hover:to-indigo-600 sm:h-12"
                  disabled={isPendingLogin || isPendingRegister}
                >
                  {isPendingLogin || isPendingRegister
                    ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin sm:size-5" />
                          {register ? 'Регистрация...' : 'Вход...'}
                        </>
                      )
                    : (
                        register ? 'Зарегистрироваться' : 'Войти'
                      )}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setRegister(v => !v)
                    resetLogin()
                    resetRegister()
                  }}
                  className="h-11 w-full text-base font-normal hover:text-purple-600 sm:h-12"
                >
                  {!register
                    ? 'Нет аккаунта? Зарегистрируйтесь'
                    : 'Уже есть аккаунт? Войдите'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Button
          asChild
          type="button"
          variant="link"
          className="h-11 w-full text-base font-normal hover:text-purple-600 sm:h-12"
        >
          <Link to="/auth/start-reset-password">
            Забыли пароль?
          </Link>
        </Button>
      </div>
    </main>
  )
}
