import type { Event, EventStatus, Federation, FederationStatus } from './types'

// Colors //
export const COLOR_NEUTRAL = '#6b7280'
export const COLOR_INFO = '#0ea5e9'
export const COLOR_SUCCESS = '#22c55e'
export const COLOR_WARNING = '#eab308'
export const COLOR_DESTRUCTIVE = '#ef4444'
////////////

export function participantsAverage(events: Event[]) {
  if (events.length === 0)
    return Number.NaN

  const participantsTotal = events.reduce((acc, event) => acc + (event.participant_count || 0), 0)
  return Math.round(participantsTotal / events.length)
}

export function eventsByStatus(events: Event[]) {
  return events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1
    return acc
  }, {} as Record<EventStatus, number>)
}

export function federationsByStatus(
  federations: Federation[],
): Record<FederationStatus, number> {
  return federations.reduce((acc, federation) => {
    acc[federation.status] = (acc[federation.status] || 0) + 1
    return acc
  }, {} as Record<FederationStatus, number>)
}
