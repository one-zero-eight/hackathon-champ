import type { Filters } from '@/lib/types'
import type { FilterBaseProps } from './common'
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { cn, plainDatesForFilter } from '@/lib/utils.ts'
import { ru } from 'date-fns/locale/ru'
import { useState } from 'react'
import { Temporal } from 'temporal-polyfill'
import CalendarIcon from '~icons/lucide/calendar'
import { Separator } from '../ui/separator'
import { BaseFilter } from './BaseFilter'

export function DatesFilter(props: FilterBaseProps<Filters['date']>) {
  const { disabled, value, onChange, ...rest } = props

  const valueStartDate = value?.start_date ? new Date(value.start_date) : null
  const valueStartPlain = valueStartDate ? dateToPlain(valueStartDate) : null
  const valueEndDate = value?.end_date ? new Date(value.end_date) : null
  const valueEndPlain = valueEndDate ? dateToPlain(valueEndDate) : null

  return (
    <BaseFilter {...rest}>
      <div className="flex flex-col gap-2">
        <DatePicker
          value={valueStartPlain}
          onChange={v => onChange(plainDatesForFilter(v, valueEndPlain))}
          placeholder="Не раньше"
          className="w-full"
        />

        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-sm text-muted-foreground">до</span>
          <Separator className="flex-1" />
        </div>

        <DatePicker
          value={valueEndPlain}
          onChange={v => onChange(plainDatesForFilter(valueStartPlain, v))}
          placeholder="Не позже"
          className="w-full"
        />
      </div>
    </BaseFilter>
  )
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: Temporal.PlainDate | null
  onChange: (v: Temporal.PlainDate | null) => void
  placeholder: string
  className?: string
}) {
  const selectedDate = value ? plainToDate(value) : undefined
  const [open, setOpen] = useState(false)
  const today = Temporal.Now.plainDateISO()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant="outline"
          className={cn(
            'h-9 justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          <span className="flex-1 truncate">
            {value
              ? value.equals(today)
                ? 'Сегодня'
                : plainToDate(value).toLocaleString('ru-RU', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                })
              : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          defaultMonth={selectedDate}
          selected={selectedDate}
          onSelect={(newDate) => {
            onChange(newDate ? dateToPlain(newDate) : null)
            setOpen(false)
          }}
          numberOfMonths={1}
          locale={ru}
        />
        <div className="flex justify-end gap-2 border-t p-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              onChange(Temporal.Now.plainDateISO())
              setOpen(false)
            }}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
          >
            Сбросить
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function plainToDate(d: Temporal.PlainDate) {
  return new Date(d.year, d.month - 1, d.day)
}

function dateToPlain(d: Date) {
  return Temporal.PlainDate.from({
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  })
}
