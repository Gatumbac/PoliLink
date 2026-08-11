# Fases de API necesarias para el frontend de PoliLink

**Estado:** hoja de ruta.  
**Propósito:** alinear las pantallas React con las APIs Laravel sin exponer
CRUD genérico para tablas internas.

## Regla de diseño

Una tabla no implica una API CRUD. Se exponen acciones que existen en la
experiencia de usuario. Roles, estados y relaciones de responsabilidad son
parte de la seguridad y de las reglas internas, no pantallas administrables.

No existe panel administrativo: el producto tiene catálogo público, cuenta de
estudiante y panel de organizador para sus propias comunidades y eventos. No
hay aprobación administrativa de publicaciones.

## Estado actual

- Implementado: esquema, modelos, seeders, catálogo, autenticación local,
  onboarding y gestión autenticada de eventos.
- Pendiente: inscripciones.
- La autenticación institucional está fuera de alcance. La autenticación local
  de esta hoja de ruta requiere aprobación antes de implementarse.

## Fase 1 — Descubrimiento público y datos de formularios

**Pantallas:** catálogo, detalle y formulario de evento.

| Método | Ruta | Estado | Uso en frontend |
| --- | --- | --- | --- |
| `GET` | `/api/events` | Hecho | Catálogo, búsqueda, filtros y paginación. |
| `GET` | `/api/events/{event}` | Hecho | Detalle público de un evento publicado. |
| `GET` | `/api/event-categories` | Hecho | Filtro y selector de categoría. |
| `GET` | `/api/event-modalities` | Hecho | Filtro y selector de modalidad. |
| `GET` | `/api/locations` | Hecho | Selector de ubicación. |
| `GET` | `/api/communities` | Hecho | Filtro por comunidad y visualización. |

Los cuatro catálogos son de solo lectura, ordenados por nombre, y devuelven
`id`, `code` cuando exista y `name`. No se crean rutas para modificarlos desde
la interfaz.

## Fase 2 — Flujos de Avance 1 con identidad temporal

**Pantallas:** formulario de evento, panel de organizador, detalle con botón
de inscripción, mis inscripciones y panel de inscritos.

| Método | Ruta | Responsable | Uso |
| --- | --- | --- | --- |
| `GET` | `/api/organizers/{organizer}/communities` | Gabriel | Retirada — sustituida por `/api/me/communities`. |
| `GET` | `/api/organizers/{organizer}/events` | Gabriel | Retirada — sustituida por `/api/me/events`. |
| `POST` | `/api/events` | Gabriel | Hecho — crear evento desde sesión autenticada. |
| `PATCH` | `/api/events/{event}` | Gabriel | Hecho — editar evento propio desde sesión autenticada. |
| `PATCH` | `/api/events/{event}/cancel` | Gabriel | Hecho — cancelar evento propio desde sesión autenticada. |
| `POST` | `/api/events/{event}/registrations` | Darwin | Pendiente — inscribir o reactivar con Sanctum. |
| `DELETE` | `/api/events/{event}/registrations` | Darwin | Pendiente — cancelar inscripción activa con Sanctum. |
| `GET` | `/api/events/{event}/registrations` | Darwin | Pendiente — inscritos y cupos para el organizador autenticado. |
| `GET` | `/api/me/registrations` | Darwin | Pendiente — pantalla de mis inscripciones activas. |

Las rutas de esta fase permiten cumplir el primer avance usando los usuarios de
prueba. No deben recibir roles, estados o IDs de relaciones internas desde la
interfaz.

## Fase 3 — Autenticación local — Hecho

**Pantallas:** registro, inicio de sesión y sesión persistente.

La implementación usa autenticación local con Laravel Sanctum en modo cookie
para la SPA React. No es integración institucional. Antes de `register` o
`login`, React obtiene la cookie CSRF de Sanctum.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/sanctum/csrf-cookie` | Hecho — preparar cookie CSRF para la SPA. |
| `POST` | `/api/auth/register` | Hecho — crea un usuario local y le asigna solamente el rol `student`. |
| `POST` | `/api/auth/login` | Hecho — inicia sesión local con email y contraseña. |
| `DELETE` | `/api/auth/logout` | Hecho — cierra la sesión actual. |
| `GET` | `/api/auth/me` | Hecho — devuelve usuario, roles y contexto de sesión. |

No se recibe `role_id` en el registro. Un usuario nuevo inicia como estudiante
para impedir que se otorgue privilegios de organizador desde el navegador.

## Fase 4 — Onboarding de comunidades y organizadores — Hecho

**Pantallas:** crear comunidad, selector de comunidades y panel de organizador.

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/communities` | Hecho — el usuario autenticado crea una comunidad, recibe rol `organizer` y relación `community_organizers` en una transacción. |
| `GET` | `/api/me/communities` | Hecho — comunidades que administra el usuario autenticado. |
| `GET` | `/api/me/events` | Hecho — eventos propios, incluidos los cancelados, para el panel. |

No se requiere API para modificar roles ni para administrar organizadores de
otra comunidad. Un estudiante sin comunidades recibe listas vacías para que la
interfaz pueda mostrar onboarding. Tampoco se requiere editar o eliminar
comunidades mientras no exista una pantalla y requisito concreto para ello.

## Fase 5 — Reemplazo de identidad temporal y flujos finales — Parcial

**Pantallas:** todas las anteriores conectadas a sesión real.

Los eventos ya eliminan `organizer_id` y toman el actor desde la sesión. La
adaptación de inscripciones permanece pendiente de la implementación de Darwin.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/me/registrations` | Pendiente Darwin — mis inscripciones activas. |
| `POST` | `/api/events/{event}/registrations` | Pendiente Darwin — inscripción del estudiante autenticado. |
| `DELETE` | `/api/events/{event}/registrations` | Pendiente Darwin — cancelación de la inscripción propia. |
| `GET` | `/api/events/{event}/registrations` | Pendiente Darwin — lista de inscritos y cupos para el organizador responsable. |
| `POST` | `/api/events` | Hecho — crear desde el organizador autenticado. |
| `PATCH` | `/api/events/{event}` | Hecho — editar evento propio autenticado. |
| `PATCH` | `/api/events/{event}/cancel` | Hecho — cancelar evento propio autenticado. |

Las políticas siguen validando rol, propiedad y comunidad responsable; la
autenticación solo sustituye la identidad temporal.

## Fase 6 — Integración y entrega

1. React consume los recursos anteriores y maneja carga, vacío, error y
   respuestas `401`, `403`, `404`, `409` y `422`.
2. Se prueban los recorridos: catálogo, detalle, registro/login, creación de
   comunidad, creación/edición/cancelación, inscripción/cancelación, mis
   inscripciones y lista de inscritos.
3. Se actualizan README, contrato de API, Bitácora, capturas y la sección
   Implementación/Backend de la propuesta.

## APIs que no se exponen como CRUD

| Tabla | Motivo |
| --- | --- |
| `roles`, `role_user` | El servidor asigna roles; el cliente nunca concede permisos. |
| `community_organizers` | Se crea internamente al crear una comunidad y controla propiedad. |
| `event_statuses`, `registration_statuses` | El servidor aplica transiciones válidas de estado. |
| `users` | Se accede mediante `auth/me`; no hay directorio ni administración pública de usuarios. |

## Secuencia recomendada

```text
Fase 1 ──> Fase 2 ──> evidencia de Avance 1
                    │
                    └──> Fase 3 ──> Fase 4 ──> Fase 5 ──> Fase 6
```

## Referencias

- `docs/CONTEXT/PROJECT_CONTEXT.md`
- `docs/PLAN_PRIMER_AVANCE.md`
- `docs/API.md`
- `docs/backend/DARWIN_REGISTRATIONS_HANDOFF.md`
- [Laravel Sanctum](https://laravel.com/docs/13.x/sanctum)
