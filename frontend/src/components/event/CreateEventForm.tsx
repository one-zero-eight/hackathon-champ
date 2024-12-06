import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { DatePicker } from '@/components/filters/DatesFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Temporal } from 'temporal-polyfill'
import { z } from 'zod'

const createEventForm = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  start_date: z.string().min(1, 'Выберите дату проведения'),
  end_date: z.string().min(1, 'Выберите дату проведения'),
})
type CreateEventFormTypes = z.infer<typeof createEventForm>

export function CreateEventForm() {
  const { data: me } = useMe()
  const { mutate } = $api.useMutation('post', '/events/suggest')

  const navigate = useNavigate()
  const form = useForm<CreateEventFormTypes>({
    resolver: zodResolver(createEventForm),
    defaultValues: {
      title: '',
      description: '',
      start_date: '',
      end_date: '',
    },
  })

  const onSubmit = async (data: CreateEventFormTypes) => {
    try {
      mutate({
        body: {
          host_federation: me.federation,
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          status: 'draft',
          sport: '',
          discipline: [],
          location: [],
        },
      }, {
        onSuccess: (data) => {
          toast.success('Мероприятие успешно создано!')
          navigate({ to: '/manage/region/events/$id', params: { id: data.id } })
        },
      })
    }
    catch {
      toast.error('Не удалось создать мероприятие. Попробуйте еще раз.')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-center text-2xl font-semibold sm:text-left">
          Новое мероприятие
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
                    <FormLabel className="text-base">Название</FormLabel>
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

              <div className="flex flex-col gap-2">
                <Label className="text-base font-medium">Даты проведения</Label>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field: { ref, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            {...field}
                            value={field.value ? Temporal.PlainDate.from(field.value) : null}
                            onChange={v => field.onChange(v ? v.toString() : null)}
                            placeholder="Начало"
                            className="h-11 max-w-[150px] flex-1 basis-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span>—</span>
                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field: { ref, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            {...field}
                            value={field.value ? Temporal.PlainDate.from(field.value) : null}
                            onChange={v => field.onChange(v ? v.toString() : null)}
                            placeholder="Конец"
                            className="h-11 max-w-[150px] flex-1 basis-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
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

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/manage/region/events' })}
                className="order-2 w-full sm:order-1 sm:w-auto"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="order-1 w-full sm:order-2 sm:w-auto"
              >
                Продолжить
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
