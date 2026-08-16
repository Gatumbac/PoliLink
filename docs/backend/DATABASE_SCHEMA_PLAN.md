# Modelo de base de datos de PoliLink

**Estado:** Implementado localmente con migraciones limpias.

El modelo separa la administración global del sistema de la pertenencia a una
comunidad. Un usuario normal no necesita un registro de rol global; `is_admin`
es el único privilegio global actual. Los roles `member`, `organizer` y `tutor`
pertenecen a una membresía concreta.

## Tablas principales

| Tabla | Propósito y restricciones |
| --- | --- |
| `users` | Identidad, credenciales e `is_admin BOOLEAN NOT NULL DEFAULT FALSE`. `email` es único. |
| `communities` | Comunidades con `name` único, descripción opcional, `is_active` e `image_path` nullable. |
| `community_roles` | Catálogo fijo: `member`, `organizer`, `tutor`; `code` y `name` únicos. |
| `membership_statuses` | Catálogo fijo: `pending`, `active`, `rejected`, `left`. |
| `community_memberships` | Relación única usuario-comunidad con rol, estado, fechas de solicitud/revisión y `reviewed_by`. |
| `community_creation_request_statuses` | Catálogo fijo: `pending`, `approved`, `rejected`, con nombres visibles en español. |
| `community_creation_requests` | Propuestas de comunidad, imagen temporal/definitiva, solicitante, revisor, estado, razón y comunidad creada. |
| `events` | Evento relacionado directamente con `community_id`, catálogos, estado, imagen opcional, fecha y capacidad. |
| `registrations` | Relación `event_id`–`user_id`, estado y fechas; `UNIQUE (event_id, user_id)`. |

`community_memberships` tiene estas columnas de relación y auditoría:

```text
id, community_id, user_id, community_role_id, membership_status_id,
requested_at, reviewed_at, reviewed_by, created_at, updated_at
```

Un registro `active` representa la pertenencia. El rol `organizer` permite
crear, editar, cancelar y administrar imágenes de eventos; `tutor` solo
identifica al profesor tutor; `member` representa una participación normal.
Solo un `organizer` puede asignar o cambiar roles comunitarios. La aplicación
debe conservar al menos un organizador activo por comunidad.

## Relaciones

```text
users ──< community_memberships >── communities
community_memberships ──> community_roles
community_memberships ──> membership_statuses
users (reviewed_by) ──< community_memberships
users (requested_by) ──< community_creation_requests
users (reviewed_by) ──< community_creation_requests
community_creation_requests ──> community_creation_request_statuses
community_creation_requests ──> communities (nullable after approval)
communities ──< events ──< registrations >── users
```

No existen las tablas `roles`, `role_user` ni `community_organizers`. Tampoco
se usan `community_organizer_id` o `student_id`; las policies consultan la
membresía activa y las inscripciones usan `user_id`.

## Normalización e integridad

- No se guardan listas, JSON de miembros ni nombres duplicados en relaciones.
- Los datos de usuario, comunidad, rol y estado viven en sus propias tablas.
- La combinación `community_id + user_id` evita membresías duplicadas.
- Las FK usan `RESTRICT` para comunidades, usuarios, roles, estados y eventos,
  preservando el historial. `reviewed_by` permite `NULL` y usa `SET NULL`.
- Los catálogos de eventos conservan `is_active`; desactivarlos no modifica
  eventos históricos.
- Las comunidades nuevas solo se crean al aprobar una propuesta administrativa.
  Una comunidad creada comienza con `is_active = TRUE` y el solicitante recibe
  la membresía `active/organizer`.
- Las imágenes usan el disco público del backend: `community-requests/` es
  temporal y `communities/` es la ubicación definitiva. La base guarda solo
  `image_path` y la API expone `image_url`.
- La capacidad disponible se calcula desde las inscripciones activas y no se
  almacena como dato redundante.

## Seeds

`CommunityReferenceSeeder` crea los roles, estados de membresía y estados de
propuestas en español. Los seeds de demostración crean un usuario con
membresía `organizer`, otro con membresía `member`, una comunidad, una
propuesta pendiente, un evento y una inscripción. `AdminSeeder` establece
`users.is_admin = true` para `admin@espol.edu.ec`.

## Reinicio local

El esquema no se ha desplegado y no requiere migración de datos. Para recrear
la base local:

```bash
php artisan migrate:fresh --seed
```

El comando es destructivo y debe ejecutarse únicamente sobre la base local de
PoliLink.

## Fuentes

- `docs/CONTEXT/PROJECT_CONTEXT.md`
- `docs/api/API.md`
- `backend/database/migrations/`
