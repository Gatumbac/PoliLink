# Plan: Esquema relacional normalizado para PoliLink

**Fecha:** 2026-08-10  
**Estado:** En progreso  
**Contexto:** El backend Laravel conserva únicamente sus tablas base. Se debe
definir primero un modelo relacional para eventos e inscripciones, sin JSON ni
tipos `ENUM`, antes de crear migraciones.

## Objetivos

- [x] Extraer las reglas y límites del dominio desde el contexto, el contrato
  de API y el plan del primer avance.
- [x] Proponer un modelo hasta tercera forma normal (3FN).
- [x] Definir claves, cardinalidades, restricciones e índices requeridos.
- [ ] Acordar el diseño con el equipo antes de crear migraciones.
- [ ] Implementar migraciones, modelos, seeders y pruebas en `backend/`.

## Esquema propuesto

### Usuarios y roles

| Tabla | Columnas principales | Restricciones |
| --- | --- | --- |
| `users` | `id`, `first_name`, `last_name`, `email`, `password`, marcas de tiempo de Laravel | `email` único. Se reutiliza la tabla base; no se agrega una columna `role`. |
| `roles` | `id`, `code`, `name` | `code` y `name` únicos. Semillas: `student`, `organizer`. |
| `role_user` | `user_id`, `role_id` | PK compuesta (`user_id`, `role_id`); ambas columnas son FK. Representa una relación N:M. |

### Comunidades y responsables

| Tabla | Columnas principales | Restricciones |
| --- | --- | --- |
| `communities` | `id`, `name`, `description`, `created_at`, `updated_at` | `name` único. |
| `community_organizers` | `id`, `community_id`, `user_id`, marcas de tiempo | FK hacia comunidad y usuario; `UNIQUE (community_id, user_id)`. Solo se crean filas para usuarios con rol `organizer`. |

`community_organizers` evita guardar dos hechos redundantes en un evento:
la comunidad y el organizador se obtienen de una única relación responsable.

### Catálogos controlados

| Tabla | Columnas principales | Semillas iniciales |
| --- | --- | --- |
| `event_categories` | `id`, `code`, `name` | `workshop`, `talk`, `hackathon`, `fair`, `cultural`, `sports`. |
| `event_modalities` | `id`, `code`, `name` | `in_person`, `virtual`, `hybrid`. |
| `locations` | `id`, `name`, `description` | Lugares reutilizables, por ejemplo `Aula X`, `Auditorio`, `Google Meet`. |
| `event_statuses` | `id`, `code`, `name` | `published`, `cancelled`. |
| `registration_statuses` | `id`, `code`, `name` | `active`, `cancelled`. |

Cada catálogo tiene `code` y `name` únicos. Los códigos son estables para la
API; los nombres son texto de presentación. No se usan columnas JSON ni
`ENUM` de MySQL.

### Hechos del negocio

| Tabla | Columnas principales | Restricciones |
| --- | --- | --- |
| `events` | `id`, `community_organizer_id`, `event_category_id`, `event_modality_id`, `location_id`, `event_status_id`, `title`, `description`, `starts_at`, `capacity`, marcas de tiempo | Todas las FK son obligatorias y usan `RESTRICT` al borrar. `capacity` es entero sin signo; la validación `min:1` se aplica en Laravel. Un evento no se elimina: se cambia su estado a `cancelled`. |
| `registrations` | `id`, `event_id`, `student_id`, `registration_status_id`, `registered_at`, `cancelled_at`, marcas de tiempo | `UNIQUE (event_id, student_id)`. `student_id` referencia `users`; solo se acepta un usuario con rol `student`. |

Una cancelación actualiza la misma fila de `registrations` a estado
`cancelled`; así se preserva la relación histórica y nunca existen dos
inscripciones para el mismo estudiante y evento. Una reinscripción, si el
equipo decide permitirla, reactiva esa fila dentro de una transacción; no crea
otra.

## Relaciones

```text
users ──< role_user >── roles
users ──< community_organizers >── communities
community_organizers ──< events >── event_categories
                              ├── event_modalities
                              ├── locations
                              └── event_statuses
users (students) ──< registrations >── events
registrations ──> registration_statuses
```

## Reglas y garantías

1. Crear un evento lo deja en `published`; no hay estado de aprobación.
2. La aplicación valida que un `community_organizers.user_id` tenga el rol
   `organizer` y que `registrations.student_id` tenga el rol `student`.
3. La inscripción debe ejecutarse en una transacción: bloquear el evento,
   contar solo registros con estado `active`, comparar contra `capacity` y
   crear o reactivar la inscripción.
4. El catálogo muestra solo eventos `published`; sus cupos disponibles se
   calculan, no se almacenan: `capacity - COUNT(registrations activas)`.
5. No se permite registrar a un estudiante en un evento cancelado, ni editar o
   cancelar un evento de otro organizador.
6. Las FK protegen catálogos y hechos históricos con `RESTRICT`; no se usan
   borrados en cascada para eventos o inscripciones.

## Índices

- `users(email)` único.
- `role_user(user_id, role_id)` PK compuesta y un índice inverso
  `role_user(role_id, user_id)` para consultas por rol.
- `community_organizers(community_id, user_id)` único y un índice inverso por
  `user_id`.
- `events(event_status_id, starts_at)` para catálogo activo ordenado por fecha.
- `events(event_category_id, starts_at)`, `events(event_modality_id, starts_at)`
  y `events(location_id)` para filtros. La FK hacia
  `community_organizer_id` cubre el filtro por comunidad mediante JOIN.
- `registrations(event_id, student_id)` único, y
  `registrations(event_id, registration_status_id)` para cupos e inscritos.
- `registrations(student_id, registration_status_id)` para mis inscripciones.

## Pasos de implementación

1. **Acordar decisiones de producto** — Confirmar si una inscripción cancelada
   puede reactivarse y validar las categorías y lugares semilla.
2. **Migraciones** — Crear migraciones incrementales en `backend/database/migrations/`:
   roles y pivote; comunidades y responsables; catálogos; eventos;
   inscripciones. Agregar claves foráneas e índices; la capacidad positiva se
   valida de forma portable en Laravel.
3. **Modelos Eloquent** — Agregar relaciones y casts de fecha a `User`,
   `Community`, `CommunityOrganizer`, `Event`, `Registration` y modelos de
   catálogo.
4. **Seeders** — Insertar roles, catálogos, dos usuarios de prueba, una
   comunidad, su responsable, un evento e inscripción reproducibles.
5. **Reglas de aplicación** — Implementar validaciones de rol, propiedad,
   estado y una transacción de inscripción segura frente a concurrencia.
6. **Pruebas** — Cubrir FK y unicidad, capacidad, duplicado, cancelación,
   filtros y cálculo de cupos.

## Archivos afectados

- `backend/database/migrations/` — futura estructura y restricciones.
- `backend/app/Models/` — futuras relaciones Eloquent.
- `backend/database/seeders/DatabaseSeeder.php` — datos de desarrollo.
- `backend/app/Http/` — validaciones y transacciones, después de la base.
- `backend/tests/` — pruebas de integridad y reglas.

## Riesgos y consideraciones

- MySQL no puede imponer fácilmente, solo con FK, que el usuario de una
  inscripción tenga el rol `student`; esa regla se valida en Laravel y se
  prueba. La misma condición aplica al responsable de comunidad.
- El contador de cupos no es una columna: almacenarlo produciría datos
  redundantes y desincronizables. La transacción es necesaria para evitar
  sobrepasar la capacidad con solicitudes simultáneas.
- `locations` comienza como catálogo libre y reutilizable. Si después se
  requiere dirección, edificio o enlace virtual, se normaliza en tablas
  adicionales solo con requisitos concretos.
- No se agregan autenticación institucional, pagos, correo, calendario, QR ni
  asistencia; están fuera del alcance aprobado.

## Referencias

- `docs/CONTEXT/PROJECT_CONTEXT.md`
- `docs/PLAN_PRIMER_AVANCE.md`
- `docs/API.md`
- `backend/database/migrations/0001_01_01_000000_create_users_table.php`
