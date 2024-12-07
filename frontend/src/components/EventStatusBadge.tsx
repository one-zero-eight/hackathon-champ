import type { EventStatus, FederationStatus } from '@/lib/types'
import { getStatusText } from '@/lib/utils'
import { ColoredBadge } from './ColoredBadge'

type StatusEnum = EventStatus | FederationStatus

const STATUS_COLOR: Record<StatusEnum, 'gray' | 'blue' | 'green' | 'red'> = {
  draft: 'gray',
  on_consideration: 'blue',
  accredited: 'green',
  rejected: 'red',
}

export function EventStatusBadge({
  status,
  className,
}: {
  status: StatusEnum
  className?: string
}) {
  return (
    <ColoredBadge color={STATUS_COLOR[status]} className={className}>
      {getStatusText(status)}
    </ColoredBadge>
  )
}
