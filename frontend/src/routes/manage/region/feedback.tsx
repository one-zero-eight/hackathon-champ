import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import MessageSquare from '~icons/lucide/message-square'
import { useToast } from '@/components/ui/use-toast'
import Loader2 from '~icons/lucide/loader-2'
import { SchemaFeedback, SchemaFeedbackSchema } from '@/api/types'
import { useMe, useMyFederation } from '@/api/me'
import { $api } from '@/api'

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
        path: { id: federation?.id ?? '' }
      }
    },
    {
      enabled: !!federation?.id
    }
  )
  
  const [request, setRequest] = useState<SchemaFeedbackSchema>({
    subject: '',
    text: '',
    email: me?.login ?? null,
    federation: federation?.id ?? null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Update email when user data loads
  useEffect(() => {
    if (me?.login) {
      setRequest(prev => ({ ...prev, email: me.login }))
    }
  }, [me?.login])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      createFeedback({
        body: {
          ...request,
          federation: federation?.id ?? null,
          email: request.email || me?.login || null
        }
      },{
        onSuccess: () => {
          setSubmitSuccess(true)
          setRequest({
            subject: '',
            text: '',
            email: me?.login ?? null,
            federation: federation?.id ?? null
          })
      
          toast({
            title: "Успешно отправлено",
            description: "Ваш запрос был отправлен в федерацию",
          })
        }
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отправить запрос. Попробуйте позже.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Запросы федерации</h1>
        <p className="text-muted-foreground mt-2">
          Просмотр и отправка запросов в федерацию {federation?.region}
        </p>
      </div>

      {/* List of existing feedback */}
      {feedbackList && feedbackList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>История запросов</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackList.map((feedback: SchemaFeedback) => (
              <div key={feedback.id} className="border-b pb-4 last:border-0">
                <h3 className="font-medium">{feedback.subject}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feedback.text}</p>
                {feedback.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Контакт: {feedback.email}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {submitSuccess ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <MessageSquare className="h-5 w-5" />
              <span>Спасибо за ваш запрос! Мы ответим вам в ближайшее время.</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Новый запрос</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Тема запроса *
                </label>
                <Input
                  id="subject"
                  required
                  maxLength={100}
                  value={request.subject}
                  onChange={(e) => setRequest(prev => ({ ...prev, subject: e.target.value }))}
                />
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
                  onChange={(e) => setRequest(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  onChange={(e) => setRequest(prev => ({ 
                    ...prev, 
                    email: e.target.value ? e.target.value.trim() : me?.login ?? null 
                  }))}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  placeholder={me?.login ?? ''}
                />
                <p className="text-sm text-muted-foreground">
                  Ответ будет отправлен на этот email
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Отправка...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  'Отправить запрос'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
