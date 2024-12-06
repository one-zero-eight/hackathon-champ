import type { EventStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'

const STATUS_TEXT: Record<EventStatus, string> = {
  draft: 'Черновик',
  on_consideration: 'На рассмотрении',
  accredited: 'Аккредитовано',
  rejected: 'Отклонено',
}

export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus
  className?: string
}) {
  return (
    <Badge
      className={cn(
        'font-medium',
        status === 'draft' && 'bg-stone-100 text-stone-700 hover:bg-stone-100',
        status === 'on_consideration' && 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        status === 'accredited' && 'bg-green-100 text-green-700 hover:bg-green-100',
        status === 'rejected' && 'bg-red-100 text-red-700 hover:bg-red-100',
        className,
      )}
      variant="secondary"
    >
      {STATUS_TEXT[status]}
    </Badge>
  )
}
