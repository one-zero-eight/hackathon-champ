import type { Federation } from '@/lib/types'
import { $api } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import Building from '~icons/lucide/building'
import Mail from '~icons/lucide/mail'
import Phone from '~icons/lucide/phone'
import Search from '~icons/lucide/search'

// TODO: make sure Tailwind scans there values and generates classes
const STATUS_COLORS = {
  on_consideration: 'bg-yellow-500',
  accredited: 'bg-green-500',
  rejected: 'bg-red-500',
} as const

export const Route = createFileRoute('/federations/')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
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

  const handleFederationSelect = (id: string) => {
    navigate({
      to: '/federations/$federationId',
      params: { federationId: id },
    })
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Региональные федерации</h1>
        <p className="mt-2 text-muted-foreground">
          Список региональных федераций, их статус, контактная информация и описание
        </p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-muted-foreground">
            <Search />
            Поиск федерации...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Введите название федерации или регион..." />
            <CommandList>
              <CommandEmpty>По вашему запросу ничего не найдено.</CommandEmpty>
              {Array.from(byDistrict.entries()).map(([district, federations]) => (
                <CommandGroup key={district} heading={district}>
                  {federations.map(federation => (
                    <CommandItem
                      key={federation.id}
                      value={`${district} ${federation.region}`}
                      onSelect={() => handleFederationSelect(federation.id)}
                    >
                      {federation.region}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isPending
        ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).fill(null).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          )
        : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {federations.map(federation => (
                <Link key={federation.id} to="/federations/$federationId" params={{ federationId: federation.id }}>
                  <Card className="flex flex-col transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
                          <Building className="size-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{federation.region}</h3>
                            <div className={`size-2 rounded-full ${STATUS_COLORS[federation.status]}`} />
                          </div>
                          {federation.district && (
                            <p className="text-sm text-muted-foreground">{federation.district}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      {federation.head && (
                        <p className="text-sm">
                          Руководитель:
                          {federation.head}
                        </p>
                      )}
                      <div className="mt-2 space-y-1">
                        {federation.email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="size-4" />
                            <span>{federation.email}</span>
                          </div>
                        )}
                        {federation.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="size-4" />
                            <span>{federation.phone}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
    </div>
  )
}
