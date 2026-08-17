export const organizerQueryKeys = {
  all: ['organizer'] as const,
  communities: () => [...organizerQueryKeys.all, 'communities'] as const,
  events: () => [...organizerQueryKeys.all, 'events'] as const,
}
