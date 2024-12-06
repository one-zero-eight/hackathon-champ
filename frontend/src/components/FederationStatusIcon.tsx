import type { Federation } from '@/lib/types'
import { cn } from '@/lib/utils'
import BadgeAlert from '~icons/lucide/badge-alert'
import BadgeCheck from '~icons/lucide/badge-check'
import BadgeX from '~icons/lucide/badge-x'

const STATUS_ICONS = {
  on_consideration: BadgeAlert,
  accredited: BadgeCheck,
  rejected: BadgeX,
}

export function FederationStatusIcon({
  status,
  className,
}: {
  status: Federation['status']
  className?: string
}) {
  const Icon = STATUS_ICONS[status]
  return (
    <Icon
      className={cn(
        status === 'on_consideration' && 'text-yellow-500',
        status === 'accredited' && 'text-green-500',
        status === 'rejected' && 'text-red-500',
        className,
      )}
    />
  )
}
