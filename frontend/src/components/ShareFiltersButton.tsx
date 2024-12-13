import type { SchemaSort } from '@/api/types'
import type { Filters } from '@/lib/types'
import { $api } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'

export function ShareFiltersButton({
  open,
  setOpen,
  filters,
  sort,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  filters: Filters | undefined
  sort: SchemaSort | undefined | null
}) {
  const { mutate, data } = $api.useMutation('post', '/events/search/share')

  const url = data?.id
    ? `${window.location.origin}/search?share=${data.id}`
    : null

  useEffect(() => {
    if (open) {
      mutate({
        body: { filters: filters || {}, sort },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Поделиться подборкой</DialogTitle>
          <DialogDescription>
            Ваша ссылка на текущую подборку:
          </DialogDescription>
          <Input
            readOnly
            value={url ?? ''}
            className="px-2 text-sm text-gray-600"
            onFocus={e => e.currentTarget?.select?.()}
            onClick={e => e.currentTarget?.select?.()}
            onDoubleClick={e => e.currentTarget?.select?.()}
            onSelect={e => e.currentTarget?.select?.()}
          />
          <DialogDescription>
            Отправьте её своим друзьям, чтобы поделиться текущей подборкой.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
