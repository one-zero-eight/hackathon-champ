import type { Sort } from '@/lib/types'
import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe } from '@/hooks/useMe'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { LayoutWrapper } from './_layout'

export const Route = createFileRoute('/manage/events/all')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
    else if (me && me.role !== 'admin') {
      navigate({ to: me.federation ? '/manage/events/region' : '/' })
    }
  }, [me, meError, navigate])

  const [sort, setSort] = useState<Sort>({ type: 'date', direction: -1 })
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {},
        sort,
        pagination: { page_no: 1, page_size: 10000 },
      },
    },
  )

  const content = (
    <div className="flex flex-col gap-4">
      {eventsLoading
        ? (<EventsLoadingSkeleton />)
        : eventsData?.events.length && eventsData.events.length > 0
          ? (eventsData.events.map(event => (<EventCard key={event.id} event={event} />)))
          : (<div>Нет мероприятий</div>)}
    </div>
  )

  return (
    <LayoutWrapper
      title="Все мероприятия"
      description="Все спортивные мероприятия, в том числе неподтвержденные"
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
