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

  return (
    <main className="fixed inset-0 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex h-full flex-col items-center justify-center p-4 sm:p-8">

        {!isSuccess
          ? (
              <Card className="w-full max-w-[min(400px,calc(100vw-2rem))] transition-all duration-200 sm:shadow-lg">
                <CardHeader className="space-y-2 px-6 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
                  <CardTitle className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
                    Восстановление пароля
                  </CardTitle>
                  <CardDescription className="text-center text-sm text-muted-foreground sm:text-base">
                    Введите свой логин или email для восстановления пароля.
                    К аккаунту должен быть привязан email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                  <form className="flex flex-col gap-4 sm:gap-6" onSubmit={onSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          value={login}
                          onChange={e => setLogin(e.target.value)}
                          placeholder="Логин или email"
                          type="text"
                          className="h-11 text-base sm:h-12"
                          autoComplete="username"
                          autoFocus
                        />
                      </div>
                    </div>

                    {(error) && (
                      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive sm:text-base">
                        {(error?.detail || error || '').toString()}
                      </div>
                    )}

                    <div className="space-y-3 sm:space-y-4">
                      <Button
                        type="submit"
                        className="h-11 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-base font-semibold hover:from-purple-600 hover:to-indigo-600 sm:h-12"
                        disabled={isPending}
                      >
                        {isPending
                          ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin sm:size-5" />
                                Отправка...
                              </>
                            )
                          : (
                              'Отправить'
                            )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )
          : (
              <Card className="w-full max-w-[min(400px,calc(100vw-2rem))] transition-all duration-200 sm:shadow-lg">
                <CardHeader className="space-y-2 px-6 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
                  <CardTitle className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
                    Восстановление пароля
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p>На ваш email было отправлено письмо с инструкциями по восстановлению пароля.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

        <Button
          asChild
          type="button"
          variant="link"
          className="h-11 w-full text-base font-normal hover:text-purple-600 sm:h-12"
        >
          <Link to="/auth/login">
            Войти
          </Link>
        </Button>
      </div>
    </main>
  )
}
