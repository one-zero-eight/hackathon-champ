import { $api } from '@/api'
import { useMyFederation } from '@/api/me'
import { EventCard } from '@/components/EventCard'
import { Button } from '@/components/ui/button.tsx'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import Plus from '~icons/lucide/plus'

export const Route = createFileRoute('/manage/region/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: myFederation, isLoading: myFederationLoading } = useMyFederation()
  const { data: eventsData, isLoading: eventsLoading } = $api.useQuery('get', '/events/')

  const someLoading = myFederationLoading || eventsLoading

  const allEvents = useMemo(() => (eventsData ?? []), [eventsData])
  const myFederationEvents = useMemo(() => (
    myFederation
      ? allEvents.filter(event => event.host_federation === myFederation.id)
      : []
  ), [allEvents, myFederation])

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{myFederation?.region}</h1>
          <p className="text-gray-500">
            Мероприятия вашей региональной федерации
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/manage/region/events/suggest">
              <Plus className="mr-2 size-4" />
              Новое мероприятие
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {someLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={i} className="h-[200px] w-full bg-neutral-200" />
          ))
        ) : myFederationEvents.length > 0
          ? (
              myFederationEvents.map(event => (
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
