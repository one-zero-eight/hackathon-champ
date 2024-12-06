import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import Plus from '~icons/lucide/plus'

export const Route = createFileRoute('/manage/events/all')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery(
    'get',
    '/events/',
  )

  const allEvents = useMemo(() => eventsData ?? [], [eventsData])

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Все мероприятия</h1>
          <p className="text-gray-500">
            Все спортивные мероприятия, в том числе неподтвержденные
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/manage/events/suggest">
              <Plus className="mr-2 size-4" />
              Новое мероприятие
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {eventsLoading
          ? (
              Array.from({ length: 4 }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={i} className="h-[200px] w-full bg-neutral-200" />
              ))
            )
          : allEvents.length > 0
            ? (
                allEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))
              )
            : (
                <div>Нет мероприятий</div>
              )}
      </div>
    </div>
  )
}
