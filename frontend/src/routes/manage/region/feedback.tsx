import type { SchemaFeedbackSchema } from '@/api/types'
import { $api } from '@/api'
import { useMe, useMyFederation } from '@/api/me'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Loader2 from '~icons/lucide/loader-2'
import MessageSquare from '~icons/lucide/message-square'

export const Route = createFileRoute('/manage/region/feedback')({
  component: FederationFeedbackPage,
})

function FederationFeedbackPage() {
  const { toast } = useToast()
  const { data: federation } = useMyFederation()
  const { data: me } = useMe()
  const { mutate: createFeedback } = $api.useMutation('post', '/feedback/')

  // Get feedback for current federation
  const { data: feedbackList } = $api.useQuery(
    'get',
    '/feedback/federations/{id}',
    {
      params: {
        path: { id: federation?.id ?? '' },
      },
    },
    {
      enabled: !!federation?.id,
    },
  )

  const [request, setRequest] = useState<SchemaFeedbackSchema>({
    subject: '',
    text: '',
    email: me?.email ?? null,
    federation: federation?.id ?? null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Update email when user data loads
  useEffect(() => {
    if (me?.email) {
      setRequest(prev => ({ ...prev, email: me.email }))
    }
  }, [me?.email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      createFeedback({
        body: {
          ...request,
          federation: federation?.id ?? null,
          email: request.email || me?.email || null,
        },
      }, {
        onSuccess: () => {
          setSubmitSuccess(true)
          setRequest({
            subject: '',
            text: '',
            email: me?.email ?? null,
            federation: federation?.id ?? null,
          })

          toast({
            title: 'Успешно отправлено',
            description: 'Ваш запрос был отправлен',
          })
        },
      })
    }
    catch {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось отправить запрос. Попробуйте позже.',
      })
    }
    finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Запросы федерации</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Просмотр и отправка запросов в общероссийскую федерацию
        </p>
      </div>

      {/* List of existing feedback */}
      {feedbackList && feedbackList.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">История запросов</CardTitle>
            <CardDescription className="text-sm">
              Последние отправленные запросы
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:gap-6">
            {feedbackList.map(feedback => (
              <div
                key={feedback.id}
                className="relative rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-muted/50"
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
                        <span>{feedback.email}</span>
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
                      Запрос отправлен
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {submitSuccess
        ? (
            <Card>
              <CardContent className="grid gap-4 pt-6 sm:gap-6">
                <div className="flex items-center gap-2 text-green-600">
                  <MessageSquare className="size-5" />
                  <span>Спасибо за ваш запрос! Мы ответим вам в ближайшее время.</span>
                </div>
              </CardContent>
            </Card>
          )
        : (
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Новый запрос</CardTitle>
                <CardDescription className="text-sm">
                  Отправьте запрос администратору
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:gap-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Тема запроса *
                      </label>
                      <Input
                        id="subject"
                        required
                        maxLength={100}
                        value={request.subject}
                        onChange={e => setRequest(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        type="email"
                        id="email"
                        value={request.email || ''}
                        onChange={e => setRequest(prev => ({
                          ...prev,
                          email: e.target.value ? e.target.value.trim() : me?.email ?? null,
                        }))}
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                        placeholder={me?.email ?? ''}
                        className="w-full"
                      />
                      <p className="text-sm text-muted-foreground">
                        Ответ будет отправлен на этот email
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="text" className="text-sm font-medium">
                      Текст запроса *
                    </label>
                    <textarea
                      id="text"
                      required
                      maxLength={1000}
                      value={request.text}
                      onChange={e => setRequest(prev => ({ ...prev, text: e.target.value }))}
                      rows={4}
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto"
                    >
                      {isSubmitting
                        ? (
                            <>
                              <span className="mr-2">Отправка...</span>
                              <Loader2 className="size-4 animate-spin" />
                            </>
                          )
                        : (
                            'Отправить запрос'
                          )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
    </div>
  )
}
