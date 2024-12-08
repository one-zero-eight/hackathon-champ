import type { Sort } from '@/lib/types'
import { $api } from '@/api'
import { useMe, useMyFederation } from '@/api/me'
import { EventCard } from '@/components/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LayoutWrapper } from './_layout'

export const Route = createFileRoute('/manage/events/region')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
    else if (me && !me.federation) {
      navigate({ to: me.role === 'admin' ? '/manage/admin/home' : '/' })
    }
  }, [me, meError, navigate])

  const [sort, setSort] = useState<Sort>({ date: 'desc' })
  const { data: myFederation, isLoading: myFederationLoading } = useMyFederation()
  const { data: eventsData, isLoading: eventsLoading } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: { host_federation: myFederation?.id ?? '' },
        sort,
        pagination: { page_no: 1, page_size: 10000 },
      },
    },
    { enabled: !!myFederation },
  )

  const someLoading = myFederationLoading || eventsLoading

  const content = (
    <div className="flex flex-col gap-4">
      {someLoading
        ? (<EventsLoadingSkeleton />)
        : eventsData?.events.length && eventsData.events.length > 0
          ? (
              eventsData.events.map(event => (<EventCard key={event.id} event={event} />))
            )
          : (<div>Нет мероприятий</div>)}
    </div>
  )

  return (
    <LayoutWrapper
      title={myFederation?.region ?? 'Загрузка...'}
      description="Мероприятия вашей региональной федерации"
      onSortChange={setSort}
      currentSort={sort}
    >
      {content}
    </LayoutWrapper>
  )
}

function EventsLoadingSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Skeleton key={i} className="h-[200px] w-full bg-neutral-200" />
  ))
}
