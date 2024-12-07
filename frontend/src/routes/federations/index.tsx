import type { Federation } from '@/lib/types'
import { $api } from '@/api'
import { FederationLogo } from '@/components/FederationLogo'
import { StatusIcon } from '@/components/StatusIcon'
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
import { cn } from '@/lib/utils'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import Mail from '~icons/lucide/mail'
import Phone from '~icons/lucide/phone'
import Search from '~icons/lucide/search'
import User from '~icons/lucide/user-round'

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
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Региональные федерации</h1>
        <p className="mt-2 text-muted-foreground">
          Список региональных федераций, их статус, контактная информация и описание.
        </p>
      </div>

      <div className="grid gap-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-muted-foreground">
              <Search className="size-4" />
              <span>Поиск федерации...</span>
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
                  <Link
                    key={federation.id}
                    to="/federations/$federationId"
                    params={{ federationId: federation.id }}
                    className="group"
                  >
                    <Card
                      className="flex h-full flex-col shadow-sm transition-colors group-hover:bg-muted/50 group-hover:shadow-none"
                    >
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <FederationLogo logoUrl={federation.logo} alt={federation.region} size="card" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium">{federation.region}</h3>
                              <StatusIcon
                                status={federation.status}
                                className={cn(
                                  'size-4',
                                  federation.status === 'on_consideration' && 'text-yellow-500',
                                  federation.status === 'accredited' && 'text-green-500',
                                  federation.status === 'rejected' && 'text-red-500',
                                )}
                              />
                            </div>
                            {federation.district && (
                              <p className="text-xs text-muted-foreground">{federation.district}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {federation.head && (
                          <div className="flex items-center gap-2 text-xs">
                            <User className="size-4" />
                            <span>{federation.head}</span>
                          </div>
                        )}
                        <div className="mt-2 space-y-1">
                          {federation.email && (
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="size-4" />
                              <span>{federation.email}</span>
                            </div>
                          )}
                          {federation.phone && (
                            <div className="flex items-center gap-2 text-xs">
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
    </div>
  )
}
