import type { SchemaFederation, SchemaParticipant } from '@/api/types.ts'
import { $api } from '@/api'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Label } from '@/components/ui/label.tsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx'
import { RANKS } from '@/lib/ranks.ts'
import { cn } from '@/lib/utils.ts'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import Check from '~icons/lucide/check'
import Edit from '~icons/lucide/edit'
import Loader2 from '~icons/lucide/loader'

export type CreateParticipantData = {
  name: string
  birth_date: string
  related_federation: string | null
  gender: 'male' | 'female' | null
  email: string
  rank: string | null
}

export function CreateParticipantDialog({
  open,
  setOpen,
  initialData,
  onParticipantCreated,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  initialData?: Partial<CreateParticipantData>
  onParticipantCreated?: (participant: SchemaParticipant) => void
}) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateParticipantData>({
    name: initialData?.name || '',
    birth_date: initialData?.birth_date || '',
    related_federation: initialData?.related_federation || null,
    gender: initialData?.gender || null,
    email: initialData?.email || '',
    rank: initialData?.rank || null,
  })

  const { mutate: createParticipant, isPending } = $api.useMutation('post', '/participants/person/', {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/participants/person/').queryKey,
      })
      if (data.related_federation) {
        queryClient.invalidateQueries({
          queryKey: $api.queryOptions(
            'get',
            '/participants/person/get-for-federation/{federation_id}',
            { params: { path: { federation_id: data.related_federation } } },
          ).queryKey,
        })
      }
      setOpen(false)
      onParticipantCreated?.(data)
    },
  })
  const { data: federations } = $api.useQuery('get', '/federations/')

  const byDistrict: Map<string, SchemaFederation[]> = useMemo(() => {
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    createParticipant({
      body: {
        ...formData,
        birth_date: formData.birth_date || null,
        related_federation: formData.related_federation || null,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать участника</DialogTitle>
          <DialogDescription>
            Укажите данные участника, прикрепите федерацию и нажмите "Создать".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                ФИО
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Например: Иванов Иван Иванович"
                required
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Дата рождения
              </Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={e => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                className="col-span-3"
                placeholder="Например: 01.01.2000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Пол
              </Label>
              <div className="flex">
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'rounded-r-none border-r-0',
                    formData.gender == null && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, gender: null }))}
                >
                  не указан
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'rounded-none',
                    formData.gender === 'male' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'male' }))}
                >
                  муж
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    'rounded-l-none border-l-0',
                    formData.gender === 'female' && 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, gender: 'female' }))}
                >
                  жен
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Разряд / звание
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-[230px] justify-between px-3 text-left font-normal"
                    role="combobox"
                  >
                    <span className="truncate">
                      {formData.rank || 'Нет разряда'}
                    </span>
                    <Edit className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>Ничего не найдено.</CommandEmpty>
                      <CommandItem
                        onSelect={() =>
                          setFormData(prev => ({
                            ...prev,
                            rank: null,
                          }))}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            !formData.rank
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        Нет разряда
                      </CommandItem>
                      {RANKS.map(
                        rank => (
                          <CommandItem
                            key={rank}
                            onSelect={() =>
                              setFormData(prev => ({
                                ...prev,
                                rank,
                              }))}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.rank
                                === rank
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            <span>{rank}</span>
                          </CommandItem>
                        ),
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Федерация
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-[230px] justify-between px-3 text-left font-normal"
                    role="combobox"
                  >
                    <span className="truncate">
                      {federations?.find(
                        f => f.id === formData.related_federation,
                      )?.region || 'Нет федерации'}
                    </span>
                    <Edit className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Поиск федерации..."
                      className="h-9"
                    />
                    <CommandList className="max-h-[300px] overflow-y-auto">
                      <CommandEmpty>Ничего не найдено.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            setFormData(prev => ({
                              ...prev,
                              related_federation: null,
                            }))}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              !formData.related_federation
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          Нет федерации
                        </CommandItem>
                      </CommandGroup>
                      {Array.from(byDistrict.entries()).map(
                        ([district, feds]) => (
                          <CommandGroup
                            key={district}
                            heading={district || 'Без округа'}
                          >
                            {feds.map(federation => (
                              <CommandItem
                                key={federation.id}
                                onSelect={() =>
                                  setFormData(prev => ({
                                    ...prev,
                                    related_federation: federation.id,
                                  }))}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    formData.related_federation
                                    === federation.id
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                <span>{federation.region}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ),
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                Email
                <div>(опционально)</div>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e =>
                  setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="col-span-3"
                placeholder="Почта для связи"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
