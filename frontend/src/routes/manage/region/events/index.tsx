import { $api } from '@/api'
import { useMyFederation } from '@/api/me'
import { EventCard } from '@/components/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'

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
      <h1>{myFederation?.district}</h1>
      <div className="flex flex-col gap-4">
        {someLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Skeleton key={i} className="h-[200px] w-full bg-neutral-200" />
          ))
          : myFederationEvents.length > 0
            ? (myFederationEvents.map(event => (
                <EventCard key={event.id} event={event} />
              )))
            : (<div>Нет мероприятий</div>)}
      </div>
    </div>
  )
}
