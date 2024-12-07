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

export function RejectFederationDialog({ federationId }: { federationId: string }) {
  const queryClient = useQueryClient()
  const { mutate: accrediteFederation, isPending } = $api.useMutation('post', '/federations/{id}/accredite', {
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/federations/{id}', { params: { path: { id: data?.id ?? '' } } }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: $api.queryOptions('get', '/federations/').queryKey,
      })
    },
  })
  const [comment, setComment] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    accrediteFederation({
      params: {
        path: { id: federationId },
        query: { status: 'rejected', status_comment: comment },
      },
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Отклонить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Отклонить заявку федерации</DialogTitle>

          <DialogDescription>
            Федерация не появится на сайте, а представители не смогут создавать мероприятия.
          </DialogDescription>

          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4 pt-4">
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Комментарий для региональной федерации
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
                  Отклонить
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
