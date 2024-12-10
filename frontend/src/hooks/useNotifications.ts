import type { SchemaNotify as INotification } from '@/api/types'
import { $api, apiFetch } from '@/api'
import { useMe } from '@/hooks/useMe'
import { useCallback, useEffect, useMemo } from 'react'

export function useNotifications(type: 'admin' | 'my-federation') {
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

  // Log errors
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

  const isRead = useCallback((notification: INotification) => {
    return me?.id ? notification.read_by.includes(me.id) : false
  }, [me?.id])

  const isLoading = meLoading
    || (adminEnabled && adminNotificationsLoading)
    || (myFederationEnabled && myFederationNotificationsLoading)

  const error = meError ?? (adminEnabled && adminNotificationsError) ?? (myFederationEnabled && myFederationNotificationsError)

  const notifications = useMemo(() => (
    (adminEnabled ? adminNotifications : myFederationNotifications) ?? []
  ), [adminEnabled, adminNotifications, myFederationNotifications])

  // Sort notifications by created_at in descending order
  const sortedNotifications = useMemo(() => [...notifications].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ), [notifications])

  const handleRead = useCallback((notificationId: string) => {
    apiFetch
      .PUT('/notify/{notify_id}/read', { params: { path: { notify_id: notificationId } } })
      .finally(() => {
        // Invalidate queries to refresh data
        adminNotificationsRefetch()
        myFederationNotificationsRefetch()
      })
  }, [adminNotificationsRefetch, myFederationNotificationsRefetch])

  return {
    notifications: sortedNotifications,
    isLoading,
    error,
    isRead,
    handleRead,
  }
}
