import { z } from 'zod'

export const communitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
})

export const communityEnvelopeSchema = z.object({
  data: communitySchema,
})

export const communityListEnvelopeSchema = z.object({
  data: z.array(communitySchema),
})

export const communityCreatePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
})

export type Community = z.infer<typeof communitySchema>
export type CommunityCreatePayload = z.infer<
  typeof communityCreatePayloadSchema
>
