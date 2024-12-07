import type { Federation, Filters } from '@/lib/types'
import type { FilterBaseProps } from './common'
import { $api } from '@/api'
import { cn } from '@/lib/utils'
import { useMemo, useState } from 'react'
import Check from '~icons/lucide/check'
import Search from '~icons/lucide/search'
import X from '~icons/lucide/x'
import { Button } from '../ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { BaseFilter } from './BaseFilter'

export function FederationFilter(props: FilterBaseProps<Filters['host_federation']>) {
  const { disabled, value, onChange, ...rest } = props
  const [open, setOpen] = useState(false)

  const { data, isPending } = $api.useQuery('get', '/federations/')
  const federations = useMemo(() => (data ?? []), [data])

  const byDistrict = useMemo(() => {
    const map = new Map<string, Federation[]>()
    for (const federation of federations) {
      const district = federation.district ?? ''
      const list = map.get(district) ?? []
      list.push(federation)
      map.set(district, list)
    }
    return map
  }, [federations])

  const federationName = useMemo(() => {
    if (!value)
      return null
    const federation = federations.find(f => f.id === value)
    return federation?.region ?? ''
  }, [value, federations])

  const handleFederationSelect = (id: string) => {
    onChange(id)
  }

  return (
    <BaseFilter {...rest}>
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start overflow-hidden">
              <Search className="size-4" />
              <span className="truncate">
                {federationName ?? 'Выберите федерацию...'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Введите название федерации или регион..." />
              <CommandList>
                <CommandEmpty>
                  <span className="px-4">
                    {isPending ? 'Идёт загрузка...' : 'По вашему запросу ничего не найдено.'}
                  </span>
                </CommandEmpty>
                {Array.from(byDistrict.entries()).map(([district, federations]) => (
                  <CommandGroup key={district} heading={district}>
                    {federations.map(federation => (
                      <CommandItem
                        key={federation.id}
                        value={`${district} ${federation.region}`}
                        onSelect={() => {
                          setOpen(false)
                          handleFederationSelect(federation.id)
                        }}
                      >
                        {federation.region}
                        <Check
                          className={cn(
                            'ml-auto h-4 w-4',
                            value === federation.id ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {value != null && (
          <Button
            className="flex-shrink-0"
            variant="outline"
            size="icon"
            onClick={() => {
              if (value !== null) {
                onChange(null)
              }
            }}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </BaseFilter>
  )
}
