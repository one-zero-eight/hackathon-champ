import { cn } from '@/lib/utils'
import ChevronLeft from '~icons/lucide/chevron-left'
import ChevronRight from '~icons/lucide/chevron-right'
import { ColoredBadge } from './ColoredBadge'
import { Button } from './ui/button'

const MONTH_NAMES: { [n in number]?: string } = {
  0: 'Январь',
  1: 'Февраль',
  2: 'Март',
  3: 'Апрель',
  4: 'Май',
  5: 'Июнь',
  6: 'Июль',
  7: 'Август',
  8: 'Сентябрь',
  9: 'Октябрь',
  10: 'Ноябрь',
  11: 'Декабрь',
}

const MONTH_IDX = Object.keys(MONTH_NAMES).map(n => Number(n))

export function Calendar({
  year,
  onYearChange,
  onMonthSelect,
  disabled = false,
  className,
  countByMonth,
}: {
  year: number
  onYearChange: (newYear: number) => void
  onMonthSelect: (year: number, monthIdx: number) => void
  disabled?: boolean
  countByMonth: Record<number, number>
  className?: string
}) {
  const visibleYears = [
    year - 3,
    year - 2,
    year - 1,
    year,
    year + 1,
    year + 2,
    year + 3,
  ]

  return (
    <div className={cn('h-fit overflow-hidden rounded-md border', className)}>
      <div className="flex justify-between gap-2 border-b px-4 py-2">
        <Button
          className="shrink-0"
          disabled={disabled}
          variant="outline"
          size="icon"
          onClick={() => onYearChange(year - 1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex min-w-0 shrink justify-center gap-2 overflow-hidden">
          {visibleYears.map(visibleYear => (
            <Button
              disabled={disabled}
              key={visibleYear}
              onClick={() => onYearChange(visibleYear)}
              variant={visibleYear === year ? 'default' : 'ghost'}
            >
              {visibleYear}
            </Button>
          ))}
        </div>
        <Button
          className="shrink-0"
          disabled={disabled}
          variant="outline"
          size="icon"
          onClick={() => onYearChange(year + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-4 grid-rows-3 gap-2 bg-stone-100 p-4">
        {MONTH_IDX.map(idx => (
          <Button
            disabled={disabled}
            variant="outline"
            className="group flex h-fit min-w-[165px] flex-col items-center p-2"
            key={idx}
            onClick={() => onMonthSelect(year, idx)}
          >
            <span className="text-xl">{MONTH_NAMES[idx]}</span>
            <ColoredBadge color={(countByMonth[idx] ?? 0) > 0 ? 'green' : 'gray'}>
              {`${countByMonth[idx] ?? '—'} мероприятий`}
            </ColoredBadge>
          </Button>
        ))}
      </div>
    </div>
  )
}
