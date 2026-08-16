import { z } from 'zod'

export const roleCodeSchema = z.enum(['student', 'organizer'])

const roleSchema = z.object({
  code: roleCodeSchema,
  name: z.string(),
})

export const authUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  email: z.email(),
  roles: z.array(roleSchema),
})

export const authEnvelopeSchema = z.object({
  data: authUserSchema,
})

export const registerPayloadSchema = z
  .object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((payload) => payload.password === payload.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })

export const loginPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type RoleCode = z.infer<typeof roleCodeSchema>
export type RegisterPayload = z.infer<typeof registerPayloadSchema>
export type LoginPayload = z.infer<typeof loginPayloadSchema>
