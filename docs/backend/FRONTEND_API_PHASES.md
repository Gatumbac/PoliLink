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

- Implementado: esquema, modelos, seeders y rutas de catálogo/detalle/gestión
  de eventos con identidad temporal `organizer_id`.
- Pendiente: inscripciones y autenticación local.
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
| `GET` | `/api/organizers/{organizer}/communities` | Gabriel | Hecho — comunidades administradas para el selector del formulario. |
| `GET` | `/api/organizers/{organizer}/events` | Gabriel | Hecho — panel del organizador, incluidos publicados y cancelados propios. |
| `POST` | `/api/events` | Gabriel | Hecho — crear evento con `organizer_id` temporal. |
| `PATCH` | `/api/events/{event}` | Gabriel | Hecho — editar evento propio. |
| `PATCH` | `/api/events/{event}/cancel` | Gabriel | Hecho — cancelar evento propio. |
| `POST` | `/api/events/{event}/registrations` | Darwin | Pendiente — inscribir o reactivar con `student_id` temporal. |
| `DELETE` | `/api/events/{event}/registrations` | Darwin | Pendiente — cancelar inscripción activa. |
| `GET` | `/api/events/{event}/registrations?organizer_id={id}` | Darwin | Pendiente — inscritos activos y cupos para el responsable. |
| `GET` | `/api/students/{student}/registrations` | Darwin | Pendiente — pantalla de mis inscripciones activas. |

Las rutas de esta fase permiten cumplir el primer avance usando los usuarios de
prueba. No deben recibir roles, estados o IDs de relaciones internas desde la
interfaz.

## Fase 3 — Autenticación local

**Pantallas:** registro, inicio de sesión y sesión persistente.

La implementación recomendada es autenticación local con Laravel Sanctum en
modo cookie para la SPA React. No es integración institucional. Antes de
`register` o `login`, React obtiene la cookie CSRF de Sanctum.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/sanctum/csrf-cookie` | Preparar cookie CSRF para la SPA. |
| `POST` | `/api/auth/register` | Crea un usuario local y le asigna solamente el rol `student`. |
| `POST` | `/api/auth/login` | Inicia sesión local con email y contraseña. |
| `DELETE` | `/api/auth/logout` | Cierra la sesión actual. |
| `GET` | `/api/auth/me` | Devuelve usuario, roles y contexto de sesión. |

No se recibe `role_id` en el registro. Un usuario nuevo inicia como estudiante
para impedir que se otorgue privilegios de organizador desde el navegador.

## Fase 4 — Onboarding de comunidades y organizadores

**Pantallas:** crear comunidad, selector de comunidades y panel de organizador.

| Método | Ruta | Uso |
| --- | --- | --- |
| `POST` | `/api/communities` | El usuario autenticado crea una comunidad; se le asigna rol `organizer` y relación `community_organizers` en la misma transacción. |
| `GET` | `/api/me/communities` | Comunidades que administra el usuario autenticado. |
| `GET` | `/api/me/events` | Eventos propios, incluidos los cancelados, para el panel. |

No se requiere API para modificar roles ni para administrar organizadores de
otra comunidad. Tampoco se requiere editar o eliminar comunidades mientras no
exista una pantalla y requisito concreto para ello.

## Fase 5 — Reemplazo de identidad temporal y flujos finales

**Pantallas:** todas las anteriores conectadas a sesión real.

Después de Fase 3, eliminar `organizer_id` y `student_id` de cuerpos y query
strings. El backend toma el actor desde la sesión autenticada.

| Método | Ruta | Uso |
| --- | --- | --- |
| `GET` | `/api/me/registrations` | Mis inscripciones activas. |
| `POST` | `/api/events/{event}/registrations` | Inscripción del estudiante autenticado. |
| `DELETE` | `/api/events/{event}/registrations` | Cancelación de la inscripción propia. |
| `GET` | `/api/events/{event}/registrations` | Lista de inscritos y cupos para el organizador responsable. |
| `POST` | `/api/events` | Crear desde el organizador autenticado. |
| `PATCH` | `/api/events/{event}` | Editar evento propio autenticado. |
| `PATCH` | `/api/events/{event}/cancel` | Cancelar evento propio autenticado. |

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
