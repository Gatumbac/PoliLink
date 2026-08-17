import { http, HttpResponse, type RequestHandler } from 'msw'

export const handlers: Array<RequestHandler> = [
  http.get('http://localhost:8000/api/auth/me', () =>
    HttpResponse.json(
      { message: 'Unauthenticated.' },
      { status: 401 },
    ),
  ),
]
