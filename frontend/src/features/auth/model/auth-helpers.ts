import type { AuthUser, RoleCode } from '@/features/auth/model/auth.schemas'

export function hasRole(user: AuthUser | null, role: RoleCode): boolean {
  return user?.roles.some((assignedRole) => assignedRole.code === role) ?? false
}
