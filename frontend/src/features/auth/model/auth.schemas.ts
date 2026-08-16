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

export const espolEmailSchema = z
  .email('Ingresa un correo electrónico válido.')
  .refine((email) => /^[^@\s]+@espol\.edu\.ec$/i.test(email), {
    message: 'Debes usar un correo terminado en @espol.edu.ec.',
  })

export const registerPayloadSchema = z
  .object({
    first_name: z.string().min(1, 'Ingresa tus nombres.'),
    last_name: z.string().min(1, 'Ingresa tus apellidos.'),
    email: espolEmailSchema,
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    password_confirmation: z
      .string()
      .min(8, 'La confirmación debe tener al menos 8 caracteres.'),
  })
  .refine((payload) => payload.password === payload.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })

export const loginPayloadSchema = z.object({
  email: espolEmailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

export type AuthUser = z.infer<typeof authUserSchema>
export type RoleCode = z.infer<typeof roleCodeSchema>
export type RegisterPayload = z.infer<typeof registerPayloadSchema>
export type LoginPayload = z.infer<typeof loginPayloadSchema>
