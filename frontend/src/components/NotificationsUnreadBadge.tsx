import { useNotifications } from '@/hooks/useNotifications'
import { ColoredBadge } from './ColoredBadge'
import { Skeleton } from './ui/skeleton'

export function NotificationsUnreadBadge({ type }: { type: 'admin' | 'my-federation' }) {
  const {
    notifications,
    isLoading,
    isRead,
  } = useNotifications(type)

  if (isLoading) {
    return (
      <Skeleton className="h-6 w-8" />
    )
  }

  const unreadCount = notifications
    .filter(notification => !isRead(notification))
    .length

  if (unreadCount === 0)
    return null

  return (
    <ColoredBadge color="blue">
      {unreadCount}
    </ColoredBadge>
  )
}
