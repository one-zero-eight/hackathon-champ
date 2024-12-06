import type { EventStatus } from '@/lib/types'
import { ColoredBadge } from './ColoredBadge'

const STATUS_TEXT: Record<EventStatus, string> = {
  draft: 'Черновик',
  on_consideration: 'На рассмотрении',
  accredited: 'Аккредитовано',
  rejected: 'Отклонено',
}

const STATUS_COLOR: Record<EventStatus, 'gray' | 'blue' | 'green' | 'red'> = {
  draft: 'gray',
  on_consideration: 'blue',
  accredited: 'green',
  rejected: 'red',
}

export function EventStatusBadge({
  status,
  className,
}: {
  status: EventStatus
  className?: string
}) {
  return (
    <ColoredBadge color={STATUS_COLOR[status]} className={className}>
      {STATUS_TEXT[status]}
    </ColoredBadge>
  )
}
