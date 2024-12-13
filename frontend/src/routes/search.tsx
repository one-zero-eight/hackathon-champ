import type { SchemaSort } from '@/api/types.ts'
import type { Filters } from '@/lib/types'
import { $api } from '@/api'
import { EventCard } from '@/components/EventCard.tsx'
import { ExportFiltersToCalButton } from '@/components/ExportFiltersToCalButton'
import { AllFilters } from '@/components/filters/AllFilters'
import { ShareFiltersButton } from '@/components/ShareFiltersButton'
import { Button } from '@/components/ui/button'
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
import { useDebouncedState } from '@/hooks/useDebouncedState'
import { normalizeFilters } from '@/lib/utils'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import Share from '~icons/lucide/share-2'

export const Route = createFileRoute('/search')({
  component: RouteComponent,
  validateSearch: (search): { filters?: Filters, share?: string } => {
    return {
      filters: (search.filters as Filters | undefined) || undefined,
      share: (search.share as string | undefined) || undefined,
    }
  },
})

const getInitialFilters: () => Filters | undefined = () => undefined

const SORT_PRESETS = {
  'По умолчанию': null,
  'Сначала ранние': {
    type: 'date',
    direction: 1,
  },
  'Сначала поздние': {
    type: 'date',
    direction: -1,
  },
  'Больше участников': {
    type: 'participant_count',
    direction: -1,
  },
  'Меньше участников': {
    type: 'participant_count',
    direction: 1,
  },
} satisfies { [k: string]: SchemaSort | null }

function RouteComponent() {
  const navigate = useNavigate()
  const { filters: routeFilters, share } = Route.useSearch()
  const [sortPreset, setSortPreset] = useState<keyof typeof SORT_PRESETS>('По умолчанию')

  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const {
    actualValue: filters,
    debouncedValue: filtersDebounced,
    setValue: setFilters,
    setValueFlushed: setFiltersFlushed,
    debouncing: filtersDebouncing,
  } = useDebouncedState(routeFilters, 300)

  const normalizedFilters = useMemo(() => {
    return normalizeFilters(filters)
  }, [filters])

  const normalizedFiltersDebounced = useMemo(() => {
    return normalizeFilters(filtersDebounced)
  }, [filtersDebounced])

  const hasShared = Boolean(share)

  const {
    data: sharedFilters,
    isPending: sharedPending,
  } = $api.useQuery(
    'get',
    '/events/search/share/{selection_id}',
    { params: { path: { selection_id: share ?? '' } } },
    { enabled: hasShared },
  )

  const sharedLoading = hasShared && sharedPending

  // Set filters to shared, when they are loaded.
  useEffect(() => {
    if (hasShared && !sharedPending && sharedFilters) {
      setFiltersFlushed(sharedFilters.filters)
    }
  }, [hasShared, sharedPending, sharedFilters, setFiltersFlushed])

  useEffect(() => {
    navigate({
      to: '/search',
      search: { filters: normalizedFiltersDebounced },
    })
  }, [navigate, normalizedFiltersDebounced])

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const handleQueryChange = (newQuery: string) => {
    setFilters({
      ...normalizedFiltersDebounced,
      query: newQuery,
    })
  }

  const handleResetFilters = () => {
    const initial = getInitialFilters()
    setFiltersFlushed(initial)
  }

  const { data, isPending: eventsLoading } = $api.useQuery(
    'post',
    '/events/search',
    {
      body: {
        filters: {
          ...normalizedFiltersDebounced,
          status: ['accredited'],
        },
        pagination: {
          page_no: 1,
          page_size: 100,
        },
        sort: sortPreset ? SORT_PRESETS[sortPreset] : null,
      },
    },
    { enabled: !sharedLoading },
  )
  const accreditedEvents = useMemo(() => {
    return data
      ?.events
      .filter(event => event.status === 'accredited') ?? []
  }, [data])

  const loading = eventsLoading
    || sharedLoading
    || filtersDebouncing

  return (
    <div className="flex flex-grow flex-col pl-[var(--search-sidebar-width)]">
      <aside className="fixed left-0 h-[calc(100vh-var(--header-height))] w-[var(--search-sidebar-width)] shrink-0 grow-0 overflow-auto border-r p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Фильтры</h3>
            <Button size="sm" variant="secondary" onClick={handleResetFilters}>
              Сбросить
            </Button>
          </div>

          <ExportFiltersToCalButton filters={normalizedFilters} />
          <Button onClick={() => setShareDialogOpen(true)}>
            <Share />
            Поделиться подборкой
          </Button>
          <ShareFiltersButton
            open={shareDialogOpen}
            setOpen={setShareDialogOpen}
            filters={normalizedFilters}
            sort={sortPreset ? SORT_PRESETS[sortPreset] : undefined}
          />

          <Separator />
          <AllFilters
            filters={filters || {}}
            onChange={handleFiltersChange}
            className="w-full"
          />
        </div>
      </aside>

      <main className="flex w-full flex-grow flex-col">
        <div className="sticky top-[var(--header-height)] z-[1] border-b bg-white bg-opacity-90 p-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Input
              className="rounded-md border border-gray-300 px-2 py-1"
              value={filters?.query ?? ''}
              onChange={e => handleQueryChange(e.target.value)}
              placeholder="Название, вид спорта, город..."
            />
            <Select value={sortPreset} onValueChange={setSortPreset as (a: keyof typeof SORT_PRESETS) => void}>
              <SelectTrigger className="w-[200px]">
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
        <div className="flex flex-grow flex-col gap-4 bg-stone-100 p-4">
          {loading
            ? (
                <>
                  <Skeleton className="h-[200px] bg-stone-200" />
                  <Skeleton className="h-[200px] bg-stone-200" />
                  <Skeleton className="h-[200px] bg-stone-200" />
                  <Skeleton className="h-[200px] bg-stone-200" />
                  <Skeleton className="h-[200px] bg-stone-200" />
                </>
              )
            : accreditedEvents.length
              ? (accreditedEvents.map(event => <EventCard key={event.id} event={event} />))
              : (
                  <div className="flex h-[200px] w-full items-center justify-center">
                    Ничего не найдено
                  </div>
                )}
        </div>
      </main>
    </div>
  )
}
