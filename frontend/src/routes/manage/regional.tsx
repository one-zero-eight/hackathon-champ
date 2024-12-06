import { $api } from '@/api'
import { useMe } from '@/api/me'
import { EventCard } from '@/components/EventCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Temporal } from 'temporal-polyfill'
import ArrowUpRight from '~icons/lucide/arrow-up-right'
import Award from '~icons/lucide/award'
import Bell from '~icons/lucide/bell'
import CalendarIcon from '~icons/lucide/calendar'
import ChevronRight from '~icons/lucide/chevron-right'
import FileText from '~icons/lucide/file-text'
import Filter from '~icons/lucide/filter'
import MessageSquare from '~icons/lucide/message-square'
import Plus from '~icons/lucide/plus'
import User from '~icons/lucide/user'
import Users from '~icons/lucide/users'

// Extend ViewUser type with additional properties
type RegionalUser = {
  id: string
  login: string
  role: 'regional'
  region: string
}

export const Route = createFileRoute('/manage/regional')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: me } = useMe() as { data: RegionalUser | undefined }

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-[var(--header-height)] h-[calc(100vh-var(--header-height))] w-64 border-r bg-white">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">{me?.region}</h2>
          <p className="text-sm text-muted-foreground">Кабинет регионального представителя</p>
        </div>
        
        <nav className="flex flex-col p-2">
          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/manage/regional" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <FileText className="h-5 w-5" />
              Управление заявками
            </Link>
          </Button>

          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/manage/regional" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <Award className="h-5 w-5" />
              Протоколы соревнований
            </Link>
          </Button>

          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/manage/regional" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <Users className="h-5 w-5" />
              Реестр участников
            </Link>
          </Button>

          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/calendar" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <CalendarIcon className="h-5 w-5" />
              Спортивный календарь
            </Link>
          </Button>

          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/manage/regional" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <MessageSquare className="h-5 w-5" />
              Связь с федерацией
            </Link>
          </Button>

          <Button asChild variant="ghost" className="mb-1 justify-start">
            <Link to="/manage/regional" className="relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium">
              <User className="h-5 w-5" />
              Настройки профиля
            </Link>
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Панель управления</h1>
            <p className="text-gray-500">Добро пожаловать! Здесь собрана вся важная информация.</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="mr-2 size-4" />
              Новая заявка
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 size-4" />
              Фильтры
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Всего участников</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Users className="size-8 text-blue-500" />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <ArrowUpRight className="mr-1 size-4 text-green-500" />
                  +12 за последний месяц
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Активных команд</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Users className="size-8 text-purple-500" />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <ArrowUpRight className="mr-1 size-4 text-green-500" />
                  +2 новых команды
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Соревнований</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Award className="size-8 text-yellow-500" />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  2 в этом месяце
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Средний результат</p>
                    <p className="text-2xl font-bold">72.5%</p>
                  </div>
                  <Award className="size-8 text-green-500" />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <ArrowUpRight className="mr-1 size-4 text-green-500" />
                  +5.2% к прошлому году
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Applications Status */}
            <Card>
              <CardHeader>
                <CardTitle>Статус заявок</CardTitle>
                <CardDescription>Текущий статус всех заявок</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500"></div>
                      <span>Ожидают проверки</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-green-500"></div>
                      <span>Одобрены</span>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-red-500"></div>
                      <span>Отклонен</span>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">1</Badge>
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
                    Просмотреть все заявки
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Ближайшие мероприятия</CardTitle>
                  <CardDescription>Мероприятия на ближайшие 30 дней</CardDescription>
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

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Последние обновления и напоминания</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-100 p-2">
                        <Bell className="size-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Новая заявка одобрена</p>
                        <p className="text-xs text-gray-500">2 часа назад</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-yellow-100 p-2">
                        <Bell className="size-4 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Приближается дедлайн подачи заявок</p>
                        <p className="text-xs text-gray-500">5 часов назад</p>
                      </div>
                    </div>
                    <Button variant="outline" className="mt-4 w-full">
                      Все уведомления
                    </Button>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
