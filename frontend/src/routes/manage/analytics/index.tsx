import type { FederationStatus } from '@/lib/types'
import type { DateRange } from 'react-day-picker'
import { $api } from '@/api'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { PredictionChart } from '@/components/analytics/PredictionChart'
import { QuickStatsCard } from '@/components/analytics/QuickStatsCard'
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useMe } from '@/hooks/useMe'
import * as statsLib from '@/lib/stats'
import { predictFutureValues } from '@/lib/transfers'
import { eventTooltipFormatter, federationTooltipFormatter, getStatusText, pluralize } from '@/lib/utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
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
import BarChart from '~icons/lucide/bar-chart-2'
import Building from '~icons/lucide/building'
import Calendar from '~icons/lucide/calendar'
import Map from '~icons/lucide/map'
import Printer from '~icons/lucide/printer'

const FEDERATION_COLOR_BY_STATUS: Record<FederationStatus, string> = {
  accredited: statsLib.COLOR_SUCCESS,
  rejected: statsLib.COLOR_DESTRUCTIVE,
  on_consideration: statsLib.COLOR_INFO,
}

// Helper function to format month
function formatMonth(date: string) {
  return new Date(date).toLocaleString('ru', { month: 'long', year: 'numeric' })
}

export const Route = createFileRoute('/manage/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()
  const [showPredictions, setShowPredictions] = useState(false)

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
    else if (me && me.role !== 'admin') {
      if (me.federation) {
        navigate({ to: '/manage/analytics/$id', params: { id: me.federation } })
      }
      else {
        navigate({ to: '/' })
      }
    }
  }, [me, meError, navigate])

  const { data: federationsData, isLoading: federationsLoading } = $api.useQuery('get', '/federations/')
  const { data: eventsData, isLoading: eventsLoading } = $api.useQuery('get', '/events/')

  const isLoading = federationsLoading || eventsLoading
  const federations = useMemo(() => federationsData ?? [], [federationsData])
  const events = useMemo(() => eventsData ?? [], [eventsData])

  // Add state for filters
  const [dateRange, setDateRange] = useState<DateRange>()
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])

  // Filter data based on selections
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

    if (selectedDistricts.length > 0) {
      const federationsInDistricts = new Set(
        federations
          .filter(f => f.district && selectedDistricts.includes(f.district))
          .map(f => f.id),
      )
      filtered = filtered.filter(event =>
        event.host_federation && federationsInDistricts.has(event.host_federation),
      )
    }

    return filtered
  }, [events, dateRange, selectedDistricts, federations])

  const filteredFederations = useMemo(() => {
    let filtered = federations

    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(fed =>
        fed.district && selectedDistricts.includes(fed.district),
      )
    }

    if (dateRange?.from || dateRange?.to) {
      const federationsWithEvents = new Set(
        filteredEvents.map(event => event.host_federation).filter(Boolean),
      )
      filtered = filtered.filter(fed => federationsWithEvents.has(fed.id))
    }

    return filtered
  }, [federations, selectedDistricts, dateRange, filteredEvents])

  // Calculate statistics based on filtered data
  const stats = useMemo(() => {
    const federationsByStatus = statsLib.federationsByStatus(filteredFederations)
    const federationsCountByStatus = Object
      .entries(federationsByStatus)
      .map(([status, count]) => ({
        status: status as FederationStatus,
        count,
      }))

    const federationsByDistrict = filteredFederations.reduce((acc, fed) => {
      if (fed.district) {
        acc[fed.district] = (acc[fed.district] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const eventsByFederation = filteredEvents.reduce((acc, event) => {
      if (event.host_federation) {
        acc[event.host_federation] = (acc[event.host_federation] || 0) + 1
      }
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

    const avgEventsPerFederation = Object.keys(eventsByFederation).length > 0
      ? Object.values(eventsByFederation).reduce((a, b) => a + b, 0) / Object.keys(eventsByFederation).length
      : 0

    const districtData = Object.entries(federationsByDistrict)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value,
      }))

    return {
      total: filteredFederations.length,
      byDistrict: federationsByDistrict,
      avgEventsPerFederation: Math.round(avgEventsPerFederation * 10) / 10,
      activeDistricts: Object.keys(federationsByDistrict).length,
      totalEvents: filteredEvents.length,
      districtData,
      monthlyData,

      byStatusMap: federationsByStatus,
      byStatusArray: federationsCountByStatus,
    }
  }, [filteredFederations, filteredEvents])

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

  // Prepare data for predictions
  const monthlyEventData = useMemo(() => {
    const monthlyEvents = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.start_date)
      const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlyEvents)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }))
  }, [filteredEvents])

  // Generate predictions
  const predictions = useMemo(() => {
    return predictFutureValues(monthlyEventData, 6) // Predict next 6 months
  }, [monthlyEventData])

  // Export function
  const handleExport = () => {
    const data = {
      federations: filteredFederations,
      events: filteredEvents,
      stats,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analytics-export.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get unique districts with proper type checking and null handling
  const availableDistricts = useMemo(() => {
    if (!Array.isArray(federations))
      return []
    const districts = new Set<string>()
    federations.forEach((federation) => {
      if (federation.district) {
        districts.add(federation.district)
      }
    })
    return Array.from(districts)
  }, [federations])

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

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аналитика федераций</h1>
          <p className="text-muted-foreground">
            Статистика и аналитика по региональным федерациям
          </p>
        </div>

        <Button className="do-not-print ml-auto" onClick={() => print()}>
          <Printer className="mr-2 size-4" />
          Печать
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Add filters */}
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          districts={availableDistricts}
          selectedDistricts={selectedDistricts}
          onDistrictsChange={setSelectedDistricts}
          onExport={handleExport}
        />

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickStatsCard
            title="Всего федераций"
            icon={Building}
            value={stats.total}
            secondaryValue={stats.byStatusMap.on_consideration}
            color="blue"
          />
          <QuickStatsCard
            title="Федеральных округов"
            icon={Map}
            value={stats.activeDistricts}
            color="green"
          />
          <QuickStatsCard
            title="Среднее число мероприятий"
            icon={BarChart}
            value={stats.avgEventsPerFederation}
            color="purple"
          />
          <QuickStatsCard
            title="Всего мероприятий"
            icon={Calendar}
            value={stats.totalEvents}
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Статусы федераций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                        <Cell
                          key={status}
                          fill={FEDERATION_COLOR_BY_STATUS[status]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={federationTooltipFormatter}
                      labelFormatter={label => `${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {stats.byStatusArray.map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: FEDERATION_COLOR_BY_STATUS[status] }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {`${getStatusText(status)} (${count})`}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Мероприятия по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      label={{
                        value: 'Количество мероприятий',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' },
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

        {/* Add trend analysis */}
        <TrendAnalysis
          data={trendData}
          title="Тренд мероприятий"
          valueLabel="Количество мероприятий"
          trendLabel="Изменение"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>По федеральным округам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.districtData.map(({ name, value }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{name}</span>
                        <span>
                          {`${value} ${pluralize(value, 'федерация', 'федерации', 'федераций')}`}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${(value / stats.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Топ федераций</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {federations
                  .sort((a, b) => {
                    const aEvents = filteredEvents.filter(e => e.host_federation === a.id).length
                    const bEvents = filteredEvents.filter(e => e.host_federation === b.id).length
                    return bEvents - aEvents
                  })
                  .slice(0, 5)
                  .map((federation) => {
                    const federationEvents = filteredEvents.filter(
                      e => e.host_federation === federation.id,
                    ).length

                    return (
                      <Button
                        key={federation.id}
                        variant="outline"
                        asChild
                        className="h-auto justify-start px-4 py-3"
                      >
                        <Link to="/manage/analytics/$id" params={{ id: federation.id }}>
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <BarChart className="size-4" />
                              <span className="font-medium">{federation.region}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {federationEvents}
                              {' '}
                              мероприятий
                            </p>
                          </div>
                        </Link>
                      </Button>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Predictions section at the bottom */}
        <Card className="do-not-print">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>ML Прогнозирование</span>
              <Button
                variant={showPredictions ? 'default' : 'outline'}
                onClick={() => setShowPredictions(!showPredictions)}
              >
                {showPredictions ? 'Скрыть прогноз' : 'Показать прогноз'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Мы используем машинное обучение для прогнозирования количества мероприятий на следующие месяцы.
              Прогноз основан на исторических данных и учитывает сезонные тренды.
              Точность прогноза зависит от количества и качества исторических данных.
            </p>
          </CardContent>
        </Card>

        {/* Prediction chart - only show if user consented */}
        {showPredictions && (
          <PredictionChart
            historicalData={monthlyEventData}
            predictions={predictions}
            title="Прогноз мероприятий"
            valueLabel="Количество мероприятий"
          />
        )}
      </div>
    </div>
  )
}
