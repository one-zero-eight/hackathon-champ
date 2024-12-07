import type { Filters } from '@/lib/types'
import { $api } from '@/api'
import { Calendar } from '@/components/Calendar'
import { AllFilters } from '@/components/filters/AllFilters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { normalizeFilters, plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { Temporal } from 'temporal-polyfill'

export const Route = createFileRoute('/calendar')({
  component: RouteComponent,
})

function monthRanges(year: number, monthIdx: number): [Temporal.PlainDate, Temporal.PlainDate] {
  const startDate = Temporal.PlainDate.from(
    `${year}-${(monthIdx + 1).toString().padStart(2, '0')}-01`,
  )
  const endDate = startDate.add({ months: 1 })
  return [startDate, endDate]
}

function RouteComponent() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<Filters>({})
  const [year, setYear] = useState(new Date().getFullYear())

  const dateFilter = useMemo(
    () => ({
      start_date: `${year}-01-01`,
      end_date: `${year + 1}-01-01`,
    }),
    [year],
  )

  const completeFilters = useMemo(
    () => ({
      ...filters,
      date: dateFilter,
    }),
    [filters, dateFilter],
  )

  const { data, isLoading } = $api.useQuery(
    'post',
    '/events/search/count-by-month',
    {
      body: normalizeFilters(completeFilters),
    },
  )

  const countByMonth = useMemo(() => {
    const byMonth = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [i, 0]),
    )
    Object.entries(data ?? {}).forEach(([month, count]) => {
      const [yearStr, monthStr] = month.split('-')
      if (yearStr === String(year)) {
        byMonth[Number(monthStr) - 1] = count
      }
    })
    return byMonth
  }, [data, year])

  return (
    <div className="container mx-auto space-y-6 py-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Календарь мероприятий</h1>
        <p className="mt-2 text-muted-foreground">
          Просмотр и поиск соревнований по спортивному программированию
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
        {/* Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <AllFilters
              filters={filters}
              onChange={setFilters}
              exclude={['date']}
              className="space-y-6"
            />
          </CardContent>
        </Card>

        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Календарь</CardTitle>
            <CardDescription>
              Выберите месяц для просмотра мероприятий
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              disabled={isLoading}
              year={year}
              onYearChange={setYear}
              countByMonth={countByMonth}
              onMonthSelect={(y, m) => {
                navigate({
                  to: '/search',
                  search: {
                    filters: {
                      ...filters,
                      date: plainDatesForFilter(...monthRanges(y, m)),
                    },
                  },
                })
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
