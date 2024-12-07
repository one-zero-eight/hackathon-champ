import type { SchemaEvent, SchemaViewUser } from '@/api/types.ts'
import { $api, apiFetch } from '@/api'
import { useMe } from '@/api/me.ts'
import { AccrediteDialog } from '@/components/event/AccrediteDialog.tsx'
import { OnConsiderationDialog } from '@/components/event/OnConsiderationDialog.tsx'
import { RejectDialog } from '@/components/event/RejectDialog.tsx'
import { EventStatusBadge } from '@/components/EventStatusBadge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Form } from '@/components/ui/form.tsx'
import { useToast } from '@/components/ui/use-toast.ts'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Loader from '~icons/lucide/loader'
import { Skeleton } from '../ui/skeleton'
import { EditEventFormAgesField } from './EditEventFormAgesField'
import { EditEventFormDatesField } from './EditEventFormDatesField'
import { EditEventFormDescriptionField } from './EditEventFormDescriptionField'
import { EditEventFormDisciplineField } from './EditEventFormDisciplineField'
import { EditEventFormEkpIdField } from './EditEventFormEkpIdField'
import { EditEventFormGenderField } from './EditEventFormGenderField'
import { EditEventFormParticipantCountField } from './EditEventFormParticipantCountField'
import { EditEventFormProtocols } from './EditEventFormProtocols'
import { EditEventFormSoloPlaces } from './EditEventFormSoloPlaces'
import { EditEventFormTeamPlaces } from './EditEventFormTeamPlaces'
import { EditEventFormTitleField } from './EditEventFormTitleField'

export function EditEventForm({ eventId }: { eventId: string }) {
  const { data: me } = useMe()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data: event } = $api.useQuery(
    'get',
    '/events/{id}',
    { params: { path: { id: eventId } } },
  )

  const {
    mutate: updateEvent,
    isPending,
  } = $api.useMutation('put', '/events/{id}', {
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/events/{id}', { params: { path: { id: data?.id ?? '' } } }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/events/').queryKey,
      })
    },
  })

  const onSendToConsideration = () => {
    if (!event)
      return

    updateEvent({
      params: { path: { id: event.id } },
      body: {
        ...event,
        status: 'on_consideration',
      },
    })
  }

  const handleGeneralInfoSubmit = async (data: EventGeneralInfoType) => {
    if (!event)
      return

    try {
      updateEvent({
        params: { path: { id: event.id } },
        body: {
          ...event,
          title: data.title,
          description: data.description,
          start_date: data.start_date,
          end_date: data.end_date,
          status: 'draft',
          discipline: data.discipline,
          participant_count: data.participant_count,
          age_min: data.age_min,
          age_max: data.age_max,
          gender: data.gender,
          ekp_id: data.ekp_id,

          // TODO
          location: [],
        },
      }, {
        onSuccess: () => {
          toast({ description: 'Данные успешно изменены и отправлены на рассмотрение.' })
        },
      })
    }
    catch (error) {
      console.error(error)
      toast({ description: 'Не удалось отредактировать мероприятие. Попробуйте еще раз.' })
    }
  }

  const handleUpdateResults = useCallback((
    results: SchemaEvent['results'],
    successMessage: string = 'Результаты мероприятия успешно обновлены.',
  ) => {
    if (!event)
      return

    updateEvent({
      params: { path: { id: event.id } },
      body: { ...event, results },
    }, {
      onSuccess: () => { toast({ title: successMessage }) },
    })
  }, [event, updateEvent, toast])

  if (!me || !event) {
    return (
      <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <PageHeader />
          <Skeleton className="h-[200px] w-full bg-neutral-200" />
          <Skeleton className="h-[200px] w-full bg-neutral-200" />
          <Skeleton className="h-[200px] w-full bg-neutral-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader />

        <StatusCard
          event={event}
          me={me}
          onSendToConsideration={onSendToConsideration}
        />

        <GeneralInfoCard
          event={event}
          isLoading={isPending}
          onSubmit={handleGeneralInfoSubmit}
        />

        <ResultsCard
          event={event}
          isLoading={isPending}
          onSubmit={handleUpdateResults}
        />
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="mb-8 space-y-2">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Мероприятие
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        Редактирование данных мероприятия
      </p>
    </div>
  )
}

function StatusCard({
  event,
  me,
}: {
  event: SchemaEvent
  me: SchemaViewUser
}) {
  return (
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
              <span className="font-medium">
                Комментарий представительства:
              </span>
              <p className="text-sm text-muted-foreground">
                {event.accreditation_comment}
              </p>
            </div>
          )}

          {event.status_comment && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium">
                Комментарий к статусу:
              </span>
              <p className="text-sm text-muted-foreground">
                {event.status_comment}
              </p>
            </div>
          )}

          {(event.status === 'draft' || event.status === 'rejected') && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <OnConsiderationDialog event={event} />
              </div>
            </div>
          )}

          {me?.role === 'admin' && (event.status === 'on_consideration' || event.status === 'accredited' || event.status === 'rejected') && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium">Рассмотреть:</span>
              <div className="flex gap-2">
                <AccrediteDialog eventId={event.id} />
                <RejectDialog eventId={event.id} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const EventGeneralInfoSchema = z.object({
  title: z.string().min(3, 'Название должно содержать минимум 3 символа'),
  description: z.string().min(10, 'Описание должно содержать минимум 10 символов'),
  start_date: z.string().min(1, 'Выберите дату проведения'),
  end_date: z.string().min(1, 'Выберите дату проведения'),
  age_min: z.number().min(0, 'Минимальный возраст должен быть неотрицательным числом').max(100).nullable(),
  age_max: z.number().min(0, 'Максимальный возраст должен быть неотрицательным числом').nullable(),
  participant_count: z.number().min(0, 'Количество участников должно быть неотрицательным числом').nullable(),
  ekp_id: z.number().nullable(),
  location: z.array(z.object({
    country: z.string().min(1, 'Введите страну'),
    region: z.string().nullable(),
    city: z.string().nullable(),
  })),
  gender: z.enum(['male', 'female']).nullable(),
  discipline: z.array(z.string().min(1, 'Введите дисциплину')),
})
export type EventGeneralInfoType = z.infer<typeof EventGeneralInfoSchema>

function eventToDefaultValues(event: SchemaEvent): EventGeneralInfoType {
  return {
    title: event.title,
    description: event.description ?? '',
    start_date: event.start_date,
    end_date: event.end_date,
    age_min: event.age_min,
    age_max: event.age_max,
    participant_count: event.participant_count,
    ekp_id: event.ekp_id,
    location: event.location.map(v => ({
      country: v.country,
      region: v.region ?? null,
      city: v.city ?? null,
    })),
    gender: event.gender,
    discipline: event.discipline,
  }
}

function GeneralInfoCard({
  event,
  isLoading,
  onSubmit,
}: {
  event: SchemaEvent
  isLoading: boolean
  onSubmit: (data: EventGeneralInfoType) => void
}) {
  const { toast } = useToast()
  const form = useForm<EventGeneralInfoType>({
    resolver: zodResolver(EventGeneralInfoSchema),
    defaultValues: eventToDefaultValues(event),
  })

  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  const handleCancel = () => {
    form.reset()
    toast({
      description: 'Изменения отменены',
      duration: 3000,
    })
  }

  useEffect(() => {
    // Reset form to default values when event changes.
    form.reset(eventToDefaultValues(event))
  }, [event, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-xl font-semibold sm:text-left">
              Основные данные
            </CardTitle>
            <CardDescription className="text-sm">
              Общие данные о мероприятии
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <EditEventFormTitleField form={form} />

            <div className="flex gap-6">
              <EditEventFormDatesField form={form} className="shrink-0" />
              <EditEventFormEkpIdField form={form} className="grow" />
            </div>

            <EditEventFormDescriptionField form={form} />
            <EditEventFormDisciplineField form={form} />

            <div className="flex gap-6">
              <EditEventFormParticipantCountField form={form} className="basis-2/5" />
              <EditEventFormGenderField form={form} className="basis-[30%]" />
              <EditEventFormAgesField form={form} className="basis-[30%]" />
            </div>

            <div className="mt-2 flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading || !hasChanges}
                className="w-full sm:w-auto"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="w-full sm:w-auto"
              >
                {isLoading
                  ? (
                      <>
                        <Loader className="mr-2 size-4 animate-spin" />
                        Сохранение...
                      </>
                    )
                  : ('Сохранить изменения')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

const EventResultsSchema = z.object({
  protocols: z.array(z.object({
    by_file: z.string().nullable(),
    by_url: z.string().nullable(),
  })),
  team_places: z.array(z.object({
    team: z.string().min(1, 'Название команды должно не должно быть пустым'),
    place: z.number().min(1, 'Место команды должно быть неотрицательным числом'),
    members: z.array(z.string().min(1, 'Имя участника должно не должно быть пустым')),
    score: z.number().min(0, 'Результат команды должен быть неотрицательным числом').nullable(),
  })),
  solo_places: z.array(z.object({
    place: z.number().min(1, 'Место участника должно быть неотрицательным числом'),
    participant: z.string().min(1, 'Имя участника должно не должно быть пустым'),
    score: z.number().min(0, 'Результат участника должен быть неотрицательным числом').nullable(),
  })),
})
export type EventResultsType = z.infer<typeof EventResultsSchema>

function eventResultsToDefaultValues(event: SchemaEvent): EventResultsType {
  return {
    protocols: (event.results?.protocols ?? []).map(v => ({
      by_file: v.by_file ?? null,
      by_url: v.by_url ?? null,
    })),
    team_places: (event.results?.team_places ?? []).map(v => ({
      team: v.team,
      place: v.place,
      members: v.members,
      score: v.score ?? null,
    })),
    solo_places: (event.results?.solo_places ?? []).map(v => ({
      place: v.place,
      participant: v.participant,
      score: v.score ?? null,
    })),
  }
}

function ResultsCard({
  event,
  isLoading,
  onSubmit,
}: {
  event: SchemaEvent
  isLoading: boolean
  onSubmit: (results: EventResultsType) => void
}) {
  const { toast } = useToast()
  const form = useForm<EventResultsType>({
    resolver: zodResolver(EventResultsSchema),
    defaultValues: eventResultsToDefaultValues(event),
    disabled: isLoading,
  })

  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  const handleCancel = () => {
    form.reset()
    toast({
      description: 'Изменения отменены',
      duration: 3000,
    })
  }

  const handleSubmit = (data: EventResultsType) => {
    onSubmit({
      protocols: data.protocols,
      team_places: data.team_places,
      solo_places: data.solo_places,
    })
  }

  useEffect(() => {
    // Reset form to default values when event changes.
    form.reset(eventResultsToDefaultValues(event))
  }, [event, form])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!event)
      return

    const fileNames: string[] = []
    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiFetch.POST('/file_worker/upload', {
        // @ts-expect-error incorrect openapi type
        body: formData,
      })
      const fileName = response.data
      if (fileName) {
        fileNames.push(fileName)
      }
    }

    const newProtocols = fileNames.map(fileName => ({ by_file: fileName, by_url: null }))
    form.setValue('protocols', [...form.getValues('protocols'), ...newProtocols], { shouldDirty: true })
  }, [event, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-center text-xl font-semibold sm:text-left">
              Результаты соревнования
            </CardTitle>
            <CardDescription className="text-sm">
              Загрузите протокол мероприятия и укажите места участников и команд
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EditEventFormProtocols form={form} onDrop={onDrop} />
            <EditEventFormTeamPlaces form={form} />
            <EditEventFormSoloPlaces form={form} />

            <div className="mt-2 flex flex-col justify-end gap-3 sm:flex-row sm:gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges}
                className="w-full sm:w-auto"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!hasChanges}
                className="w-full sm:w-auto"
              >
                Сохранить изменения
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
