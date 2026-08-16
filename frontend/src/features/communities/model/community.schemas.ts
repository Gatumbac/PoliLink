import { z } from 'zod'

export const communitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().trim().nullable(),
})

export const communityEnvelopeSchema = z.object({
  data: communitySchema,
})

export const communityListEnvelopeSchema = z.object({
  data: z.array(communitySchema),
})

export const communityCreatePayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Ingresa el nombre de la comunidad.')
    .max(255, 'El nombre no puede superar los 255 caracteres.'),
  description: z.string().trim().nullable().optional(),
})

export type Community = z.infer<typeof communitySchema>
export type CommunityCreatePayload = z.infer<
  typeof communityCreatePayloadSchema
>
