import { cn } from '@/lib/utils'
import BadgeAlert from '~icons/lucide/badge-alert'
import BadgeCheck from '~icons/lucide/badge-check'
import BadgeX from '~icons/lucide/badge-x'
import Pencil from '~icons/lucide/pencil'

const STATUS_ICONS = {
  draft: Pencil,
  on_consideration: BadgeAlert,
  accredited: BadgeCheck,
  rejected: BadgeX,
} as const

export function StatusIcon({
  status,
  className,
}: {
  status: keyof typeof STATUS_ICONS
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
