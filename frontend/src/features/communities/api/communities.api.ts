import {
  type Community,
  type CommunityCreatePayload,
  communityCreatePayloadSchema,
  communityEnvelopeSchema,
  communityListEnvelopeSchema,
} from '@/features/communities/model/community.schemas'
import { request } from '@/shared/api/client'

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
