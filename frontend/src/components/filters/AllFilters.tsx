import type { Filters } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DatesFilter } from './DatesFilter'
import { DisciplineFilter } from './DisciplineFilter'
import { FederationFilter } from './FederationFilter'
import { GenderSelect } from './GenderSelect'
import { LocationFilter } from './LocationFilter'
import { MinMaxFilter } from './MinMaxFilter'

const DEFAULT_EXCLUDE: ('date')[] = []

export function AllFilters({
  disabled,
  filters,
  onChange,
  className,
  exclude = DEFAULT_EXCLUDE,
}: {
  disabled?: boolean
  filters: Filters
  onChange: (v: Filters) => void
  className?: string
  exclude?: 'date'[]
}) {
  function getOnChange<K extends keyof Filters>(
    k: K,
  ): (value: Filters[K]) => void {
    return (newValue) => {
      onChange({ ...filters, [k]: newValue })
    }
  }

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      <FederationFilter
        disabled={disabled}
        label="Федерация"
        value={filters.host_federation}
        onChange={getOnChange('host_federation')}
      />
      {!exclude.includes('date') && (
        <DatesFilter
          disabled={disabled}
          label="Даты проведения"
          value={filters.date}
          onChange={getOnChange('date')}
        />
      )}
      <DisciplineFilter
        disabled={disabled}
        label="Дисциплина"
        value={filters.discipline}
        onChange={getOnChange('discipline')}
      />
      <LocationFilter
        disabled={disabled}
        label="Место проведения"
        value={filters.location}
        onChange={getOnChange('location')}
      />
      <MinMaxFilter
        disabled={disabled}
        label="Количество участников"
        value={filters.participant_count}
        onChange={getOnChange('participant_count')}
      />
      <MinMaxFilter
        disabled={disabled}
        label="Возраст"
        value={filters.age}
        onChange={getOnChange('age')}
      />
      <GenderSelect
        disabled={disabled}
        label="Пол"
        value={filters.gender}
        onChange={getOnChange('gender')}
      />
    </div>
  )
}
