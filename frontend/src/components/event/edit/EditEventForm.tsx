import type { SchemaEvent, SchemaResults, SchemaViewUser } from '@/api/types.ts'
import { $api, apiFetch } from '@/api'
import { AccrediteDialog } from '@/components/event/AccrediteDialog.tsx'
import { OnConsiderationDialog } from '@/components/event/OnConsiderationDialog.tsx'
import { PublishDialog } from '@/components/event/PublishDialog.tsx'
import { RejectDialog } from '@/components/event/RejectDialog.tsx'
import { UnpublishDialog } from '@/components/event/UnpublishDialog.tsx'
import { EventStatusBadge } from '@/components/EventStatusBadge.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx'
import { Form } from '@/components/ui/form.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast.ts'
import { useMe } from '@/hooks/useMe'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Printer from '~icons/lucide/printer'
import { EventSuggestResultsButton } from '../EventSuggestResultsButton'
import { EditEventFormAgesField } from './EditEventFormAgesField'
import { EditEventFormDatesField } from './EditEventFormDatesField'
import { EditEventFormDescriptionField } from './EditEventFormDescriptionField'
import { EditEventFormDisciplineField } from './EditEventFormDisciplineField'
import { EditEventFormEkpIdField } from './EditEventFormEkpIdField'
import { EditEventFormGenderField } from './EditEventFormGenderField'
import { EditEventFormLevelField } from './EditEventFormLevelField.tsx'
import { EditEventFormParticipantCountField } from './EditEventFormParticipantCountField'
import { EditEventFormProtocols } from './EditEventFormProtocols'
import { EditEventFormSoloPlaces } from './EditEventFormSoloPlaces'
import { EditEventFormTeamPlaces } from './EditEventFormTeamPlaces'
import { EditEventFormTitleField } from './EditEventFormTitleField'

export function EditEventForm({ eventId }: { eventId: string }) {
  const { data: me } = useMe()

  const { data: event } = $api.useQuery(
    'get',
    '/events/{id}',
    { params: { path: { id: eventId } } },
  )

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
        <StatusCard event={event} me={me} />
        <GeneralInfoCard event={event} />
        <ResultsCard event={event} />
      </div>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="do-not-print mb-8 space-y-2">
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
  const requiresAccreditation
    = event.level === 'interregional'
    || event.level === 'federal'
    || event.level === 'international'

  return (
    <Card className="do-not-print mb-6">
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

          {requiresAccreditation && (event.status === 'draft' || event.status === 'rejected') && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2">
                <OnConsiderationDialog event={event} />
              </div>
            </div>
          )}

          {me?.role === 'admin' && requiresAccreditation && event.status !== 'draft' && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium">Рассмотреть:</span>
              <div className="flex gap-2">
                {event.status !== 'accredited' && <AccrediteDialog eventId={event.id} />}
                {event.status !== 'rejected' && <RejectDialog eventId={event.id} />}
              </div>
            </div>
          )}

          {!requiresAccreditation && event.status !== 'accredited' && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium">Сменить статус:</span>
              <div className="flex gap-2">
                <PublishDialog eventId={event.id} />
              </div>
            </div>
          )}

          {!requiresAccreditation && event.status === 'accredited' && (
            <div className="flex flex-col gap-1.5">
              <span className="font-medium">Сменить статус:</span>
              <div className="flex gap-2">
                <UnpublishDialog eventId={event.id} />
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
  level: z.enum(['local', 'regional', 'interregional', 'federal', 'international']).nullable(),
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
    level: event.level,
    discipline: event.discipline,
  }
}

function GeneralInfoCard({ event }: { event: SchemaEvent }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
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

  const onSubmit = async (data: EventGeneralInfoType) => {
    if (!event)
      return

    updateEvent({
      params: { path: { id: event.id } },
      body: {
        ...event,
        ...data,
        // TODO: location
      },
    }, {
      onSuccess: () => {
        toast({ description: 'Данные успешно изменены.' })
      },
      onError: (error) => {
        console.error(error)
        toast({ description: 'Не удалось отредактировать мероприятие. Попробуйте еще раз.' })
      },
    })
  }

  const form = useForm<EventGeneralInfoType>({
    resolver: zodResolver(EventGeneralInfoSchema),
    defaultValues: eventToDefaultValues(event),
  })

  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  const handleCancel = () => {
    form.reset()
  }

  useEffect(() => {
    // Reset form to default values when event changes.
    form.reset(eventToDefaultValues(event))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit(onSubmit)(e)
        }}
        className="do-not-print"
      >
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
            <EditEventFormLevelField form={form} />

            <div className="flex gap-6">
              <EditEventFormParticipantCountField form={form} className="basis-2/5" />
              <EditEventFormGenderField form={form} className="basis-[30%]" />
              <EditEventFormAgesField form={form} className="basis-[30%]" />
            </div>
          </CardContent>

          <CardFooter className="sticky bottom-0 flex flex-col gap-3 rounded-b-lg border-t bg-white py-4 sm:flex-row sm:gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending || !hasChanges}
              className="w-full sm:ml-auto sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={isPending || !hasChanges}
              className="w-full sm:w-auto"
            >
              Сохранить изменения
            </Button>
          </CardFooter>
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
    members: z.array(z.object({
      id: z.string().nullable(),
      name: z.string().min(1, 'Имя участника должно не должно быть пустым'),
    })),
    score: z.number().min(0, 'Результат команды должен быть неотрицательным числом').nullable(),
  })),
  solo_places: z.array(z.object({
    place: z.number().min(1, 'Место участника должно быть неотрицательным числом'),
    participant: z.object({
      id: z.string().nullable(),
      name: z.string().min(1, 'Имя участника должно не должно быть пустым'),
    }),
    score: z.number().min(0, 'Результат участника должен быть неотрицательным числом').nullable(),
  })),
})
export type EventResultsType = z.infer<typeof EventResultsSchema>

function eventResultsToDefaultValues(results: SchemaResults | null | undefined): EventResultsType {
  return {
    protocols: (results?.protocols ?? []).map(v => ({
      by_file: v.by_file ?? null,
      by_url: v.by_url ?? null,
    })),
    team_places: (results?.team_places ?? []).map(v => ({
      team: v.team,
      place: v.place,
      members: v.members.map(m => ({
        id: m.id ?? null,
        name: m.name,
      })),
      score: v.score ?? null,
    })),
    solo_places: (results?.solo_places ?? []).map(v => ({
      place: v.place,
      participant: {
        ...v.participant,
        id: v.participant.id ?? null,
      },
      score: v.score ?? null,
    })),
  }
}

function ResultsCard({ event }: { event: SchemaEvent }) {
  const { toast } = useToast()
  const [isSuggesting, setIsSuggesting] = useState(false)

  const {
    data: results,
    refetch: refetchResults,
  } = $api.useQuery('get', '/results/for-event', {
    params: { query: { event_id: event.id } },
  })
  const {
    mutate: updateResults,
    isPending,
  } = $api.useMutation('put', '/results/')

  const disabled = isPending || isSuggesting

  const onSubmit = useCallback((results: EventResultsType) => {
    if (!event)
      return

    updateResults({
      body: {
        event_id: event.id,
        event_title: event.title,
        ...results,
      },
    }, {
      onSuccess: () => {
        toast({ description: 'Результаты мероприятия успешно обновлены.' })
      },
      onError: (error) => {
        console.error(error)
        toast({ description: 'Произошла ошибка при обновлении результатов мероприятия.' })
      },
      onSettled: () => {
        refetchResults()
      },
    })
  }, [event, updateResults, toast, refetchResults])

  const form = useForm<EventResultsType>({
    resolver: zodResolver(EventResultsSchema),
    defaultValues: eventResultsToDefaultValues(results),
    disabled,
  })

  const hasChanges = Object.keys(form.formState.dirtyFields).length > 0

  const handleCancel = () => {
    form.reset()
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
    form.reset(eventResultsToDefaultValues(results))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, form.setValue, form.getValues])

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit(handleSubmit)(e)
        }}
      >
        <Card className="relative w-full print:border-0 print:p-0 print:shadow-none">
          <CardHeader className="space-y-2 print:py-0">
            <CardTitle className="text-center text-xl font-semibold sm:text-left">
              Результаты соревнования
              <Button
                className="do-not-print absolute right-6 top-6"
                variant="outline"
                onClick={() => window.print()}
                type="button"
              >
                <Printer className="mr-2 size-4" />
                Печать
              </Button>
            </CardTitle>
            <CardDescription className="do-not-print text-sm">
              Загрузите протокол мероприятия и укажите места участников и команд
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <EditEventFormProtocols disabled={disabled} form={form} onDrop={onDrop} />
            <EditEventFormTeamPlaces disabled={disabled} form={form} />
            <EditEventFormSoloPlaces disabled={disabled} form={form} />
          </CardContent>
          <CardFooter className="do-not-print sticky bottom-0 flex flex-col gap-3 rounded-b-lg border-t bg-white py-4 sm:flex-row sm:gap-4">
            <EventSuggestResultsButton
              disabled={disabled}
              onSuggestStart={() => setIsSuggesting(true)}
              onSuggestSettled={(result) => {
                setIsSuggesting(false)
                if (result.ok) {
                  const transformed = eventResultsToDefaultValues(result.results)
                  form.setValue('team_places', transformed.team_places, { shouldDirty: true })
                  form.setValue('solo_places', transformed.solo_places, { shouldDirty: true })
                  toast({ description: 'Результаты предзаполнены по данным из файла' })
                }
                else {
                  toast({ description: 'Не удалось предзаполнить результаты по данным из файла' })
                  console.error('Failed to get results suggestions', result.error)
                }
              }}
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={disabled || !hasChanges}
              className="w-full sm:ml-auto sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={disabled || !hasChanges}
              className="w-full sm:w-auto"
            >
              Сохранить изменения
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
