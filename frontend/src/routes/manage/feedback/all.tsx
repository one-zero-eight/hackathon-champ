import { $api } from '@/api'
import { useMe } from '@/api/me.ts'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/manage/feedback/all')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
  }, [meError, navigate])

  const { data: feedbackList } = $api.useQuery('get', '/feedback/')

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Запросы обратной связи
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Просмотр анонимных запросов и запросов от региональных федераций.
        </p>
      </div>

      {feedbackList?.map(feedback => (
        <div
          key={feedback.id}
          className="relative mb-2 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors"
        >
          <div className="flex flex-col gap-3">
            {/* Header with subject and timestamp */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{feedback.subject}</h3>
              </div>
              {feedback.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  <a
                    href={`mailto:${feedback.email}`}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {feedback.email}
                  </a>
                </div>
              )}
            </div>

            {/* Message content */}
            <div className="rounded-md bg-muted/50 p-3">
              <p className="whitespace-pre-wrap text-sm">{feedback.text}</p>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-blue-500" />
              <span className="text-sm text-muted-foreground">
                Запрос записан
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
