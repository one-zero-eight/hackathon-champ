import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { type Event, EventsLayout, type EventSort, transformApiEvent } from './_layout'

export const Route = createFileRoute('/manage/events/all')({
  component: RouteComponent,
})

function sortEvents(events: Array<Event>, sort: EventSort) {
  return [...events].sort((a, b) => {
    let aLocation = ''
    let bLocation = ''
    let result = 0

    switch (sort.type) {
      case 'date':
        result = new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime()
        break
      case 'name':
        result = (a.title || '').localeCompare(b.title || '')
        break
      case 'status':
        result = (a.status || '').localeCompare(b.status || '')
        break
      case 'participants':
        result = (a.participant_count || 0) - (b.participant_count || 0)
        break
      case 'location':
        aLocation = a.location[0]?.city || a.location[0]?.region || a.location[0]?.country || ''
        bLocation = b.location[0]?.city || b.location[0]?.region || b.location[0]?.country || ''
        result = aLocation.localeCompare(bLocation)
        break
    }

    return sort.direction === 'asc' ? result : -result
  })
}

function RouteComponent() {
  const [sort, setSort] = useState<EventSort>({ type: 'date', direction: 'desc' })
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery(
    'get',
    '/events/',
  )

  const allEvents = useMemo(
    () => (eventsData ?? []).map(event => transformApiEvent(event)),
    [eventsData],
  )

  const sortedEvents = useMemo(
    () => sortEvents(allEvents, sort),
    [allEvents, sort],
  )

  const content = (
    <div className="flex flex-col gap-4">
      {eventsLoading
        ? (
            <EventsLoadingSkeleton />
          )
        : sortedEvents.length > 0
          ? (
              sortedEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            )
          : (
              <div>Нет мероприятий</div>
            )}
    </div>
  )

  return (
    <EventsLayout
      title="Все мероприятия"
      description="Все спортивные мероприятия, в том числе неподтвержденные"
      onSortChange={setSort}
      currentSort={sort}
    >
      {content}
    </EventsLayout>
  )
}

function EventsLoadingSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Skeleton key={i} className="h-[200px] w-full bg-neutral-200" />
  ))
}
