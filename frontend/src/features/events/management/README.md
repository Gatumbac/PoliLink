# Event management

The organizer API contract is now available in
`src/features/events/api/events.api.ts`. The typed `organizerEventsApi` surface
supports:

- `list()` through `GET /me/events`.
- `create()` through multipart `POST /events`, with an optional `image` file.
- `update()` through JSON `PATCH /events/{event}`.
- `uploadImage()` through multipart `POST /events/{event}/image`.
- `removeImage()` through `DELETE /events/{event}/image`.

The shared HTTP client preserves Sanctum cookies and CSRF handling for both JSON
and `FormData` requests. It must not set `Content-Type` manually for
`FormData`, so the browser can provide the multipart boundary.

Event responses expose `image_url`, which is nullable for existing events
without a cover image. Organizer forms, previews, image rendering, and query
cache orchestration remain pending for the UI integration phase.
