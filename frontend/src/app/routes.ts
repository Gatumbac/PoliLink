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
  legacyOrganizer: '/organizador',
  uiPreview: '/vista-previa',
} as const

export const appRoutePatterns = {
  eventDetail: 'eventos/:eventId',
} as const

export type AuthRoute = typeof appRoutes.login | typeof appRoutes.register
