export const appRoutes = {
  home: '/',
  login: '/iniciar-sesion',
  register: '/registrarse',
  events: '/eventos',
  eventDetail: (eventId: number | string) => `/eventos/${eventId}`,
  organize: '/organizar',
  createCommunity: '/crear-comunidad',
  communityRequests: '/mis-solicitudes',
  myCommunities: '/mis-comunidades',
  myEvents: '/mis-eventos',
  createEvent: '/crear-evento',
  editEvent: (eventId: number | string) => `/eventos/${eventId}/editar`,
  myRegistrations: '/mis-inscripciones',
  eventAttendees: (eventId: number | string) => `/eventos/${eventId}/inscritos`,
  legacyOrganizer: '/organizador',
  uiPreview: '/vista-previa',
} as const

export const appRoutePatterns = {
  eventDetail: 'eventos/:eventId',
  eventEdit: 'eventos/:eventId/editar',
  eventAttendees: 'eventos/:eventId/inscritos',
} as const

export type AuthRoute = typeof appRoutes.login | typeof appRoutes.register
