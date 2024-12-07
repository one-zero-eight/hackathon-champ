import type { SchemaEvent } from '@/api/types.ts'
import { $api } from '@/api'
import { Button } from '@/components/ui/button.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Loader2 from '~icons/lucide/loader'

export function OnConsiderationDialog({ event }: { event: SchemaEvent }) {
  const queryClient = useQueryClient()
  const {
    mutate: updateEvent,
    isPending,
  } = $api.useMutation('put', '/events/{id}', {
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/events/{id}', { params: { path: { id: data?.id ?? '' } } }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/events/').queryKey,
      })
    },
  })
  const [comment, setComment] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateEvent({
      params: { path: { id: event.id } },
      body: {
        ...event,
        accreditation_comment: comment,
        status: 'on_consideration',
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Отправить на рассмотрение
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Отправить мероприятие на рассмотрение</DialogTitle>

          <DialogDescription>
            Чтобы мероприятие появилось на сайте, отправьте его на рассмотрение.
            Когда администратор общероссийской федерации одобрит мероприятие,
            оно станет доступно для всех пользователей.
          </DialogDescription>

          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 pt-4">
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Комментарий для администратора
                </label>
                <Input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Введите комментарий"
                />
              </div>

              <DialogFooter>
                <Button type="submit" variant="default" disabled={isPending}>
                  {isPending && <Loader2 />}
                  Отправить на рассмотрение
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
