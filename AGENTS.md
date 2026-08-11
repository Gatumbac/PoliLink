# PoliLink repository guide

## Project context

PoliLink is a Lenguajes de Programación project about the centralized
management and publication of ESPOL community events. Read
`docs/CONTEXT/PROJECT_CONTEXT.md` before changing the proposal or implementing
features related to its scope. `docs/CONTEXT/main.tex` is the complete proposal
source.

## Scope that must remain unchanged

- Organizers publish, edit, and cancel events directly; there is no
  administrative approval flow.
- Students discover/filter events, register, and cancel their registration to
  release a place.
- Keep the event fields and work assignments specified in
  `docs/CONTEXT/PROJECT_CONTEXT.md`.
- Do not add institutional integrations or authentication, payments, email or
  calendar integration, QR codes, or attendance validation without explicit
  approval.

## Repository layout

- `backend/`: Laravel API.
- `frontend/`: React and TypeScript interface.
- `docs/`: technical documentation and development log.
- `docs/CONTEXT/`: approved academic context and LaTeX proposal.

Consult the relevant README before working in `backend/` or `frontend/`. Keep
application code, API documentation, and the academic proposal consistent, but
do not broaden the requested change just to make related documents match.

## Local development environment

- The default workflow runs Laravel and React on the host machine; Docker
  Compose runs only the `mysql` service.
- Host Laravel connects to the published database with `DB_HOST=127.0.0.1`,
  `DB_PORT=3306`, `DB_DATABASE=polilink`, `DB_USERNAME=polilink`, and
  `DB_PASSWORD=polilink`. The hostname `mysql` is only valid from another
  Docker container.
- Humans must start, stop, restart, and manage every server or container,
  including MySQL, Laravel, Vite, and Docker Compose. Agents may document the
  required commands and inspect explicitly provided logs, but must never run
  those lifecycle commands themselves.
- Do not run builds, tests, or validation commands unless the user explicitly
  requests that action.

## Working on the LaTeX proposal

- Preserve the existing title, authors, course, formal Spanish writing style,
  and monochrome cover. Do not add external logos or colors.
- Keep the architecture diagram to its four compact nodes, with no labels on
  arrows.
- Keep citations valid when making factual changes.
- Do not compile LaTeX or run other validation/build commands unless the user
  explicitly requests it.

## Change discipline

- State clearly when a detail is planned rather than implemented.
- Check `git status --short` before handoff and preserve unrelated changes.
