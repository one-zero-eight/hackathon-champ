import type { Filters } from '@/lib/types'
import { $api } from '@/api'
import { EventCard } from '@/components/EventCard.tsx'
import { ExportFiltersToCalButton } from '@/components/ExportFiltersToCalButton'
import { AllFilters } from '@/components/filters/AllFilters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { normalizeFilters, plainDatesForFilter } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useDebounce } from 'react-use'
import { Temporal } from 'temporal-polyfill'
import Search from '~icons/lucide/search'
import SortAsc from '~icons/lucide/sort-asc'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
  validateSearch: (search): { filters?: Filters, share?: string } => {
    return {
      filters: (search.filters as Filters | undefined) || undefined,
      share: (search.share as string | undefined) || undefined,
    }
  },
})

const getInitialFilters: () => Filters = () => ({
  date: plainDatesForFilter(Temporal.Now.plainDateISO(), null),
})

const SORT_PRESETS = {
  'Сначала ранние': {
    date: 'asc',
  },
  'Сначала поздние': {
    date: 'desc',
  },
  'Больше участников': {
    participant_count: 'desc',
  },
  'Меньше участников': {
    participant_count: 'asc',
  },
}

function RouteComponent() {
  const navigate = useNavigate()
  const { filters: routeFilters, share } = Route.useSearch()
  const [actualFilters, setActualFilters] = useState<Filters | undefined>(
    getInitialFilters,
  )
  const [filtersChanging, setFiltersChanging] = useState(false)
  const [debouncedFilters, setDebouncedFilters] = useState<Filters | undefined>(
    actualFilters,
  )
  const [query, setQuery] = useState('')
  const { data: shareFilters, isLoading: sharedLoading } = $api.useQuery(
    'get',
    '/events/search/share/{selection_id}',
    { params: { path: { selection_id: share ?? '' } } },
    { enabled: !!share },
  )
  const [sortPreset, setSortPreset] = useState<
    keyof typeof SORT_PRESETS | undefined
  >('Сначала ранние')

  useEffect(() => {
    const newFilters = shareFilters?.filters ?? routeFilters
    if (newFilters) {
      setActualFilters(newFilters)
      setQuery(newFilters.query ?? '')
    }
  }, [routeFilters, shareFilters])

  useDebounce(
    () => {
      setDebouncedFilters(actualFilters)
      setFiltersChanging(false)
      if (!sharedLoading) {
        const newFilters = { ...actualFilters, query: query || undefined }
        navigate({
          to: '/search',
          search: {
            filters: Object.keys(newFilters).length ? newFilters : undefined,
          },
        })
      }
    },
    300,
    [actualFilters, query, filtersChanging],
  )

  const handleFiltersChange = (newFilters: Filters) => {
    setFiltersChanging(true)
    setActualFilters(newFilters)
  }

  const handleQueryChange = (newQuery: string) => {
    setFiltersChanging(true)
    setQuery(newQuery)
  }

  const handleResetFilters = () => {
    const initial = getInitialFilters()
    setActualFilters(initial)
    setDebouncedFilters(initial)
    setQuery('')
  }

  const { data, isPending: dataLoading } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: normalizeFilters(debouncedFilters || {}),
        pagination: {
          page_no: 1,
          page_size: 100,
        },
        sort: sortPreset ? SORT_PRESETS[sortPreset] : {},
      },
    },
    { enabled: !filtersChanging && !sharedLoading },
  )

  const loading = dataLoading || filtersChanging || sharedLoading

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Поиск мероприятий</h1>
        <p className="mt-2 text-muted-foreground">
          Найдите интересующие вас мероприятия, используя фильтры и поиск по названию.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="order-2 w-full md:sticky md:top-[calc(var(--header-height)+2rem)] md:order-1 md:h-fit md:w-[280px] md:shrink-0">
          <CardHeader className="flex flex-row items-center justify-between md:flex-col md:items-start">
            <CardTitle>Фильтры</CardTitle>
            <Button size="sm" variant="ghost" onClick={handleResetFilters} className="shrink-0">
              Сбросить
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <AllFilters
              filters={actualFilters || {}}
              onChange={handleFiltersChange}
              className="w-full"
            />
            <Separator />
            <ExportFiltersToCalButton filters={debouncedFilters} />
          </CardContent>
        </Card>

        <main className="order-1 flex-1 space-y-4 md:order-2 md:space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    placeholder="Название, вид спорта, город..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <SortAsc className="size-4 text-muted-foreground" />
                  <Select value={sortPreset} onValueChange={setSortPreset as any}>
                    <SelectTrigger className="w-[180px] min-w-[180px] md:w-[200px] md:min-w-[200px]">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(SORT_PRESETS).map(preset => (
                          <SelectItem key={preset} value={preset}>
                            {preset}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:gap-4">
            {loading
              ? (
                  <>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={`skeleton-${index}`} className="w-full overflow-hidden">
                        <Skeleton className="h-[180px] w-full md:h-[200px]" />
                      </Card>
                    ))}
                  </>
                )
              : data?.events.length
                ? (
                    data.events.map(event => (
                      <Card key={event.id} className="w-full overflow-hidden">
                        <div className="w-full">
                          <EventCard event={event} />
                        </div>
                      </Card>
                    ))
                  )
                : (
                    <Card className="py-8 md:py-12">
                      <div className="text-center">
                        <p className="text-lg font-medium">Ничего не найдено</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Попробуйте изменить параметры поиска
                        </p>
                      </div>
                    </Card>
                  )}
          </div>
        </main>
      </div>
    </div>
  )
}
