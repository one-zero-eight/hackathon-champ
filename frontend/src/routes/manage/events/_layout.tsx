import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import Calendar from '~icons/lucide/calendar'
import CheckCircle2 from '~icons/lucide/check-circle-2'
import MapPin from '~icons/lucide/map-pin'
import Plus from '~icons/lucide/plus'
import Type from '~icons/lucide/type'
import Users from '~icons/lucide/users'

export const Route = createFileRoute('/manage/events/_layout')({
  component: LayoutComponent,
})

export interface EventLocation {
  country: string
  region?: string | null
  city?: string | null
}

export interface Event {
  id: string
  host_federation: string | null
  status: 'draft' | 'on_consideration' | 'accredited' | 'rejected'
  status_comment: string | null
  accreditation_comment: string | null
  title: string
  description: string | null
  start_date: string
  end_date: string
  location: EventLocation[]
  participant_count: number | null
  ekp_id: number | null
  page: number | null
  results: { [key: string]: any } | null
  gender: 'male' | 'female' | null
  age_min: number | null
  age_max: number | null
  discipline: string[]
  type?: string | null
  level?: string | null
  format?: string | null
  organization?: string | null
  contact_person?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  contact_website?: string | null
  contact_social?: string | null
}

export type EventSortOption = 'date' | 'name' | 'status' | 'participants' | 'location'

export type SortDirection = 'asc' | 'desc'

export interface EventSort {
  type: 'date' | 'name' | 'status' | 'participants' | 'location'
  direction: SortDirection
}

const DEFAULT_SORT: EventSort = {
  type: 'date',
  direction: 'desc',
} as const

const SORT_OPTIONS: Array<{
  value: EventSort['type']
  label: string
  icon: typeof Calendar
  directions: {
    asc: string
    desc: string
  }
}> = [
  {
    value: 'date',
    label: 'По дате',
    icon: Calendar,
    directions: {
      asc: 'Сначала старые',
      desc: 'Сначала новые',
    },
  },
  {
    value: 'name',
    label: 'По названию',
    icon: Type,
    directions: {
      asc: 'От А до Я',
      desc: 'От Я до А',
    },
  },
  {
    value: 'status',
    label: 'По статусу',
    icon: CheckCircle2,
    directions: {
      asc: 'По возрастанию',
      desc: 'По убыванию',
    },
  },
  {
    value: 'participants',
    label: 'По участникам',
    icon: Users,
    directions: {
      asc: 'По возрастанию',
      desc: 'По убыванию',
    },
  },
  {
    value: 'location',
    label: 'По месту проведения',
    icon: MapPin,
    directions: {
      asc: 'От А до Я',
      desc: 'От Я до А',
    },
  },
]

interface LayoutWrapperProps {
  title: string
  description: string
  children: ReactNode
  onSortChange?: (sort: EventSort) => void
  currentSort?: EventSort
}

function LayoutWrapper({
  title,
  description,
  children,
  onSortChange,
  currentSort = DEFAULT_SORT,
}: LayoutWrapperProps) {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={`${currentSort.type}-${currentSort.direction}`}
            onValueChange={(value) => {
              const [type, direction] = value.split('-') as [EventSort['type'], SortDirection]
              onSortChange?.({ type, direction })
            }}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectGroup key={option.value}>
                  <SelectLabel>{option.label}</SelectLabel>
                  {(['asc', 'desc'] as const).map(direction => (
                    <SelectItem
                      key={`${option.value}-${direction}`}
                      value={`${option.value}-${direction}`}
                    >
                      <div className="flex items-center gap-2">
                        <option.icon className="size-4" />
                        {option.directions[direction]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/manage/events/suggest">
              <Plus className="mr-2 size-4" />
              Новое мероприятие
            </Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}

function LayoutComponent() {
  return <Outlet />
}

export function EventsLayout(props: LayoutWrapperProps) {
  return <LayoutWrapper {...props} />
}

export function transformApiEvent(apiEvent: any): Event {
  return {
    ...apiEvent,
    end_date: apiEvent.end_date || apiEvent.start_date,
    ekp_id: apiEvent.ekp_id ? Number(apiEvent.ekp_id) : null,
    page: apiEvent.page ? Number(apiEvent.page) : null,
  }
}
