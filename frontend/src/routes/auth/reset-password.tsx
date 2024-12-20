import type { FormEvent } from 'react'
import { $api } from '@/api'
import { Button } from '@/components/ui/button.tsx'
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
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
          Новый пароль
        </h2>
        <p className="mt-2 text-gray-600">
          Придумайте новый пароль для вашего аккаунта
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <Input
            value={new_password}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Новый пароль"
            type="password"
            className="h-12 border-gray-200 bg-white text-base shadow-sm transition-all placeholder:text-gray-400 focus:border-violet-500 focus:ring-violet-500"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {(error?.detail || error || '').toString()}
          </div>
        )}

        <Button
          type="submit"
          className="relative h-12 w-full overflow-hidden bg-violet-500 text-base font-medium text-white transition-all hover:bg-violet-600 disabled:opacity-70"
          disabled={isPending}
        >
          {isPending
            ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  <span>Сохранение...</span>
                </div>
              )
            : (
                'Сохранить пароль'
              )}
        </Button>
      </form>
    </>
  )
}
