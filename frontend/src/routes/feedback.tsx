import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { $api } from '@/api'
import { SchemaFeedback, SchemaFeedbackSchema } from '../api/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MessageSquare from '~icons/lucide/message-square'

export const Route = createFileRoute('/feedback')({
  component: FeedbackPage,
})

function FeedbackPage() {
  const [feedback, setFeedback] = useState<SchemaFeedbackSchema>({
    subject: '',
    text: '',
    email: null,
    federation: null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const { data: federations } = $api.useQuery('get', '/federations/')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const response = await fetch('/api/feedback/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setSubmitSuccess(true)
      setFeedback({
        subject: '',
        text: '',
        email: null,
        federation: null
      })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Обратная связь</h1>
        <p className="text-muted-foreground mt-2">
          Отправьте нам сообщение или свяжитесь с конкретной федерацией
        </p>
      </div>

      {submitSuccess ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <MessageSquare className="h-5 w-5" />
              <span>Спасибо за ваше сообщение! Мы рассмотрим его в ближайшее время.</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Новое сообщение</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Тема сообщения *
                </label>
                <Input
                  id="subject"
                  required
                  value={feedback.subject}
                  onChange={(e) => setFeedback(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="text" className="text-sm font-medium">
                  Сообщение *
                </label>
                <textarea
                  id="text"
                  required
                  value={feedback.text}
                  onChange={(e) => setFeedback(prev => ({ ...prev, text: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="federation" className="text-sm font-medium">
                  Федерация (необязательно)
                </label>
                <Select 
                  value={feedback.federation || 'none'} 
                  onValueChange={(value) => setFeedback(prev => ({ ...prev, federation: value === 'none' ? null : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите федерацию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Не выбрано</SelectItem>
                    {federations?.map((federation: any) => (
                      <SelectItem key={federation.id} value={federation.id}>
                        {federation.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Выберите федерацию, если ваше сообщение относится к конкретной федерации
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (необязательно)
                </label>
                <Input
                  type="email"
                  id="email"
                  value={feedback.email || ''}
                  onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value || null }))}
                />
                <p className="text-sm text-muted-foreground">
                  Укажите email, если хотите получить ответ
                </p>
              </div>

              {submitError && (
                <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3">
                  {submitError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
