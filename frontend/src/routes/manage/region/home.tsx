import { $api } from '@/api'
import { useMe } from '@/api/me'
import { QuickStatsCard } from '@/components/analytics/QuickStatsCard'
import { ColoredBadge } from '@/components/ColoredBadge'
import { EventCard } from '@/components/EventCard'
import { Notifications } from '@/components/Notifications'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import * as eventsLib from '@/lib/events'
import { cn, plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo } from 'react'
import { Temporal } from 'temporal-polyfill'
import Award from '~icons/lucide/award'
import CalendarIcon from '~icons/lucide/calendar'
import ChevronRight from '~icons/lucide/chevron-right'
import Plus from '~icons/lucide/plus'
import Users from '~icons/lucide/users'

export const Route = createFileRoute('/manage/region/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me, isPending: meLoading } = useMe()

  const {
    data: upcomingEvents,
    isPending: upcomingEventsLoading_,
  } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {
          date: plainDatesForFilter(
            Temporal.Now.plainDateISO(),
            Temporal.Now.plainDateISO().add({ days: 30 }),
          ),
          host_federation: me?.federation ?? '',
        },
        pagination: {
          page_no: 1,
          page_size: 5,
        },
        sort: { date: 'asc' },
      },
    },
    { enabled: !!me?.federation },
  )
  const { data: events } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: { host_federation: me?.federation ?? '' },
        pagination: { page_no: 1, page_size: 1000 },
        sort: {},
      },
    },
    { enabled: !!me?.federation },
  )
  const { data: federationStats } = $api.useQuery(
    'get',
    '/federations/{id}/stats',
    { params: { path: { id: me?.federation ?? '' } } },
    { enabled: !!me?.federation },
  )

  const upcomingEventsLoading = meLoading || upcomingEventsLoading_

  const eventsByStats = useMemo(() => {
    if (!events)
      return null
    return eventsLib.eventsByStatus(events?.events ?? [])
  }, [events])

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="text-gray-500">
            Добро пожаловать! Здесь собрана вся важная информация.
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

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <QuickStatsCard
            title="Мероприятий"
            icon={Award}
            value={federationStats?.total_competitions}
            secondaryValue={federationStats?.competitions_for_last_month ?? null}
            secondaryText="за последний месяц"
            color="yellow"
          />
          <QuickStatsCard
            title="Всего участников"
            icon={Users}
            value={federationStats?.total_participations}
            secondaryValue={federationStats?.participations_for_last_month ?? null}
            secondaryText="за последний месяц"
            color="blue"
          />
          <QuickStatsCard
            title="Всего команд"
            icon={Users}
            value={federationStats?.total_teams}
            secondaryValue={federationStats?.teams_for_last_month ?? null}
            secondaryText="за последний месяц"
            color="purple"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Applications Status */}
          <Card>
            <CardHeader>
              <CardTitle>Статус заявок</CardTitle>
              <CardDescription>
                Текущий статус заявок по мероприятиям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span>Ожидают проверки</span>
                  </div>
                  {eventsByStats
                    ? (
                        <ColoredBadge color="blue">
                          {eventsByStats.on_consideration ?? 0 }
                        </ColoredBadge>
                      )
                    : (
                        <Skeleton className="h-6 w-8" />
                      )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <span>Одобрено</span>
                  </div>
                  {eventsByStats
                    ? (
                        <ColoredBadge color="green">
                          {eventsByStats.accredited ?? 0}
                        </ColoredBadge>
                      )
                    : (
                        <Skeleton className="h-6 w-8" />
                      )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-red-500"></div>
                    <span>Отклонено</span>
                  </div>
                  {eventsByStats
                    ? (
                        <ColoredBadge color="red">
                          {eventsByStats.rejected ?? 0}
                        </ColoredBadge>
                      )
                    : (
                        <Skeleton className="h-6 w-8" />
                      )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-gray-500"></div>
                    <span>Черновик</span>
                  </div>
                  {eventsByStats
                    ? (
                        <ColoredBadge color="gray">
                          {eventsByStats.draft ?? 0}
                        </ColoredBadge>
                      )
                    : (
                        <Skeleton className="h-6 w-8" />
                      )}
                </div>
                <Button variant="outline" className="mt-4 w-full" asChild>
                  <Link to="/manage/events/region">
                    Просмотреть все заявки
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Уведомления о новых заявках и мероприятиях</CardDescription>
            </CardHeader>
            <CardContent className="flex max-h-[300px] grow flex-col overflow-y-auto">
              <Notifications type="my-federation" />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ближайшие мероприятия</CardTitle>
              <CardDescription>
                Мероприятия на ближайшие 30 дней
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/calendar">
                Календарь
                <ChevronRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className={cn(
              'pr-4',
              upcomingEvents?.events.length !== 0 && 'h-[400px]',
            )}
            >
              <div className="space-y-4">
                {upcomingEventsLoading
                  ? (
                      <>
                        <Skeleton className="h-[120px]" />
                        <Skeleton className="h-[120px]" />
                        <Skeleton className="h-[120px]" />
                      </>
                    )
                  : upcomingEvents?.events.length
                    ? (
                        upcomingEvents.events.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))
                      )
                    : (
                        <div className="flex h-[200px] items-center justify-center text-gray-500">
                          <div className="text-center">
                            <CalendarIcon className="mx-auto mb-2 size-8 text-gray-400" />
                            <p>Нет предстоящих мероприятий</p>
                            <Button variant="link" className="mt-2">
                              Создать мероприятие
                            </Button>
                          </div>
                        </div>
                      )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
