import type { DateRange } from 'react-day-picker'
import { $api } from '@/api'
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters'
import { TrendAnalysis } from '@/components/analytics/TrendAnalysis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
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
    default:
      return status
  }
}

export const Route = createFileRoute('/manage/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: federationsData, isPending: federationsLoading } = $api.useQuery('get', '/federations/')
  const { data: eventsData, isPending: eventsLoading } = $api.useQuery('get', '/events/')

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
    const federationsByStatus = filteredFederations.reduce((acc, fed) => {
      acc[fed.status] = (acc[fed.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

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

    const avgEventsPerFederation = Object.keys(eventsByFederation).length > 0
      ? Object.values(eventsByFederation).reduce((a, b) => a + b, 0) / Object.keys(eventsByFederation).length
      : 0

    const statusData = Object.entries(federationsByStatus).map(([name, value]) => ({
      name: formatStatus(name),
      value,
    }))

    const districtData = Object.entries(federationsByDistrict)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value,
      }))

    const monthlyData = Object.entries(eventsByMonth)
      .sort((a, b) => {
        const dateA = new Date(a[0].split(' ')[0])
        const dateB = new Date(b[0].split(' ')[0])
        return dateA.getTime() - dateB.getTime()
      })
      .map(([name, value]) => ({
        name,
        value,
      }))

    return {
      total: filteredFederations.length,
      byStatus: federationsByStatus,
      byDistrict: federationsByDistrict,
      avgEventsPerFederation: Math.round(avgEventsPerFederation * 10) / 10,
      activeDistricts: Object.keys(federationsByDistrict).length,
      totalEvents: filteredEvents.length,
      statusData,
      districtData,
      monthlyData,
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
        name,
        value,
        trend: index > 0 ? value - array[index - 1][1] : 0,
      }))
  }, [filteredEvents])

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Аналитика федерация</h1>
        <p className="text-muted-foreground">
          Статистика и налитика по региональным федерациям
        </p>
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
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                <Building className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего федерация</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Аккредитовано</p>
                <p className="text-2xl font-bold">{stats.byStatus.accredited ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-yellow-500/10 p-3 text-yellow-500">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">На рассмотрении</p>
                <p className="text-2xl font-bold">{stats.byStatus.on_consideration ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-red-500/10 p-3 text-red-500">
                <XCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Отклонено</p>
                <p className="text-2xl font-bold">{stats.byStatus.rejected ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                <Map className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Федеральных округов</p>
                <p className="text-2xl font-bold">{stats.activeDistricts}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-purple-500/10 p-3 text-purple-500">
                <BarChart className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Среднее число мероприятий</p>
                <p className="text-2xl font-bold">{stats.avgEventsPerFederation}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-full bg-orange-500/10 p-3 text-orange-500">
                <Calendar className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Всего мероприятий</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Статус федерация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
                    >
                      {stats.statusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                {stats.statusData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-muted-foreground">
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

          <Card>
            <CardHeader>
              <CardTitle>Мероприятия по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add trend analysis */}
        <div className="grid gap-4 md:grid-cols-2">
          <TrendAnalysis
            data={trendData}
            title="Тренд мероприятий"
          />
          {/* ... existing pie chart ... */}
        </div>

        {/* Detailed Stats */}
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
                        <span>{value}</span>
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
              <CardTitle>Топ федерация</CardTitle>
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
      </div>
    </div>
  )
}