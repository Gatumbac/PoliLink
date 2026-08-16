import { z } from 'zod'

const eventCategorySchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
})

const eventLocationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
})

const eventCommunitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
})

const eventStatusSchema = z.object({
  code: z.string(),
  name: z.string(),
})

export const eventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  starts_at: z.string().nullable(),
  capacity: z.number().int().nonnegative(),
  available_capacity: z.number().int().nonnegative(),
  category: eventCategorySchema.optional(),
  modality: eventCategorySchema.optional(),
  location: eventLocationSchema.optional(),
  community: eventCommunitySchema.nullable().optional(),
  status: eventStatusSchema.optional(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

const paginationMetaSchema = z.object({
  current_page: z.number().int().positive(),
  last_page: z.number().int().positive(),
  per_page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
})

export const eventPageSchema = z.object({
  data: z.array(eventSchema),
  meta: paginationMetaSchema,
})

export type Event = z.infer<typeof eventSchema>
export type EventPage = z.infer<typeof eventPageSchema>
