import type { DateRange } from 'react-day-picker'
import { $api } from '@/api'
import { useMe } from '@/api/me'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import BarChart from '~icons/lucide/bar-chart-2'
import Building from '~icons/lucide/building'
import Calendar from '~icons/lucide/calendar'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Map from '~icons/lucide/map'
import XCircle from '~icons/lucide/x-circle'

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444']

// Helper function to format status
function formatStatus(status: string) {
  switch (status) {
    case 'accredited':
      return 'Аккредитована'
    case 'on_consideration':
      return 'На рассмотрении'
    case 'rejected':
      return 'Отклонена'
    case 'completed':
      return 'Завершено'
    case 'in_progress':
      return 'В процессе'
    case 'draft':
      return 'Черновик'
    default:
      return status
  }
}

// Helper function to format month
function formatMonth(date: string) {
  return new Date(date).toLocaleString('ru', { month: 'long', year: 'numeric' })
}

export const Route = createFileRoute('/manage/analytics/$id')({
  component: RouteComponent,
  parseParams: params => ({
    id: params.id,
  }),
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data: me } = useMe()
  const isAdmin = me?.role === 'admin'

  // Get federation data
  const { data: federation, isPending: federationLoading } = $api.useQuery(
    'get',
    '/federations/{id}',
    {
      params: {
        path: { id },
      },
    },
  )

  // Get federation's events
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery(
    'get',
    '/events/',
  )

  const isLoading = federationLoading || eventsLoading
  const events = useMemo(
    () => eventsData?.filter(event => event.host_federation === id) ?? [],
    [eventsData, id],
  )

  // Add state for filters
  const [dateRange, setDateRange] = useState<DateRange>()

  // Filter events based on date range
  const filteredEvents = useMemo(() => {
    let filtered = events

    if (dateRange?.from) {
      filtered = filtered.filter(
        event => new Date(event.start_date) >= dateRange.from!,
      )
    }
    if (dateRange?.to) {
      filtered = filtered.filter(
        event => new Date(event.start_date) <= dateRange.to!,
      )
    }

    return filtered
  }, [events, dateRange])

  // Calculate statistics
  const stats = useMemo(() => {
    const eventsByStatus = filteredEvents.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const eventsByMonth = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.start_date)
      const month = date.toLocaleString('ru', { month: 'long', year: 'numeric' })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const parseRussianMonth = (monthYear: string) => {
      const [month, year] = monthYear.split(' ')
      const russianMonths = [
        'январь',
        'февраль',
        'март',
        'апрель',
        'май',
        'июнь',
        'июль',
        'август',
        'сентябрь',
        'октябрь',
        'ноябрь',
        'декабрь',
      ]
      const monthIndex = russianMonths.findIndex(m =>
        month.toLowerCase().startsWith(m.toLowerCase()),
      )
      return new Date(Number.parseInt(year), monthIndex)
    }

    const monthlyData = Object.entries(eventsByMonth)
      .sort(([a], [b]) => {
        const dateA = parseRussianMonth(a)
        const dateB = parseRussianMonth(b)
        return dateA.getTime() - dateB.getTime()
      })
      .map(([name, value]) => ({
        name,
        value,
      }))

    const statusData = Object.entries(eventsByStatus).map(([name, value]) => ({
      name: formatStatus(name),
      value,
    }))

    const averageParticipants = filteredEvents.reduce((acc, event) => acc + (event.participant_count || 0), 0) / filteredEvents.length || 0

    return {
      total: filteredEvents.length,
      byStatus: eventsByStatus,
      statusData,
      monthlyData,
      averageParticipants: Math.round(averageParticipants),
    }
  }, [filteredEvents])

  // Calculate trend data
  const trendData = useMemo(() => {
    const monthlyTrend = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.start_date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlyTrend)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value], index, array) => ({
        name: formatMonth(name),
        value,
        trend: index > 0 ? value - array[index - 1][1] : 0,
      }))
  }, [filteredEvents])

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={i} className="h-[120px]" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={i} className="h-[300px]" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!federation) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Федерация не найдена</h2>
        <p className="text-muted-foreground">
          Не удалось загрузить данные федерации
        </p>
        <Button asChild variant="outline">
          <Link to="/manage/analytics">
            Вернуться к списку
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">{federation.region}</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {federation.district ?? 'Федеральный округ не указан'}
          </p>
        </div>
        {isAdmin && (
          <Button asChild variant="outline" className="w-full md:w-auto">
            <Link to="/manage/analytics">
              Вернуться к списку
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        {/* Filters */}
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          districts={[]}
          selectedDistricts={[]}
          onDistrictsChange={() => {}}
          showDistrictsFilter={false}
          onExport={() => {
            const data = {
              federation,
              events: filteredEvents,
              stats,
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: 'application/json',
            })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `federation-${federation.id}-analytics.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="rounded-full bg-primary/10 p-2 md:p-3">
                <Building className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Всего мероприятий</p>
                <p className="text-xl font-bold md:text-2xl">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="rounded-full bg-green-500/10 p-2 md:p-3">
                <CheckCircle className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Завершено</p>
                <p className="text-xl font-bold md:text-2xl">{stats.byStatus.completed ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="rounded-full bg-yellow-500/10 p-2 md:p-3">
                <Clock className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">В процессе</p>
                <p className="text-xl font-bold md:text-2xl">{stats.byStatus.in_progress ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4 md:p-6">
              <div className="rounded-full bg-blue-500/10 p-2 md:p-3">
                <Map className="size-5 md:size-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground md:text-sm">Среднее число участников</p>
                <p className="text-xl font-bold md:text-2xl">{stats.averageParticipants}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Federation Info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium md:text-base">Статус</h3>
              <p className="text-sm text-muted-foreground">{formatStatus(federation.status)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium md:text-base">Руководитель</h3>
              <p className="text-sm text-muted-foreground">{federation.head ?? 'Не указан'}</p>
            </div>
            <div className="sm:col-span-2">
              <h3 className="text-sm font-medium md:text-base">Контакты</h3>
              <div className="space-y-1 text-xs text-muted-foreground md:text-sm">
                <p>
                  Email:
                  {' '}
                  {federation.email ?? 'Не указан'}
                </p>
                <p>
                  Телефон:
                  {' '}
                  {federation.phone ?? 'Не указан'}
                </p>
                <p>
                  Сайт:
                  {' '}
                  {federation.site ?? 'Не указан'}
                </p>
                <p>
                  Telegram:
                  {' '}
                  {federation.telegram ?? 'Не указан'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Статус мероприятий</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={entry => entry.name}
                    >
                      {stats.statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} мероприятий`, 'Количество']}
                      labelFormatter={label => `${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 md:gap-4">
                {stats.statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="size-2 rounded-full md:size-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground md:text-sm">
                      {entry.name}
                      {' '}
                      (
                      {entry.value}
                      )
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Мероприятия по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 10 }}
                      interval={0}
                    />
                    <YAxis
                      label={{
                        value: 'Количество мероприятий',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 },
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value} мероприятий`, 'Количество']}
                      labelFormatter={label => `${label}`}
                    />
                    <Bar dataKey="value" fill="#0ea5e9" name="Мероприятия" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Analysis */}
        <TrendAnalysis
          data={trendData}
          title="Тренд мероприятий"
          valueLabel="Количество мероприятий"
          trendLabel="Изменение"
        />

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Последние мероприятия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents
                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium md:text-base">{event.title}</p>
                      <p className="text-xs text-muted-foreground md:text-sm">
                        {new Date(event.start_date).toLocaleDateString('ru')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium md:text-base">
                        {event.participant_count ?? 0}
                        {' '}
                        участников
                      </p>
                      <p className="text-xs text-muted-foreground md:text-sm">{formatStatus(event.status)}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
