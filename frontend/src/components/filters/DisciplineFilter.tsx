import type { Filters } from '@/lib/types'
import type { FilterBaseProps } from './common'
import { $api } from '@/api'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
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
import { useEffect, useMemo, useState } from 'react'
import { useDebounce } from 'react-use'
import Check from '~icons/lucide/check'
import ChevronsUpDown from '~icons/lucide/chevrons-up-down'
import X from '~icons/lucide/x'
import { BaseFilter } from './BaseFilter'

export function DisciplineFilter(props: FilterBaseProps<Filters['discipline']>) {
  const { disabled, value: valueRaw, onChange, ...rest } = props

  const value = useMemo(() => valueRaw ?? [], [valueRaw])

  const { data } = $api.useQuery('get', '/events/search/filters/disciplines')
  const all = useMemo(() => {
    if (!data)
      return []
    return data.disciplines
  }, [data])

  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [qDeb, setQDeb] = useState('')
  useDebounce(
    () => {
      setQDeb(q)
    },
    150,
    [q, setQDeb],
  )

  useEffect(() => {
    if (!open) {
      setQ('')
      setQDeb('')
    }
  }, [open])

  const filtered = all.filter(x => x.toLowerCase().includes(qDeb.trim().toLowerCase()))

  const handleSelect = (discipline: string) => {
    if (value.includes(discipline)) {
      onChange(value.filter(x => x !== discipline))
    }
    else {
      onChange([...value, discipline])
    }
  }

  const selected = useMemo(
    () => all.filter(x => value.includes(x)),
    [all, value],
  )

  const label = value.length === 0 ? 'Все дисциплины' : value.join(', ')

  return (
    <BaseFilter {...rest}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            variant="outline"
            role="combobox"
            className="justify-between"
          >
            <span className="min-w-0 overflow-hidden text-ellipsis">
              {label}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Дисциплина..."
              className="h-9"
              value={q}
              onValueChange={setQ}
            />
            <CommandList>
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              {filtered.map(name => (
                <CommandItem key={name} onSelect={() => handleSelect(name)}>
                  <span>{name}</span>
                  <Check
                    className={cn(
                      'ml-auto h-4 w-4',
                      selected.includes(name) ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-col gap-2">
          {selected.map(name => (
            <div
              key={name}
              className="flex items-center justify-between rounded bg-blue-50 p-2 pl-4"
            >
              <span className="mr-2 text-sm">{name}</span>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => handleSelect(name)}
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      )}
    </BaseFilter>
  )
}
