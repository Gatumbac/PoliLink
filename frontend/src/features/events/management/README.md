# Organizer management

The backend contract for the organizer experience is documented canonically in
`docs/api/API.md`. The frontend must use the authenticated user session and
must not send user, role, or ownership identifiers.

## Communities and dashboard

The organizer dashboard now consumes:

- `POST /communities` to create a community. It accepts `name` and an optional
  `description`, returns `201`, and promotes the authenticated user to
  organizer in the same transaction.
- `GET /me/communities` to load managed communities. It returns `{ data: [] }`
  when the user has none.
- `GET /me/events?page=1&per_page=12` to load the organizer’s events. It is
  paginated, includes cancelled events, and returns the shared event resource.
  `per_page` accepts `1` through `50`.

These endpoints are protected by Sanctum. A `401` means the session is absent;
`403` means the user lacks the required role or ownership; validation errors
are `422` with Laravel’s field-level `errors` object.

Students can access `/organizador` to complete onboarding. Organizers see the
same dashboard with their managed communities and a “Nueva comunidad” dialog.
Community editing and deletion are not available in the backend contract.

## Events

The typed `organizerEventsApi` surface in
`src/features/events/api/events.api.ts` supports:

- `list()` through `GET /me/events`.
- `create()` through multipart `POST /events`, with an optional `image` file.
- `update()` through JSON `PATCH /events/{event}`.
- `uploadImage()` through multipart `POST /events/{event}/image`.
- `removeImage()` through `DELETE /events/{event}/image`.

The shared HTTP client preserves Sanctum cookies and CSRF handling for both JSON
and `FormData` requests. It must not set `Content-Type` manually for
`FormData`, so the browser can provide the multipart boundary.

Event responses expose `image_url`, which is nullable for existing events
without a cover image. Cancelled events remain visible in the dashboard but
cannot be edited, cancelled again, or have their image changed; those writes
return `409`. Form components, previews, image rendering, and query-cache
orchestration remain pending for the UI integration phase.
