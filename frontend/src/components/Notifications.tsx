import type { SchemaNotify as INotification } from '@/api/types'
import { $api, apiFetch } from '@/api'
import { useMe } from '@/api/me'
import { cn, labelForDateDiff } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo } from 'react'
import Building from '~icons/lucide/building'
import Calendar from '~icons/lucide/calendar'
import Check from '~icons/lucide/check'
import MessageCircle from '~icons/lucide/message-circle'
import { StatusIcon } from './StatusIcon'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'

export function Notifications({
  type,
}: {
  type: 'admin' | 'my-federation'
}) {
  const {
    data: me,
    isLoading: meLoading,
    error: meError,
  } = useMe()

  const adminEnabled = type === 'admin' && me?.role === 'admin'
  const myFederationEnabled = type === 'my-federation' && !!me?.federation

  const {
    data: adminNotifications,
    isLoading: adminNotificationsLoading,
    error: adminNotificationsError,
    refetch: adminNotificationsRefetch,
  } = $api.useQuery(
    'get',
    '/notify/admin',
    {},
    { enabled: adminEnabled },
  )
  const {
    data: myFederationNotifications,
    isLoading: myFederationNotificationsLoading,
    error: myFederationNotificationsError,
    refetch: myFederationNotificationsRefetch,
  } = $api.useQuery(
    'get',
    '/notify/federation/{federation_id}',
    { params: { path: { federation_id: me?.federation || '' } } },
    { enabled: myFederationEnabled },
  )

  // Log errors.
  useEffect(() => {
    if (meError)
      console.error(meError)
  }, [meError])
  useEffect(() => {
    if (adminNotificationsError)
      console.error(adminNotificationsError)
  }, [adminNotificationsError])
  useEffect(() => {
    if (myFederationNotificationsError)
      console.error(myFederationNotificationsError)
  }, [myFederationNotificationsError])

  const isRead = (notification: INotification) => {
    return me?.id ? notification.read_by.includes(me.id) : false
  }

  const notificationsLoading = (
    meLoading
    || (adminEnabled && adminNotificationsLoading)
    || (myFederationEnabled && myFederationNotificationsLoading)
  )

  const someError = meError ?? (adminEnabled && adminNotificationsError) ?? (myFederationEnabled && myFederationNotificationsError)
  const actualNotifications = useMemo(() => (
    (adminEnabled ? adminNotifications : myFederationNotifications) ?? []
  ), [adminEnabled, adminNotifications, myFederationNotifications])

  // Sort notifications by created_at in descending order (most recent first)
  const sortedNotifications = useMemo(() => [...actualNotifications].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ), [actualNotifications])

  const handleRead = useCallback((notificationId: string) => {
    apiFetch
      .PUT('/notify/{notify_id}/read', { params: { path: { notify_id: notificationId } } })
      .finally(() => {
        // Invalidate queries to refresh data.
        adminNotificationsRefetch()
        myFederationNotificationsRefetch()
      })
  }, [adminNotificationsRefetch, myFederationNotificationsRefetch])

  return (
    <div className="flex grow flex-col">
      {notificationsLoading
        ? (
            Array.from({ length: 3 }).fill(null).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Skeleton key={i} className="my-2 h-10" />
            ))
          )
        : (
            sortedNotifications.length > 0
              ? (
                  sortedNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isRead={isRead(notification)}
                      onRead={handleRead}
                    />
                  ))
                )
              : someError
                ? (
                    <p className="my-auto text-center text-lg text-red-500">
                      Ошибка загрузки уведомлений
                    </p>
                  )
                : (
                    <p className="my-auto text-center text-lg text-neutral-400">
                      Нет уведомлений
                    </p>
                  )
          )}
    </div>
  )
}

function NotificationItem({
  notification,
  isRead,
  onRead,
}: {
  notification: INotification
  isRead: boolean
  onRead: (notificationId: string) => void
}) {
  const navigate = useNavigate()

  const handleClick = useCallback(() => {
    onRead(notification.id)
    switch (notification.inner.notify_type) {
      case 'new_federation':
      case 'accredited_federation':
        navigate({
          to: '/manage/federations/$id',
          params: { id: notification.inner.federation_id },
        })
        break
      case 'new_event':
      case 'accredited_event':
        navigate({
          to: '/manage/events/$id',
          params: { id: notification.inner.event_id },
        })
        break
      case 'new_feedback':
        navigate({
          to: '/manage/feedback/all',
        })
        break
    }
  }, [notification, onRead, navigate])

  return (
    <div className="flex items-start gap-4 py-3 [&:not(:last-child)]:border-b">
      <NotificationIcon
        notification={notification}
        className="size-10 shrink-0"
        withDot={!isRead}
      />

      <div className="group flex h-full grow cursor-pointer flex-col justify-center" onClick={handleClick}>
        <NotificationTitle
          notification={notification}
          isRead={isRead}
          className="group-hover:underline"
        />
        <span className="text-sm text-muted-foreground">
          <span className="inline group-hover:hidden">{labelForDateDiff(new Date(), new Date(notification.created_at))}</span>
          <span className="hidden group-hover:inline">{new Date(notification.created_at).toLocaleString()}</span>
        </span>
      </div>

      {!isRead && (
        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={() => onRead(notification.id)}
        >
          <Check />
        </Button>
      )}
    </div>
  )
}

function NotificationTitle({
  notification,
  className,
  isRead,
}: {
  notification: INotification
  className?: string
  isRead: boolean
}) {
  const federationId = (() => {
    switch (notification.inner.notify_type) {
      case 'new_federation':
      case 'accredited_federation':
        return notification.inner.federation_id
    }
    return ''
  })()

  const { data: federation } = $api.useQuery(
    'get',
    '/federations/{id}',
    { params: { path: { id: federationId } } },
    { enabled: !!federationId },
  )

  const eventId = (() => {
    switch (notification.inner.notify_type) {
      case 'new_event':
      case 'accredited_event':
        return notification.inner.event_id
    }
    return ''
  })()

  const { data: event } = $api.useQuery(
    'get',
    '/events/{id}',
    { params: { path: { id: eventId } } },
    { enabled: !!eventId },
  )
  const inner = (() => {
    switch (notification.inner.notify_type) {
      case 'new_federation':
        return (
          <span className="flex items-center gap-1">
            {'Новая федерация: '}
            {federation?.region || <Skeleton className="h-5 w-[100px]" />}
          </span>
        )
      case 'new_event':
        return (
          <span className="flex items-center gap-1">
            {'Новое событие: '}
            {event?.title || <Skeleton className="h-5 w-[100px]" />}
          </span>
        )
      case 'accredited_federation':
        return (
          <span className="flex items-center gap-1">
            {'Статус федерации изменен: '}
            {federation?.region || <Skeleton className="h-5 w-[100px]" />}
          </span>
        )
      case 'accredited_event':
        return (
          <span className="flex items-center gap-1">
            {'Статус события изменен: '}
            {event?.title || <Skeleton className="h-5 w-[100px]" />}
          </span>
        )
      case 'new_feedback':
        return <span>Новое обращение</span>
    }
  })()

  return (
    <h5 className={cn(
      'text-sm',
      isRead ? 'font-medium' : 'font-bold',
      className,
    )}
    >
      {inner}
    </h5>
  )
}

function NotificationIcon({
  notification,
  className,
  withDot,
}: {
  notification: INotification
  className?: string
  withDot?: boolean
}): React.ReactNode {
  let icon: React.ReactNode
  let color: 'gray' | 'green' | 'yellow' | 'red' | 'blue'
  switch (notification.inner.notify_type) {
    case 'accredited_federation':
    case 'accredited_event':
      icon = <StatusIcon status={notification.inner.status} />
      color = (() => {
        switch (notification.inner.status) {
          case 'draft': return 'gray'
          case 'accredited': return 'green'
          case 'on_consideration': return 'yellow'
          case 'rejected': return 'red'
        }
      })()
      break
    case 'new_federation':
      icon = <Building />
      color = 'blue'
      break
    case 'new_event':
      icon = <Calendar />
      color = 'blue'
      break
    case 'new_feedback':
      icon = <MessageCircle />
      color = 'blue'
      break
  }

  return (
    <div className={cn(
      'inline-flex p-1 items-center justify-center rounded relative',
      color === 'gray' && 'bg-gray-100 text-gray-500',
      color === 'green' && 'bg-green-100 text-green-500',
      color === 'yellow' && 'bg-yellow-100 text-yellow-500',
      color === 'red' && 'bg-red-100 text-red-500',
      color === 'blue' && 'bg-blue-100 text-blue-500',
      className,
    )}
    >
      {icon}
      {withDot && <div className="absolute right-0 top-0 size-[12px] translate-x-[40%] translate-y-[-40%] rounded-full border-2 border-white bg-blue-500" />}
    </div>
  )
}
