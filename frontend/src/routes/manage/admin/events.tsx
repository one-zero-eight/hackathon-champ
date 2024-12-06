import type { SchemaStatusEnum } from '../../../api/types'
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import Search from '~icons/lucide/search'

interface SchemaEvent {
  id: string
  name: string
  date: string
  status: SchemaStatusEnum
  status_comment?: string
  organizer?: string
  location?: string
}

export const Route = createFileRoute('/manage/admin/events')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const [statusComment, setStatusComment] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<SchemaStatusEnum | null>(null)
  const { toast } = useToast()

  const { data: events, isLoading } = useQuery<SchemaEvent[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await fetch('/api/events/')
      if (!response.ok)
        throw new Error('Failed to fetch events')
      const data = await response.json()
      return Array.isArray(data) ? data : []
    },
  })

  const filteredEvents = useMemo(() => {
    if (!events)
      return []
    return events.filter((event: SchemaEvent) => {
      if (!event || typeof event !== 'object')
        return false

      const matchesSearch = searchQuery === ''
        || (event.name && event.name.toLowerCase().includes(searchQuery.toLowerCase()))
        || (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
        || (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = !selectedStatus || event.status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [events, searchQuery, selectedStatus])

  const accrediteMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string, status: SchemaStatusEnum, comment?: string }) => {
      const response = await fetch(`/api/events/${id}/accredite?status=${status}${comment ? `&status_comment=${encodeURIComponent(comment)}` : ''}`, {
        method: 'POST',
      })
      if (!response.ok)
        throw new Error('Failed to update event status')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast({
        title: 'Статус обновлен',
        description: 'Статус мероприятия успешно обновлен',
      })
      setStatusComment('')
    },
    onError: (error) => {
      toast({
        title: 'Ошбка',
        description: `Не удалось обновить статус: ${error.message}`,
        variant: 'destructive',
      })
    },
  })

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
          <h1 className="text-3xl font-bold">Управление мероприятиями</h1>
          <p className="mt-2 text-muted-foreground">
            Просмотр и управление статусами мероприятий
          </p>
        </div>

        <div className="flex gap-4">
          <div className="h-10 w-[300px] animate-pulse rounded bg-muted" />
          <div className="h-10 w-[200px] animate-pulse rounded bg-muted" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Список мероприятий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Название</TableHead>
                      <TableHead className="w-[150px]">Дата</TableHead>
                      <TableHead className="w-[150px]">Статус</TableHead>
                      <TableHead>Комментарий</TableHead>
                      <TableHead className="w-[150px]">Организатор</TableHead>
                      <TableHead className="w-[200px]">Место проведения</TableHead>
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
                        <TableCell><div className="h-4 w-32 animate-pulse rounded bg-muted" /></TableCell>
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
        <h1 className="text-3xl font-bold">Управление мероприятиями</h1>
        <p className="mt-2 text-muted-foreground">
          Просмотр и управление статусами мероприятий
        </p>
      </div>

      <div className="flex gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px] justify-start text-muted-foreground">
              <Search className="mr-2 size-4 shrink-0" />
              <span className="truncate">
                {searchQuery || 'Поиск мероприятия...'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Поиск по названию или организатору..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>Ничего не найдено.</CommandEmpty>
                <CommandGroup>
                  {events?.map((event: SchemaEvent) => (
                    <CommandItem
                      key={event.id}
                      value={event.name}
                      onSelect={() => setSearchQuery(event.name)}
                      className="flex items-center"
                    >
                      <span className="truncate">{event.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
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
                    : selectedStatus === 'accredited' ? 'Подтверждено' : 'Отклонено')
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
                  Подтверждено
                </CommandItem>
                <CommandItem onSelect={() => setSelectedStatus('rejected')}>
                  Отклонено
                </CommandItem>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список мероприятий</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Название</TableHead>
                    <TableHead className="w-[150px]">Дата</TableHead>
                    <TableHead className="w-[150px]">Статус</TableHead>
                    <TableHead>Комментарий</TableHead>
                    <TableHead className="w-[150px]">Организатор</TableHead>
                    <TableHead className="w-[200px]">Место проведения</TableHead>
                    <TableHead className="w-[300px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(filteredEvents || []).map((event: SchemaEvent) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.name || '-'}</TableCell>
                      <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status === 'on_consideration'
                            ? 'На рассмотрении'
                            : event.status === 'accredited' ? 'Подтверждено' : 'Отклонено'}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.status_comment || '-'}</TableCell>
                      <TableCell>{event.organizer || '-'}</TableCell>
                      <TableCell>{event.location || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Комментарий к статус
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
                                  disabled={event.status === 'accredited'}
                                  className="w-full"
                                >
                                  Подтвердить
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Подтверждение мероприятия</DialogTitle>
                                  <DialogDescription>
                                    Вы уверены, что хотите подтвердить это мероприятие?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                                    Отмена
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      accrediteMutation.mutate({
                                        id: event.id,
                                        status: 'accredited',
                                        comment: statusComment,
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
                                  disabled={event.status === 'rejected'}
                                  className="w-full"
                                >
                                  Отклонить
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Отклонение мероприятия</DialogTitle>
                                  <DialogDescription>
                                    Вы уверены, что хотите отклонить это мероприятие?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                  <Button variant="outline" onClick={() => document.querySelector('dialog')?.close()}>
                                    Отмена
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => {
                                      accrediteMutation.mutate({
                                        id: event.id,
                                        status: 'rejected',
                                        comment: statusComment,
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
