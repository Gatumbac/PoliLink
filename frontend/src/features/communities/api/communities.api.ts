import { request } from '@/shared/api/client'
import {
  communityCreatePayloadSchema,
  communityEnvelopeSchema,
  communityListEnvelopeSchema,
  type Community,
  type CommunityCreatePayload,
} from '@/features/communities/model/community.schemas'

export const communityApi = {
  create: async (payload: CommunityCreatePayload): Promise<Community> => {
    const validatedPayload = communityCreatePayloadSchema.parse(payload)

    return communityEnvelopeSchema.parse(
      await request('/communities', {
        method: 'POST',
        body: validatedPayload,
      }),
    ).data
  },
}

export const dashboardCommunitiesApi = {
  list: async (): Promise<Community[]> =>
    communityListEnvelopeSchema.parse(await request('/me/communities')).data,
}
