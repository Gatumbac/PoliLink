export const organizerQueryKeys = {
  all: ['organizer'] as const,
  communities: () => [...organizerQueryKeys.all, 'communities'] as const,
  events: (page: number, perPage: number) =>
    [...organizerQueryKeys.all, 'events', { page, perPage }] as const,
}
