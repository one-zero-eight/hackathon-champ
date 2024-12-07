import type { FormEvent } from 'react'
import { $api } from '@/api'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import Loader2 from '~icons/lucide/loader'

export const Route = createFileRoute('/auth/reset-password')({
  component: RouteComponent,
  validateSearch: (
    search: Record<string, unknown>,
  ): { email_flow_id: string, verification_code: string } => {
    return {
      email_flow_id: (search.email_flow_id as string | undefined) || '',
      verification_code: (search.verification_code as string | undefined) || '',
    }
  },
})

function RouteComponent() {
  const { email_flow_id, verification_code } = Route.useSearch()
  const navigate = useNavigate()

  const [new_password, setNewPassword] = useState('')

  const queryClient = useQueryClient()
  const { mutate, error, isPending } = $api.useMutation('post', '/email/set-new-password', {
    onSettled: () => queryClient.resetQueries(),
    onSuccess: () => navigate({ to: '/auth/login' }),
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    mutate({ params: { query: { email_flow_id, verification_code, new_password } } })
  }

  return (
    <main className="fixed inset-0 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
      <div className="flex h-full items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-[min(400px,calc(100vw-2rem))] transition-all duration-200 sm:shadow-lg">
          <CardHeader className="space-y-2 px-6 pb-4 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
            <CardTitle className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Смена пароля
            </CardTitle>
            <CardDescription className="text-center text-sm text-muted-foreground sm:text-base">
              Введите новый пароль для вашего аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <form className="flex flex-col gap-4 sm:gap-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={new_password}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Пароль"
                    type="password"
                    className="h-11 text-base sm:h-12"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
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
      </div>
    </main>
  )
}
