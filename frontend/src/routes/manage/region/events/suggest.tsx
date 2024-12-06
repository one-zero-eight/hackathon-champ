import { $api } from '@/api'
import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const eventSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  date: z.string().min(1, 'Выберите дату проведения'),
  location: z.string().min(3, 'Укажите место проведения'),
  maxParticipants: z.number().min(1, 'Минимум 1 участник'),
})

type EventForm = z.infer<typeof eventSchema>

type EventSuggestRequest = {
  body: {
    title: string
    description: string
    date: string
    location: string
    max_participants: number
    status: 'on_consideration'
  }
}

export const Route = createFileRoute('/manage/region/events/suggest')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutate } = $api.useMutation<
    'post',
    EventSuggestRequest,
    unknown,
    unknown,
    unknown
  >('post', '/events/suggest')
  
  const navigate = useNavigate()
  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      maxParticipants: 1,
    },
  })

  const onSubmit = async (data: EventForm) => {
    try {
      await mutate({
        body: {
          title: data.title,
          description: data.description,
          date: data.date,
          location: data.location,
          max_participants: data.maxParticipants,
          status: 'on_consideration',
        },
      })
      toast.success('Мероприятие успешно предложено!')
      navigate({ to: '/manage/region/events' })
    } catch (error) {
      toast.error('Не удалось предложить мероприятие. Попробуйте еще раз.')
    }
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-2xl mx-auto">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold text-center sm:text-left">
              Предложить новое мероприятие
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Название мероприятия</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите название мероприятия" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Дата проведения</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Описание</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Введите описание мероприятия"
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Место проведения</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Введите место проведения" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field: { onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-base">Количество участников</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Максимальное количество"
                            {...field}
                            onChange={(e) => onChange(Number(e.target.value))}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: '/manage/region/events' })}
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit"
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    Предложить мероприятие
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
