import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/features/auth/auth-context'
import {
  communityApi,
  dashboardCommunitiesApi,
} from '@/features/communities/api/communities.api'
import type { CommunityCreatePayload } from '@/features/communities/model/community.schemas'
import { organizerQueryKeys } from '@/features/organizer/model/organizer-query-keys'

export function useManagedCommunities() {
  return useQuery({
    queryKey: organizerQueryKeys.communities(),
    queryFn: dashboardCommunitiesApi.list,
  })
}

export function useCreateCommunity() {
  const queryClient = useQueryClient()
  const { refresh } = useAuth()

  return useMutation({
    mutationFn: (payload: CommunityCreatePayload) =>
      communityApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizerQueryKeys.communities(),
        }),
        refresh(),
      ])
    },
  })
}
