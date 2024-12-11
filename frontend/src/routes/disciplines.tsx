import type { SchemaEvent } from '@/api/types'
import { $api } from '@/api'
import { DISCIPLINES } from '@/lib/disciplines'
import { capitalize } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import Calendar from '~icons/lucide/calendar'
import GraduationCap from '~icons/lucide/graduation-cap'

export const Route = createFileRoute('/disciplines')({
  component: RouteComponent,
})

function DisciplineEvents({ name }: { name: string }) {
  const { data: eventsData } = $api.useQuery('post', '/events/search', {
    body: {
      filters: { discipline: [name] },
      pagination: { page_size: 3, page_no: 1 },
    },
  })

  // Get all federations to check their status
  const { data: federations } = $api.useQuery('get', '/federations/')
  const federationStatusMap = useMemo(() => {
    if (!federations)
      return new Map()
    return new Map(federations.map(f => [f.id, f.status]))
  }, [federations])

  const events = useMemo(() => {
    const allEvents = (eventsData as { events: SchemaEvent[] } | undefined)?.events ?? []
    // Only show events from accredited federations
    return allEvents.filter((event) => {
      if (!event.host_federation)
        return false
      return federationStatusMap.get(event.host_federation) === 'accredited'
    })
  }, [eventsData, federationStatusMap])

  if (events.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Нет предстоящих мероприятий
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="flex items-start gap-3 rounded-lg border p-4">
          <Calendar className="mt-0.5 size-5 shrink-0 text-purple-500" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{event.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {new Date(event.start_date).toLocaleDateString('ru')}
              {' '}
              -
              {new Date(event.end_date).toLocaleDateString('ru')}
            </div>
            {event.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Дисциплины</h1>
        <p className="mt-2 text-muted-foreground">
          Познакомьтесь с направлениями в спортивном программировании, представленными на платформе.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {DISCIPLINES.map((discipline) => {
          return (
            <div key={discipline.name} className="border-b pb-12">
              <div className="grid items-start gap-8 md:grid-cols-2">
                <div>
                  <div className="flex items-start gap-4">
                    <div className="flex size-16 items-center justify-center rounded-2xl border bg-white sm:size-20">
                      <img
                        src={discipline.iconSrc}
                        alt={discipline.name}
                        className="size-8 sm:size-10"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold">
                        {capitalize(discipline.name)}
                      </h2>
                      <p className="mt-2 text-lg text-muted-foreground">
                        {discipline.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div>
                      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <GraduationCap className="size-4 text-purple-500" />
                        Навыки
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {discipline.skills.map(skill => (
                          <div key={skill} className="rounded-full bg-muted px-3 py-1 text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <Calendar className="size-4 text-purple-500" />
                    Ближайшие мероприятия
                  </div>
                  <DisciplineEvents name={discipline.name} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
