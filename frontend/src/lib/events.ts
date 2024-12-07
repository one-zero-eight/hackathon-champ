import type { Event, EventStatus } from './types'

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
