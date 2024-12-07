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

export function UnpublishDialog({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient()
  const { mutate: accrediteEvent, isPending } = $api.useMutation('post', '/events/{id}/accredite', {
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
    accrediteEvent({
      params: {
        path: { id: eventId },
        query: { status: 'rejected', status_comment: comment },
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Снять с публикации
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Снять мероприятие с публикации</DialogTitle>

          <DialogDescription>
            Мероприятие не будет видно на сайте.
            Вы сможете его доработать и опубликовать позже.
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
                  Снять с публикации
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
