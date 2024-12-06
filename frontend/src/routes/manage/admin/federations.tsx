import type { SchemaFederation, SchemaStatusEnum } from '../../../api/types'
import { $api } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Search from '~icons/lucide/search'

export const Route = createFileRoute('/manage/admin/federations')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [statusComment, setStatusComment] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<SchemaStatusEnum | null>(null)
  const { toast } = useToast()

  const { data: federations, isLoading } = $api.useQuery('get', '/federations/')

  const byDistrict = useMemo(() => {
    if (!federations)
      return new Map()
    const map = new Map<string, SchemaFederation[]>()
    for (const federation of federations) {
      const district = federation.district ?? ''
      const list = map.get(district) ?? []
      list.push(federation)
      map.set(district, list)
    }
    return map
  }, [federations])

  const filteredFederations = useMemo(() => {
    if (!federations)
      return []
    return federations.filter((federation) => {
      const matchesSearch = searchQuery === ''
        || federation.region.toLowerCase().includes(searchQuery.toLowerCase())
        || federation.district?.toLowerCase().includes(searchQuery.toLowerCase())
        || federation.head?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDistrict = !selectedDistrict || federation.district === selectedDistrict
      const matchesStatus = !selectedStatus || federation.status === selectedStatus

      return matchesSearch && matchesDistrict && matchesStatus
    })
  }, [federations, searchQuery, selectedDistrict, selectedStatus])

  const { mutate: accrediteMutation } = $api.useMutation(
    'post',
    '/federations/{id}/accredite',
    {
      onSuccess: (data) => {
        toast({
          title: 'Статус обновлен',
          description: 'Статус федерации успешно обновлен',
        })
        setStatusComment('')
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/federations/').queryKey,
        })
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions('get', '/federations/{id}', { params: { path: { id: data.id } } }).queryKey,
        })
      },
    },
  )

  const getStatusBadgeVariant = (status: SchemaStatusEnum): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'accredited':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'on_consideration':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-8">
        <div>
          <h1 className="text-3xl font-bold">Управление федерациями</h1>
          <p className="mt-2 text-muted-foreground">
            Просмотр и управление статусами федераций
          </p>
        </div>

        <div className="flex gap-4">
          <div className="h-10 w-[300px] animate-pulse rounded bg-muted" />
          <div className="h-10 w-[200px] animate-pulse rounded bg-muted" />
          <div className="h-10 w-[200px] animate-pulse rounded bg-muted" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список федераций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Регион</TableHead>
                      <TableHead className="w-[150px]">Округ</TableHead>
                      <TableHead className="w-[150px]">Статус</TableHead>
                      <TableHead>Комментарий</TableHead>
                      <TableHead className="w-[150px]">Руководитель</TableHead>
                      <TableHead className="w-[200px]">Контакты</TableHead>
                      <TableHead className="w-[300px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array.from({ length: 5 })].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-24 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-6 w-28 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-48 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell><div className="h-4 w-28 animate-pulse rounded bg-muted" /></TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-8 w-full animate-pulse rounded bg-muted" />
                            <div className="flex gap-2">
                              <div className="h-9 w-full animate-pulse rounded bg-muted" />
                              <div className="h-9 w-full animate-pulse rounded bg-muted" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Управление федерациями</h1>
        <p className="mt-2 text-muted-foreground">
          Просмотр и управление статусами федераций
        </p>
      </div>

      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start text-muted-foreground">
              <Search className="mr-2 size-4 shrink-0" />
              <span className="truncate">
                {searchQuery || 'Поиск федерации...'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Поиск по региону или руководителю..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>Ничего не найдено.</CommandEmpty>
                {Array.from(byDistrict.entries()).map(([district, feds]) => (
                  <CommandGroup key={district} heading={district || 'Без округа'}>
                    {feds.map((federation: SchemaFederation) => (
                      <CommandItem
                        key={federation.id}
                        value={`${district} ${federation.region}`}
                        onSelect={() => setSearchQuery(federation.region)}
                        className="flex items-center"
                      >
                        <span className="truncate">{federation.region}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              <span className="truncate">
                {selectedDistrict || 'Все округа'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandList>
                <CommandItem onSelect={() => setSelectedDistrict(null)}>
                  Все округа
                </CommandItem>
                {Array.from(byDistrict.keys()).map(district => (
                  <CommandItem
                    key={district}
                    onSelect={() => setSelectedDistrict(district)}
                    className="flex items-center"
                  >
                    <span className="truncate">{district || 'Без округа'}</span>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start">
              {selectedStatus
                ? (selectedStatus === 'on_consideration'
                    ? 'На рассмотрении'
                    : selectedStatus === 'accredited' ? 'Аккредитована' : 'Отклонена')
                : 'Все статусы'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandItem onSelect={() => setSelectedStatus(null)}>
                  Все статусы
                </CommandItem>
                <CommandItem onSelect={() => setSelectedStatus('on_consideration')}>
                  На рассмотрении
                </CommandItem>
                <CommandItem onSelect={() => setSelectedStatus('accredited')}>
                  Аккредитована
                </CommandItem>
                <CommandItem onSelect={() => setSelectedStatus('rejected')}>
                  Отклонена
                </CommandItem>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список федераций</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Регион</TableHead>
                    <TableHead className="w-[150px]">Округ</TableHead>
                    <TableHead className="w-[150px]">Статус</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead className="w-[150px]">Руководитель</TableHead>
                    <TableHead className="w-[200px]">Контакты</TableHead>
                    <TableHead className="w-[300px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFederations.map(federation => (
                    <TableRow key={federation.id}>
                      <TableCell>{federation.region}</TableCell>
                      <TableCell>{federation.district}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(federation.status)}>
                          {federation.status === 'on_consideration'
                            ? 'На рассмотрении'
                            : federation.status === 'accredited' ? 'Аккредитована' : 'Отклонена'}
                        </Badge>
                      </TableCell>
                      <TableCell>{federation.status_comment}</TableCell>
                      <TableCell>{federation.head}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {federation.email && <div className="text-sm">{federation.email}</div>}
                          {federation.phone && <div className="text-sm">{federation.phone}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Комментарий к статусу
                            </label>
                            <Input
                              placeholder="Введите комментарий"
                              value={statusComment}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusComment(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="default"
                                  disabled={federation.status === 'accredited'}
                                  className="w-full"
                                >
                                  Аккредитовать
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Аккредитация федерации</DialogTitle>
                                  <DialogDescription>
                                    Вы уверены, что хотите аккредитовать эту федерацию?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                                    Отмена
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      accrediteMutation({
                                        params: {
                                          path: { id: federation.id },
                                          query: {
                                            status: 'accredited',
                                            status_comment: statusComment,
                                          },
                                        },
                                      })
                                      document.querySelector('dialog')?.close()
                                    }}
                                  >
                                    Подтвердить
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  disabled={federation.status === 'rejected'}
                                  className="w-full"
                                >
                                  Отклонить
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Отклонение федерации</DialogTitle>
                                  <DialogDescription>
                                    Вы уверены, что хоти��е отклонить эту федеацию?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                                    Отмена
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      accrediteMutation({
                                        params: {
                                          path: { id: federation.id },
                                          query: {
                                            status: 'rejected',
                                            status_comment: statusComment,
                                          },
                                        },
                                      })
                                      document.querySelector('dialog')?.close()
                                    }}
                                  >
                                    Подтвердить
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
