import type { Filters } from '@/lib/types.ts'
import { $api } from '@/api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { Input } from '@/components/ui/input.tsx'
import { useEffect } from 'react'
import Link from '~icons/lucide/link'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

export function ExportFiltersToCalDialog({
  open,
  setOpen,
  filters,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  filters: Filters | undefined
}) {
  const { mutate, data } = $api.useMutation('post', '/events/search/share')
  const url = data?.id
    ? `${window.location.origin}/api/events/search/share/${data.id}/.ics`
    : null

  useEffect(() => {
    if (!filters)
      return
    if (open) {
      mutate({
        body: { filters, sort: {} },
      })
    }
  }, [filters, mutate, open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Экспорт в приложение календаря</DialogTitle>

          <DialogDescription>
            Вы можете добавить все события из данной подборки по фильтрам в свой
            календарь (например, Яндекс Календарь, Google Календарь или Apple
            Календарь).
          </DialogDescription>

          <div className="flex flex-col gap-4 pt-4">
            <p className="text-sm text-muted-foreground">
              При обновлениях мероприятий в подборке, они также будут обновляться
              в вашем календаре.
            </p>

            <p className="text-sm text-muted-foreground">Скопируйте ссылку ниже:</p>

            <Input
              readOnly
              value={url ?? ''}
              className="px-2 text-sm text-gray-600"
              onFocus={e => e.currentTarget?.select?.()}
              onClick={e => e.currentTarget?.select?.()}
              onDoubleClick={e => e.currentTarget?.select?.()}
              onSelect={e => e.currentTarget?.select?.()}
            />

            <p className="text-sm text-muted-foreground">
              В приложении своего календаря укажите подписку на эту ссылку:
            </p>

            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
              >
                <a
                  href="https://calendar.yandex.ru/week?sidebar=addFeed"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Link />
                  Яндекс Календарь
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <a
                  href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Link />
                  Google Календарь
                </a>
              </Button>
            </div>

            <Separator />

            <DialogFooter>
              <p className="text-sm text-muted-foreground">
                Поздравляем! Теперь вы будете видеть все события из подборки в своём
                календаре и получать уведомления о них.
              </p>
            </DialogFooter>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
