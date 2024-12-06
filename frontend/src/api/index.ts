import type * as apiTypes from './types'
import createFetchClient from 'openapi-fetch'
import createQueryClient from 'openapi-react-query'

export type { apiTypes }

export const apiFetch = createFetchClient<apiTypes.paths>({
  baseUrl: '/api',
  credentials: 'include',
})
export const $api = createQueryClient(apiFetch)
