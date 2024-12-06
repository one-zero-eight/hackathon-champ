import type { SchemaEventSchema } from '@/api/types.ts'
import { $api } from '@/api'
import { useMe } from '@/api/me.ts'
import { EventStatusBadge } from '@/components/EventStatusBadge.tsx'
import { DatePicker } from '@/components/filters/DatesFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useToast } from '@/components/ui/use-toast.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Temporal } from 'temporal-polyfill'
import { z } from 'zod'
import Loader from '~icons/lucide/loader'

const editEventFormSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  start_date: z.string().min(1, 'Выберите дату проведения'),
  end_date: z.string().min(1, 'Выберите дату проведения'),
})

type EditEventFormType = z.infer<typeof editEventFormSchema>

export function EditEventForm({
  eventId,
}: { eventId: string }) {
  const { data: me } = useMe()
  const { data: event } = $api.useQuery('get', '/events/{id}', {
    params: { path: { id: eventId } },
  })
  const { mutate: updateEvent, isPending } = $api.useMutation('put', '/events/{id}')
  const { toast } = useToast()

  const form = useForm<EditEventFormType>({
    resolver: zodResolver(editEventFormSchema),
    defaultValues: {
      description: '',
    },
  })

  // Store initial values when federation data is loaded
  const [initialValues, setInitialValues] = useState<EditEventFormType | null>(null)

  useEffect(() => {
    if (event) {
      const values: EditEventFormType = {
        title: event.title,
        description: event.description ?? '',
        start_date: event.start_date,
        end_date: event.end_date,
      }
      form.reset(values)
      setInitialValues(values)
    }
  }, [event, form])

  const handleCancel = () => {
    if (initialValues) {
      form.reset(initialValues)
      toast({
        description: 'Изменения отменены',
        duration: 3000,
      })
    }
  }

  const onSubmit = async (data: EditEventFormType) => {
    try {
      const updateData: SchemaEventSchema = {
        ...event,
        title: data.title,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        status: 'draft',
        discipline: [],
        location: [],
      }
      updateEvent({
        params: { path: { id: eventId } },
        body: updateData,
      }, {
        onSuccess: () => {
          toast({ description: 'Мероприятие успешно отредактировано!' })
        },
      })
    }
    catch {
      toast({ description: 'Не удалось отредактировать мероприятие. Попробуйте еще раз.' })
    }
  }

  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Мероприятие</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Редактирование данных мероприятия
            </p>
          </div>

          {event && (
            <Card className="mb-6">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Текущий статус</CardTitle>
                <CardDescription className="text-sm">
                  Информация о статусе подтверждения мероприятия
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">Статус:</span>
                    <EventStatusBadge status={event.status} />
                  </div>
                  {event.accreditation_comment && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Комментарий представительства:</span>
                      <p className="text-sm text-muted-foreground">{event.accreditation_comment}</p>
                    </div>
                  )}
                  {event.status_comment && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Комментарий к статусу:</span>
                      <p className="text-sm text-muted-foreground">{event.status_comment}</p>
                    </div>
                  )}
                  {event.status === 'draft' && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateEvent({
                            params: { path: { id: event.id } },
                            body: { ...event, status: 'on_consideration' },
                          })}
                        >
                          Отправить на рассмотрение
                        </Button>
                      </div>
                    </div>
                  )}
                  {me?.role === 'admin' && event.status === 'on_consideration' && (
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">Рассмотреть:</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                        >
                          Аккредитовать
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                        >
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="w-full">
            <CardHeader className="space-y-2">
              <CardTitle className="text-center text-xl font-semibold sm:text-left">
                Основные данные
              </CardTitle>
              <CardDescription className="text-sm">
                Общие данные о мероприятии
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                              value={field.value ? Temporal.PlainDate.from(field.value.substring(0, 10)) : null}
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
                              value={field.value ? Temporal.PlainDate.from(field.value.substring(0, 10)) : null}
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
            </CardContent>
          </Card>

          <div className="flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending || !hasChanges}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isPending || !hasChanges}
              className="w-full sm:w-auto"
            >
              {isPending
                ? (
                    <>
                      <Loader className="mr-2 size-4 animate-spin" />
                      Сохранение...
                    </>
                  )
                : (
                    'Сохранить изменения'
                  )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
