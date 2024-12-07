import type { FormEvent } from 'react'
import { $api } from '@/api'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Input } from '@/components/ui/input.tsx'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import Loader2 from '~icons/lucide/loader'

export const Route = createFileRoute('/auth/start-reset-password')({
  component: RouteComponent,
})

function RouteComponent() {
  const [login, setLogin] = useState('')
  const { mutate, error, isPending, isSuccess } = $api.useMutation('post', '/email/start-reset-password')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    mutate({ params: { query: { email_or_login: login } } })
  }

  // Helper function to safely get error message
  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'detail' in error) {
      return String(error.detail)
    }
    return String(error)
  }

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
              <div className="relative">
                {/* Logo background effect */}
                <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
                {/* Actual logo */}
                <img
                  src="/favicon.png"
                  alt="Platform Logo"
                  className="relative size-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Платформа управления регионами
              </h1>
              <div className="space-y-4">
                <p className="mx-auto max-w-sm text-gray-600">
                  Современное решение для эффективного управления и мониторинга региональных данных
                </p>
                <p className="mx-auto max-w-sm text-sm text-gray-500">
                  Аналитика • Мониторинг • Управление
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Start reset password form */}
      <div className="relative flex w-full flex-col justify-center bg-white lg:w-1/2">
        <div className="mx-auto w-full max-w-[440px] px-8">
          {!isSuccess
            ? (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                      Восстановление пароля
                    </h2>
                    <p className="mt-2 text-gray-600">
                      Введите логин или email для восстановления доступа
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={onSubmit}>
                    <div>
                      <Input
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        placeholder="Логин или email"
                        type="text"
                        className="h-12 border-gray-200 bg-white text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
                        autoComplete="username"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                        {getErrorMessage(error)}
                      </div>
                    )}

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        className="relative h-12 w-full overflow-hidden bg-violet-500 text-base font-medium text-white transition-all hover:bg-violet-600 disabled:opacity-70"
                        disabled={isPending}
                      >
                        {isPending
                          ? (
                              <div className="flex items-center justify-center">
                                <Loader2 className="mr-2 size-5 animate-spin" />
                                <span>Отправка...</span>
                              </div>
                            )
                          : (
                              'Отправить'
                            )}
                      </Button>

                      <div className="text-center">
                        <Button
                          asChild
                          type="button"
                          variant="link"
                          className="h-12 text-base font-normal text-gray-500 hover:text-violet-600"
                        >
                          <Link to="/auth/login">
                            Вернуться ко входу
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </form>
                </>
              )
            : (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
                      Проверьте почту
                    </h2>
                    <p className="mt-2 text-gray-600">
                      Мы отправили инструкции по восстановлению пароля на ваш email
                    </p>
                  </div>

                  <div className="text-center">
                    <Button
                      asChild
                      type="button"
                      variant="link"
                      className="h-12 text-base font-normal text-gray-500 hover:text-violet-600"
                    >
                      <Link to="/auth/login">
                        Вернуться ко входу
                      </Link>
                    </Button>
                  </div>
                </>
              )}
        </div>
      </div>
    </main>
  )
}
