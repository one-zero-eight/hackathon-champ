import type {
  SchemaEvent,
  SchemaEventLocation,
  SchemaFederation,
  SchemaFilters,
  SchemaSort,
} from '@/api/types'

export type Filters = SchemaFilters
export type Sort = SchemaSort
export type Location = SchemaEventLocation
export type Federation = SchemaFederation
export type FederationStatus = Federation['status']
export type Event = SchemaEvent
export type EventStatus = Event['status']
