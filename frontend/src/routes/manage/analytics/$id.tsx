import type { EventStatus, Federation } from '@/lib/types'
import type { DateRange } from 'react-day-picker'
import { $api } from '@/api'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { QuickStatsCard } from '@/components/analytics/QuickStatsCard'
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe } from '@/hooks/useMe'
import { RANK_COLOR, RANKS } from '@/lib/ranks.ts'
import * as statsLib from '@/lib/stats'
import { eventTooltipFormatter, getStatusText, ranksTooltipFormatter } from '@/lib/utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
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
import Award from '~icons/lucide/award'
import Calendar from '~icons/lucide/calendar'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Map from '~icons/lucide/map'
import Printer from '~icons/lucide/printer'
import Users from '~icons/lucide/users'

const EVENT_COLOR_BY_STATUS = {
  draft: statsLib.COLOR_NEUTRAL,
  on_consideration: statsLib.COLOR_INFO,
  accredited: statsLib.COLOR_SUCCESS,
  rejected: statsLib.COLOR_DESTRUCTIVE,
}

const GENDER_COLORS: { [key: string]: string } = {
  Мужчины: '#0ea5e9',
  Женщины: '#e838e2',
  Неизвестно: '#6b7280',
}

// Helper function to format month
function formatMonth(date: string) {
  return new Date(date).toLocaleString('ru', { month: 'long', year: 'numeric' })
}

export const Route = createFileRoute('/manage/analytics/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
  }, [meError, navigate])

  const isAdmin = me?.role === 'admin'

  const [dateRange, setDateRange] = useState<DateRange>()

  const { data: federation } = $api.useQuery(
    'get',
    '/federations/{id}',
    { params: { path: { id } } },
  )
  const { data: federationStats } = $api.useQuery(
    'get',
    '/federations/{id}/stats',
    { params: { path: { id } } },
  )

  const {
    data: eventsData,
    isLoading: eventsLoading,
  } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {
          host_federation: id,
          ...((dateRange?.from || dateRange?.to)
            ? {
                date: {
                  start_date: dateRange?.from?.toISOString(),
                  end_date: dateRange?.to?.toISOString(),
                },
              }
            : {}),
        },
        pagination: { page_no: 1, page_size: 10000 },
      },
    },
  )

  const events = useMemo(() => eventsData?.events ?? [], [eventsData])

  // Calculate statistics
  const stats = useMemo(() => {
    const eventsByStatusMap = statsLib.eventsByStatus(events)
    const eventsByStatusArray = Object
      .entries(eventsByStatusMap)
      .map(([status, count]) => ({
        status: status as EventStatus,
        count,
      }))

    const eventsByMonth = events.reduce((acc, event) => {
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

    return {
      total: events.length,
      monthlyData,
      averageParticipants: statsLib.participantsAverage(events),

      byStatusMap: eventsByStatusMap,
      byStatusArray: eventsByStatusArray,
    }
  }, [events])

  const handleExport = useCallback(() => {
    if (!federation)
      return

    const data = {
      federation,
      events,
      stats,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `federation-${federation.id}-analytics.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [events, federation, stats])

  // Calculate trend data
  const trendData = useMemo(() => {
    const monthlyTrend = events.reduce((acc, event) => {
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
  }, [events])

  const finishedEventsCount = useMemo(() => {
    let count = 0
    const nowMs = new Date().getTime()
    for (const event of events) {
      if (new Date(event.end_date).getTime() < nowMs)
        count++
    }
    return count
  }, [events])

  const activeEventsCount = useMemo(() => {
    let count = 0
    const nowMs = new Date().getTime()
    for (const event of events) {
      if (new Date(event.start_date).getTime() < nowMs && new Date(event.end_date).getTime() > nowMs)
        count++
    }
    return count
  }, [events])

  const federationRanks = Object.entries(federationStats?.ranks ?? {})
  federationRanks.sort((a, b) => RANKS.indexOf(b[0]) - RANKS.indexOf(a[0]))

  let participantStatsByGender: { name: string, value: number }[] = []
  if (federationStats) {
    participantStatsByGender = [
      {
        name: 'Мужчины',
        value: federationStats.total_male_in_registry,
      },
      {
        name: 'Женщины',
        value: federationStats.total_female_in_registry,
      },
      {
        name: 'Неизвестно',
        value:
              federationStats.total_participants_in_registry
              - federationStats.total_male_in_registry
              - federationStats.total_female_in_registry,
      },
    ].filter(({ value }) => value > 0)
  }

  return (
    <div className="container space-y-6 p-4 md:p-6">
      {!federation
        ? (<Skeleton className="h-14 w-full bg-neutral-200" />)
        : (<PageHeader federation={federation} isAdmin={isAdmin} />)}

      <div className="grid gap-6">
        {/* Statistics */}
        {federationStats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickStatsCard
              title="Всего участников"
              icon={Users}
              value={federationStats.total_participants_in_registry}
              color="blue"
              secondaryText="В реестре"
            />
            <QuickStatsCard
              title="Всего участий"
              icon={Award}
              value={federationStats?.total_participations}
              secondaryValue={federationStats?.participations_for_last_month ?? null}
              secondaryText="за последний месяц"
              color="yellow"
            />
            <QuickStatsCard
              title="Всего команд"
              icon={Users}
              value={federationStats?.total_teams}
              secondaryValue={federationStats?.teams_for_last_month ?? null}
              secondaryText="за последний месяц"
              color="purple"
            />
            <QuickStatsCard
              title="Всего мероприятий"
              icon={Calendar}
              value={federationStats?.total_competitions}
              secondaryValue={federationStats?.competitions_for_last_month ?? null}
              secondaryText="за последний месяц"
              color="blue"
            />
          </div>
        )}

        {federationStats && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Разряды участников</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={federationRanks}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        startAngle={90 + 45}
                        endAngle={360 + 90 + 45}
                        dataKey={1}
                        nameKey={0}
                        label={({ name }) => name}
                      >
                        {federationRanks.map(([rank]) => (
                          <Cell key={rank} fill={RANK_COLOR[rank] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={ranksTooltipFormatter}
                        labelFormatter={label => `${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 md:gap-4">
                  {federationRanks.map(([rank, count]) => (
                    <div key={rank} className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full md:size-3"
                        style={{ backgroundColor: RANK_COLOR[rank] || '#6b7280' }}
                      />
                      <span className="text-xs text-muted-foreground md:text-sm">
                        {`${rank} (${count})`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Пол участников</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={participantStatsByGender}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey="name"
                        label={({ name }) => name}
                      >
                        {participantStatsByGender.map(({ name }) => (
                          <Cell key={name} fill={GENDER_COLORS[name] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={ranksTooltipFormatter}
                        labelFormatter={label => `${label}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 md:gap-4">
                  {participantStatsByGender.map(({ name, value }) => (
                    <div key={name} className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full md:size-3"
                        style={{ backgroundColor: GENDER_COLORS[name] || '#6b7280' }}
                      />
                      <span className="text-xs text-muted-foreground md:text-sm">
                        {`${name} (${value})`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          districts={[]}
          selectedDistricts={[]}
          onDistrictsChange={() => {
          }}
          showDistrictsFilter={false}
          onExport={handleExport}
        />

        {eventsLoading
          ? (
              <div className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                    <Skeleton key={i} className="h-[5.875rem] bg-neutral-200" />
                  ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                    <Skeleton key={i} className="h-[300px] bg-neutral-200" />
                  ))}
                </div>
              </div>
            )
          : (
              <>
                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <QuickStatsCard
                    title="Мероприятий"
                    secondaryText="За выбранный период"
                    icon={Calendar}
                    value={stats.total}
                    color="blue"
                  />
                  <QuickStatsCard
                    title="Завершено"
                    secondaryText="За выбранный период"
                    icon={CheckCircle}
                    value={finishedEventsCount}
                    color="green"
                  />
                  <QuickStatsCard
                    title="Сейчас идёт"
                    secondaryText="За выбранный период"
                    icon={Clock}
                    value={activeEventsCount}
                    color="yellow"
                  />
                  <QuickStatsCard
                    title="Среднее число участников"
                    secondaryText="За выбранный период"
                    icon={Map}
                    value={Number.isNaN(stats.averageParticipants) ? '—' : stats.averageParticipants}
                    color="purple"
                  />
                </div>

                {events.length === 0
                  ? (
                      <div className="mt-8 flex flex-col items-center justify-center gap-4">
                        <h2 className="text-2xl font-semibold text-muted-foreground">
                          Нет данных за выбранный период
                        </h2>
                      </div>
                    )
                  : (
                      <>
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
                                      data={stats.byStatusArray}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="count"
                                      nameKey="status"
                                      label={entry => getStatusText(entry.status)}
                                    >
                                      {stats.byStatusArray.map(({ status }) => (
                                        <Cell key={status} fill={EVENT_COLOR_BY_STATUS[status]} />
                                      ))}
                                    </Pie>
                                    <Tooltip
                                      formatter={eventTooltipFormatter}
                                      labelFormatter={label => `${label}`}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2 md:gap-4">
                                {stats.byStatusArray.map(({ status, count }) => (
                                  <div key={status} className="flex items-center gap-2">
                                    <div
                                      className="size-2 rounded-full md:size-3"
                                      style={{ backgroundColor: EVENT_COLOR_BY_STATUS[status] }}
                                    />
                                    <span className="text-xs text-muted-foreground md:text-sm">
                                      {`${getStatusText(status)} (${count})`}
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
                                      formatter={eventTooltipFormatter}
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
                              {events
                                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                                .slice(0, 5)
                                .map(event => (
                                  <div
                                    key={event.id}
                                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                  >
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
                                      <p className="text-xs text-muted-foreground md:text-sm">
                                        {getStatusText(event.status)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )}
              </>
            )}
      </div>
    </div>
  )
}

function PageHeader({
  federation,
  isAdmin,
}: {
  federation: Federation
  isAdmin: boolean
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">{federation.region}</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          {federation.district ?? 'Федеральный округ не указан'}
        </p>
      </div>
      <Button className="do-not-print ml-auto" onClick={() => print()}>
        <Printer className="mr-2 size-4" />
        Печать
      </Button>
      {isAdmin && (
        <Button asChild variant="outline" className="do-not-print w-full md:w-auto">
          <Link to="/manage/analytics">
            Вернуться к списку
          </Link>
        </Button>
      )}
    </div>
  )
}
