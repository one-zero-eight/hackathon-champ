import { $api } from '@/api'
import { EventCard } from '@/components/EventCard'
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
import { plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Temporal } from 'temporal-polyfill'
import ArrowUpRight from '~icons/lucide/arrow-up-right'
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

  // Calculate federation statistics
  const federationStats = {
    total: federations?.length ?? 0,
    accredited: federations?.filter(f => f.status === 'accredited').length ?? 0,
    pending: federations?.filter(f => f.status === 'on_consideration').length ?? 0,
    rejected: federations?.filter(f => f.status === 'rejected').length ?? 0,
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Панель управления</h1>
          <p className="text-gray-500">
            Общероссийская федерация спортиного программирования
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/calendar">
              <Plus className="mr-2 size-4" />
              Новое мероприятие
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {federationsLoading
            ? (
                <>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="size-8 rounded" />
                      </div>
                      <Skeleton className="mt-4 h-4 w-32" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="size-8 rounded" />
                      </div>
                      <Skeleton className="mt-4 h-4 w-32" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="size-8 rounded" />
                      </div>
                      <Skeleton className="mt-4 h-4 w-32" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="size-8 rounded" />
                      </div>
                      <Skeleton className="mt-4 h-4 w-32" />
                    </CardContent>
                  </Card>
                </>
              )
            : (
                <>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Всего федераций
                          </p>
                          <p className="text-2xl font-bold">{federationStats.total}</p>
                        </div>
                        <Building className="size-8 text-blue-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <ArrowUpRight className="mr-1 size-4 text-green-500" />
                        {federationStats.pending}
                        {' '}
                        на рассмотрении
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Аккредитовано
                          </p>
                          <p className="text-2xl font-bold">{federationStats.accredited}</p>
                        </div>
                        <Award className="size-8 text-green-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        {((federationStats.accredited / federationStats.total) * 100).toFixed(1)}
                        % от общего числа
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Мероприятий
                          </p>
                          <p className="text-2xl font-bold">{upcomingEvents?.events.length ?? 0}</p>
                        </div>
                        <CalendarIcon className="size-8 text-purple-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        На ближайшие 30 дней
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Заявок
                          </p>
                          <p className="text-2xl font-bold">24</p>
                        </div>
                        <FileText className="size-8 text-yellow-500" />
                      </div>
                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        8 новых за неделю
                      </div>
                    </CardContent>
                  </Card>
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
                        <Link to="/manage/admin/federations">
                          Управление федерациями
                        </Link>
                      </Button>
                    </div>
                  )}
            </CardContent>
          </Card>

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
                                <Link to="/calendar">
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
