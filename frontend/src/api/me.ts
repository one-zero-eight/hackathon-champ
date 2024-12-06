import { $api } from '@/api/index'

export function useMe() {
  return $api.useQuery(
    'get',
    '/users/me',
    {},
    {
      refetchInterval: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  )
}

export function useMyFederation() {
  const { data: me } = useMe()
  return $api.useQuery('get', '/federations/{id}', {
    params: { path: { id: me?.federation ?? '' } },
  }, { enabled: !!me?.federation })
}
