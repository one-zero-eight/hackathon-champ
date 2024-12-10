import { $api } from '@/api'
import { QuickStatsCard } from '@/components/analytics/QuickStatsCard'
import { EventCard } from '@/components/EventCard'
import { Notifications } from '@/components/Notifications'
import { NotificationsUnreadBadge } from '@/components/NotificationsUnreadBadge'
import { Badge } from '@/components/ui/badge'
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
import { useMe } from '@/hooks/useMe'
import { plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Temporal } from 'temporal-polyfill'
import Award from '~icons/lucide/award'
import Building from '~icons/lucide/building'
import CalendarIcon from '~icons/lucide/calendar'
import ChevronRight from '~icons/lucide/chevron-right'
import FileText from '~icons/lucide/file-text'
import Plus from '~icons/lucide/plus'

export const Route = createFileRoute('/manage/admin/home')({
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
      navigate({ to: me.federation ? '/manage/region/home' : '/' })
    }
  }, [me, meError, navigate])

  // Fetch all federations
  const { data: federations, isPending: federationsLoading } = $api.useQuery(
    'get',
    '/federations/',
  )

  // Fetch upcoming events for the next month
  const { data: upcomingEvents, isPending: eventsLoading } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {
          date: plainDatesForFilter(
            Temporal.Now.plainDateISO(),
            Temporal.Now.plainDateISO().add({ days: 30 }),
          ),
        },
        pagination: {
          page_no: 1,
          page_size: 5,
        },
        sort: { date: 'asc' },
      },
    },
  )

  // Fetch all feedback/applications
  const { data: feedback, isPending: feedbackLoading } = $api.useQuery(
    'get',
    '/feedback/',
  )

  // Calculate federation statistics
  const federationStats = {
    total: federations?.length ?? 0,
    accredited: federations?.filter(f => f.status === 'accredited').length ?? 0,
    pending: federations?.filter(f => f.status === 'on_consideration').length ?? 0,
    rejected: federations?.filter(f => f.status === 'rejected').length ?? 0,
  }

  // Calculate feedback statistics
  const weekAgo = Temporal.Now.instant().subtract({ hours: 24 * 7 }).toString()
  const feedbackStats = {
    total: feedback?.length ?? 0,
    newThisWeek: feedback?.filter(f => f.id > weekAgo).length ?? 0,
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="text-gray-500">
            Общероссийская федерация спортивного программирования
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
          {federationsLoading || feedbackLoading
            ? (
                <>
                  <Skeleton className="h-[8.125rem]" />
                  <Skeleton className="h-[8.125rem]" />
                  <Skeleton className="h-[8.125rem]" />
                  <Skeleton className="h-[8.125rem]" />
                </>
              )
            : (
                <>
                  <QuickStatsCard
                    title="Всего федераций"
                    icon={Building}
                    value={federationStats.total}
                    secondaryValue={federationStats.pending}
                    secondaryText="на рассмотрении"
                    color="blue"
                  />
                  <QuickStatsCard
                    title="Аккредитовано"
                    icon={Award}
                    value={federationStats.accredited}
                    secondaryText="от общего числа"
                    secondaryValue={`${((federationStats.accredited / federationStats.total) * 100).toFixed(1)}%`}
                    color="green"
                  />
                  <QuickStatsCard
                    title="Мероприятий"
                    icon={CalendarIcon}
                    value={upcomingEvents?.events.length}
                    secondaryText="На ближайшие 30 дней"
                    color="purple"
                  />
                  <QuickStatsCard
                    title="Запросов"
                    icon={FileText}
                    value={feedbackStats.total}
                    secondaryValue={feedbackStats.newThisWeek}
                    secondaryText="новых за неделю"
                    color="yellow"
                  />
                </>
              )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Federation Status */}
          <Card>
            <CardHeader>
              <CardTitle>Статус федераций</CardTitle>
              <CardDescription>Текущий статус региональных федераций</CardDescription>
            </CardHeader>
            <CardContent>
              {federationsLoading
                ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-2 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-2 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-2 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-12 rounded-full" />
                      </div>
                      <Skeleton className="mt-4 h-9 w-full" />
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-green-500"></div>
                          <span>Аккредитованы</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          {federationStats.accredited}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-blue-500"></div>
                          <span>На рассмотрении</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {federationStats.pending}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500"></div>
                          <span>Отклонены</span>
                        </div>
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          {federationStats.rejected}
                        </Badge>
                      </div>
                      <Button variant="outline" className="mt-4 w-full" asChild>
                        <Link to="/manage/federations">
                          Управление федерациями
                        </Link>
                      </Button>
                    </div>
                  )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="col-span-2 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-end gap-2">
                Уведомления
                <NotificationsUnreadBadge type="admin" />
              </CardTitle>
              <CardDescription>Уведомления о новых заявках и мероприятиях</CardDescription>
            </CardHeader>
            <CardContent className="flex max-h-[300px] grow flex-col overflow-y-auto">
              <Notifications type="admin" />
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Upcoming Events */}
          <Card className="col-span-2">
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
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {eventsLoading
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
                              <Button variant="link" asChild className="mt-2">
                                <Link to="/manage/events/suggest">
                                  Создать мероприятие
                                </Link>
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
    </div>
  )
}
