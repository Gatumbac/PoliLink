import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  type OrganizerEventListFilters,
  organizerEventsApi,
} from '@/features/events/api/events.api'
import { organizerQueryKeys } from '@/features/organizer/model/organizer-query-keys'

export {
  useCreateCommunity,
  useManagedCommunities,
  useMyCommunityCreationRequests,
  useSubmitCommunityCreationRequest,
} from '@/features/communities/hooks/use-community-queries'

export function useOrganizerEvents(filters: OrganizerEventListFilters = {}) {
  const page = filters.page ?? 1
  const perPage = filters.perPage ?? 12

  return useQuery({
    queryKey: organizerQueryKeys.events(page, perPage),
    queryFn: () => organizerEventsApi.list({ page, perPage }),
    placeholderData: keepPreviousData,
  })
}
