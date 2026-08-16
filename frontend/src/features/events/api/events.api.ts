import { request } from '@/shared/api/client'
import {
  eventPageSchema,
  type EventPage,
} from '@/features/events/model/event.schemas'

export const dashboardEventsApi = {
  list: async (perPage = 12): Promise<EventPage> => {
    const query = new URLSearchParams({ per_page: String(perPage) })

    return eventPageSchema.parse(await request(`/me/events?${query}`))
  },
}
