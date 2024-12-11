import type { Sort } from '@/lib/types'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import ArrowDown from '~icons/lucide/arrow-down'
import ArrowUp from '~icons/lucide/arrow-up'
import Plus from '~icons/lucide/plus'

export const Route = createFileRoute('/manage/events/_layout')({
  component: LayoutComponent,
})

const DEFAULT_SORT: Sort = { type: 'date', direction: -1 }

// TODO: Improve this.
const encodeSort = (sort: Sort) => JSON.stringify(sort)
const decodeSort = (value: string) => JSON.parse(value)

export function LayoutWrapper({
  title,
  description,
  children,
  onSortChange,
  currentSort = DEFAULT_SORT,
}: {
  title: string
  description: string
  children: ReactNode
  onSortChange?: (sort: Sort) => void
  currentSort?: Sort
}) {
  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={encodeSort(currentSort)}
            onValueChange={value => onSortChange?.(decodeSort(value))}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>

                  По дате
                </SelectLabel>
                <SelectItem value={encodeSort({ type: 'date', direction: -1 })}>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="size-4" />
                    <span>Сначала новые</span>
                  </div>
                </SelectItem>
                <SelectItem value={encodeSort({ type: 'date', direction: 1 })}>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="size-4" />
                    <span>Сначала старые</span>
                  </div>
                </SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>По количеству участников</SelectLabel>
                <SelectItem value={encodeSort({ type: 'participant_count', direction: -1 })}>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="size-4" />
                    <span>Сначала больше участников</span>
                  </div>
                </SelectItem>
                <SelectItem value={encodeSort({ type: 'participant_count', direction: 1 })}>
                  <div className="flex items-center gap-2">
                    <ArrowUp className="size-4" />
                    <span>Сначала меньше участников</span>
                  </div>
                </SelectItem>
              </SelectGroup>
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
