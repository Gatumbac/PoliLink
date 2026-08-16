import { request } from '@/shared/api/client'
import {
  eventCategoryCollectionSchema,
  eventCommunityCollectionSchema,
  eventEnvelopeSchema,
  eventLocationCollectionSchema,
  eventModalityCollectionSchema,
  eventPageSchema,
  type Event,
  type EventCategory,
  type EventCommunity,
  type EventLocation,
  type EventModality,
  type EventPage,
} from '@/features/events/model/event.schemas'

export type PublicEventFilters = {
  search?: string
  date?: string
  category?: string
  modality?: string
  communityId?: number
  page?: number
  perPage?: number
}

function appendQueryValue(
  query: URLSearchParams,
  key: string,
  value: string | number | undefined,
): void {
  if (value !== undefined && String(value).length > 0) {
    query.set(key, String(value))
  }
}

export const publicEventsApi = {
  list: async (filters: PublicEventFilters = {}): Promise<EventPage> => {
    const query = new URLSearchParams()

    appendQueryValue(query, 'search', filters.search?.trim())
    appendQueryValue(query, 'date', filters.date)
    appendQueryValue(query, 'category', filters.category)
    appendQueryValue(query, 'modality', filters.modality)
    appendQueryValue(query, 'community_id', filters.communityId)
    appendQueryValue(query, 'page', filters.page)
    appendQueryValue(query, 'per_page', filters.perPage)

    return eventPageSchema.parse(
      await request(`/events?${query.toString()}`),
    )
  },

  detail: async (eventId: number): Promise<Event> => {
    const payload = await request(`/events/${eventId}`)

    return eventEnvelopeSchema.parse(payload).data
  },

  categories: async (): Promise<EventCategory[]> => {
    const payload = await request('/event-categories')

    return eventCategoryCollectionSchema.parse(payload).data
  },

  modalities: async (): Promise<EventModality[]> => {
    const payload = await request('/event-modalities')

    return eventModalityCollectionSchema.parse(payload).data
  },

  locations: async (): Promise<EventLocation[]> => {
    const payload = await request('/locations')

    return eventLocationCollectionSchema.parse(payload).data
  },

  communities: async (): Promise<EventCommunity[]> => {
    const payload = await request('/communities')

    return eventCommunityCollectionSchema.parse(payload).data
  },
}

export const dashboardEventsApi = {
  list: async (perPage = 12): Promise<EventPage> => {
    const query = new URLSearchParams({ per_page: String(perPage) })

    return eventPageSchema.parse(await request(`/me/events?${query}`))
  },
}
