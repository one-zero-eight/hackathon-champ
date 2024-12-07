import type { DateRange } from 'react-day-picker'
import { DateRangePicker } from '@/components/DateRangePicker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import Check from '~icons/lucide/check'
import ChevronsUpDown from '~icons/lucide/chevrons-up-down'
import Download from '~icons/lucide/download'
import Printer from '~icons/lucide/printer'
import X from '~icons/lucide/x'

const EMPTY_ARRAY: readonly string[] = []

interface AnalyticsFiltersProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
  districts: string[]
  selectedDistricts: string[]
  onDistrictsChange: (districts: string[]) => void
  onExport: () => void
  showDistrictsFilter?: boolean
}

export function AnalyticsFilters({
  dateRange,
  onDateRangeChange,
  districts,
  selectedDistricts,
  onDistrictsChange,
  onExport,
  showDistrictsFilter = true,
}: AnalyticsFiltersProps) {
  const hasFilters = dateRange || (showDistrictsFilter && selectedDistricts.length > 0)

  const clearFilters = () => {
    onDateRangeChange(undefined)
    if (showDistrictsFilter) {
      onDistrictsChange([])
    }
  }

  const toggleDistrict = (district: string) => {
    if (selectedDistricts.includes(district)) {
      onDistrictsChange(selectedDistricts.filter(d => d !== district))
    }
    else {
      onDistrictsChange([...selectedDistricts, district])
    }
  }

  const availableDistricts = districts || EMPTY_ARRAY

  return (
    <Card className="do-not-print">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Фильтры</CardTitle>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto py-1 text-sm text-muted-foreground"
              >
                Сбросить
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => print()}>
              <Printer className="mr-2 size-4" />
              Печать
            </Button>
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 size-4" />
              Экспорт
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={cn('grid gap-4', showDistrictsFilter ? 'sm:grid-cols-2' : 'sm:grid-cols-1')}>
            <div className="space-y-2">
              <span className="text-sm font-medium">Период</span>
              <DateRangePicker
                value={dateRange}
                onChange={onDateRangeChange}
              />
            </div>
            {showDistrictsFilter && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Федеральные округа</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedDistricts.length === 0
                        ? 'Выберите округа'
                        : `Выбрано: ${selectedDistricts.length}`}
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Поиск округа..." />
                      <CommandList>
                        <CommandEmpty>Ничего не найдено.</CommandEmpty>
                        <CommandGroup>
                          {availableDistricts.map(district => (
                            <CommandItem
                              key={district}
                              value={district}
                              onSelect={() => toggleDistrict(district)}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  selectedDistricts.includes(district)
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {district}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2">
              {dateRange && (
                <Badge variant="secondary" className="gap-2">
                  <span>
                    {dateRange.from?.toLocaleDateString('ru')}
                    {' - '}
                    {dateRange.to?.toLocaleDateString('ru')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 p-0 hover:bg-transparent"
                    onClick={() => onDateRangeChange(undefined)}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              )}
              {showDistrictsFilter && selectedDistricts.map(district => (
                <Badge key={district} variant="secondary" className="gap-2">
                  <span>{district}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 p-0 hover:bg-transparent"
                    onClick={() => toggleDistrict(district)}
                  >
                    <X className="size-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
