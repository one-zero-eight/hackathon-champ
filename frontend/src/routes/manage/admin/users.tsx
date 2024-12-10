import type { SchemaViewUser } from '@/api/types'
import { $api } from '@/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'
import { useMe } from '@/hooks/useMe'
import { cn } from '@/lib/utils'

import { useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Check from '~icons/lucide/check'
import Edit from '~icons/lucide/pencil'
import Plus from '~icons/lucide/plus'

type Federation = {
  id: string
  region: string
  district: string | null
}

export const Route = createFileRoute('/manage/admin/users')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: me, isError: meError } = useMe()

  useEffect(() => {
    if (meError) {
      navigate({ to: '/auth/login' })
    }
    else if (me && me.role !== 'admin') {
      navigate({ to: me.federation ? '/manage/region/home' : '/' })
    }
  }, [me, meError, navigate])

  const [selectedUser, setSelectedUser] = useState<SchemaViewUser | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const { toast } = useToast()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newUserData, setNewUserData] = useState({ login: '', email: '', password: '' })
  const queryClient = useQueryClient()

  // Query hooks using $api
  const { data: users = [], isPending: isLoading } = $api.useQuery('get', '/users/')
  const { data: federations = [] } = $api.useQuery('get', '/federations/')

  // Mutation hooks using $api
  const { mutate: updateUser } = $api.useMutation(
    'post',
    '/users/{id}',
    {
      onSuccess: () => {
        toast({
          title: 'Успешно',
          description: 'Пароль обновлен',
        })
        setSelectedUser(null)
        setNewPassword('')
        queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/users/').queryKey })
      },
      onError: (error) => {
        toast({
          title: 'Ошибка',
          description: error?.detail?.toString() || 'Не удалось обновить пароль',
          variant: 'destructive',
        })
      },
    },
  )

  const { mutate: createUser } = $api.useMutation(
    'post',
    '/users/create',
    {
      onSuccess: () => {
        toast({
          title: 'Успешно',
          description: 'Пользователь создан',
        })
        setIsCreateDialogOpen(false)
        setNewUserData({ login: '', email: '', password: '' })
        queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/users/').queryKey })
      },
      onError: (error) => {
        toast({
          title: 'Ошибка',
          description: error?.detail?.toString() || 'Не удалось создать пользователя',
          variant: 'destructive',
        })
      },
    },
  )

  const { mutate: updateUserFederation } = $api.useMutation(
    'post',
    '/users/{id}',
    {
      onSuccess: () => {
        toast({ title: 'Успешно', description: 'Федерация обновлена' })
        queryClient.invalidateQueries({ queryKey: $api.queryOptions('get', '/users/').queryKey })
      },
      onError: (error) => {
        toast({
          title: 'Ошибка',
          description: error?.detail?.toString() || 'Не удалось обновить федерацию',
          variant: 'destructive',
        })
      },
    },
  )

  const handleUserUpdate = () => {
    if (!selectedUser || !newPassword)
      return

    updateUser({
      params: { path: { id: selectedUser.id } },
      body: { password: newPassword },
    })
  }

  const handleCreateUser = () => {
    createUser({
      body: {
        login: newUserData.login,
        password: newUserData.password,
        federation: null,
      },
    })
  }

  // Group federations by district
  const byDistrict = new Map<string, Federation[]>()
  for (const federation of federations) {
    const district = federation.district ?? ''
    const list = byDistrict.get(district) ?? []
    list.push(federation)
    byDistrict.set(district, list)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <p className="text-muted-foreground">Управление учетными записями пользователей системы</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Список пользователей</CardTitle>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Создать пользователя
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Логин</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Федерация</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[180px]" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-[200px]" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="ml-auto h-9 w-[120px]" /></TableCell>
                      </TableRow>
                    ))
                  )
                : (
                    users.map((user: SchemaViewUser) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.login}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-[230px] justify-between px-3 text-left font-normal"
                                role="combobox"
                              >
                                <span className="truncate">
                                  {federations.find((f: Federation) => f.id === user.federation)?.region || 'Нет федерации'}
                                </span>
                                <Edit className="ml-2 size-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Поиск федерации..." className="h-9" />
                                <CommandList className="max-h-[300px] overflow-y-auto">
                                  <CommandEmpty>Ничего не найдено.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={async () => {
                                        try {
                                          const response = await fetch(`/api/users/${user.id}`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ federation: null }),
                                          })
                                          if (!response.ok)
                                            throw new Error('Не удалось обновить федерацию')
                                          toast({ title: 'Успешно', description: 'Федерация обновлена' })
                                          queryClient.invalidateQueries({ queryKey: ['users'] })
                                        }
                                        catch (error: any) {
                                          toast({
                                            title: 'Ошибка',
                                            description: error?.message || 'Не удалось обновить федерацию',
                                            variant: 'destructive',
                                          })
                                        }
                                      }}
                                    >
                                      <Check className={cn('mr-2 h-4 w-4', !user.federation ? 'opacity-100' : 'opacity-0')} />
                                      Нет федерации
                                    </CommandItem>
                                  </CommandGroup>
                                  {Array.from(byDistrict.entries()).map(([district, feds]) => (
                                    <CommandGroup key={district} heading={district || 'Без округа'}>
                                      {feds.map((federation: Federation) => (
                                        <CommandItem
                                          key={federation.id}
                                          onSelect={() => {
                                            updateUserFederation({
                                              params: { path: { id: user.id } },
                                              body: { federation: federation.id },
                                            })
                                          }}
                                        >
                                          <Check className={cn('mr-2 h-4 w-4', user.federation === federation.id ? 'opacity-100' : 'opacity-0')} />
                                          <span>{federation.region}</span>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  ))}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                            }}
                          >
                            Сменить пароль
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedUser} onOpenChange={open => !open && setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Сменить пароль пользователя
              {' '}
              {selectedUser?.login}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Новый пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUserUpdate} disabled={!newPassword}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать пользователя</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="login" className="text-right">
                Логин
              </Label>
              <Input
                id="login"
                value={newUserData.login}
                onChange={e => setNewUserData(prev => ({ ...prev, login: e.target.value }))}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newUserData.email}
                onChange={e => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-user-password" className="text-right">
                Пароль
              </Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserData.password}
                onChange={e => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateUser}
              disabled={!newUserData.login || !newUserData.password}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
