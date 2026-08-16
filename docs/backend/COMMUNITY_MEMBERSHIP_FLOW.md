# Flujo de comunidades y membresías

**Estado:** esquema base implementado; endpoints y pantallas de membresías
pendientes.

Este flujo separa la cuenta global, la administración del sistema y la
pertenencia a una comunidad. Una persona puede ser miembro de varias
comunidades y tener un rol principal distinto en cada una.

## Modelo actual

- `users` contiene identidad, credenciales e `is_admin`. No existen roles
  globales `student` u `organizer`.
- `communities` representa clubes y organizaciones.
- `community_memberships` relaciona de forma única a un usuario con una
  comunidad y conserva su rol y estado.
- Los roles comunitarios son `member`, `organizer` y `tutor`.
- Los estados son `pending`, `active`, `rejected` y `left`.
- `events` apunta directamente a `community_id`.
- `registrations` apunta a `user_id`; cualquier usuario autenticado puede
  inscribirse.

El rol `organizer` implica una membresía activa y permite crear, editar,
cancelar y administrar imágenes de eventos de esa comunidad. `tutor` es una
etiqueta para identificar al profesor tutor y no concede permisos de escritura.
Los profesores de apoyo pueden permanecer como `member`.

`is_admin` solo concede administración global de catálogos. No convierte a una
persona en organizador de ninguna comunidad automáticamente.

## Experiencia propuesta

### 1. Descubrir una comunidad

El estudiante entra a `/comunidades` y busca por nombre, por ejemplo `CIAP`.
También puede llegar desde una tarjeta o detalle de evento, el catálogo
público o su cuenta. Los eventos publicados siguen siendo públicos; la
membresía agrega contexto y personalización.

### 2. Revisar el perfil

`/comunidades/:communityId` muestra nombre, descripción y eventos publicados.
El CTA depende del estado:

| Estado | Acción visible |
| --- | --- |
| Visitante | `Iniciar sesión para unirte` |
| Sin membresía | `Solicitar unirme` |
| Solicitud pendiente | `Solicitud enviada` |
| Miembro activo | `Eres miembro` |
| Organizador activo | `Administrar comunidad` |

### 3. Solicitar membresía

El usuario autenticado solicita pertenecer a una comunidad. El backend crea o
reactiva una relación `pending/member`; la interfaz no puede asignar `active`,
`organizer` ni `tutor`.

### 4. Revisar solicitudes

Solo un `organizer` activo de esa comunidad puede aprobar o rechazar
solicitudes. Al aprobar, la membresía cambia a `active/member`. El mismo
organizador puede asignar después el rol `tutor` cuando corresponda. Ningún
rol comunitario concede aprobación administrativa de eventos.

### 5. Mis comunidades

`/mis-comunidades` debe reservarse para membresías propias. El panel de
comunidades administradas debe permanecer en `/organizar` o
`/organizar/panel`. La implementación actual todavía usa `/mis-comunidades`
para comunidades administradas; la migración de esa pantalla pertenece a la
integración frontend de esta fase.

## Contrato API futuro

Estos endpoints siguen pendientes; la migración de base no los implementa.
Los paths del backend conservan el idioma inglés del contrato actual.

| Método | Endpoint propuesto | Actor | Propósito |
| --- | --- | --- | --- |
| `GET` | `/communities/discover?search=ciap` | Público | Buscar comunidades existentes. |
| `GET` | `/communities/{community}` | Público | Consultar el perfil y eventos publicados. |
| `POST` | `/communities/{community}/membership-requests` | Usuario autenticado | Crear o reactivar una solicitud propia. |
| `DELETE` | `/communities/{community}/membership-requests` | Usuario autenticado | Cancelar solicitud o abandonar la comunidad. |
| `GET` | `/communities/{community}/membership-requests` | Organizer activo | Listar solicitudes pendientes. |
| `PATCH` | `/communities/{community}/membership-requests/{membership}` | Organizer activo | Aprobar, rechazar o asignar el rol permitido. |
| `GET` | `/me/memberships` | Usuario autenticado | Listar membresías propias. |

El endpoint existente `GET /communities` conserva su propósito de alimentar los
filtros con comunidades que tienen eventos publicados.

## Creación de comunidades

La creación directa actual permite a un usuario autenticado crear una
comunidad y recibir una membresía `active/organizer`. Esto no prueba que la
persona represente oficialmente a una organización.

Una futura `community_creation_request` requeriría decidir quién revisa la
propuesta. Esa tabla y su aprobación permanecen fuera de esta implementación;
no existe integración institucional para verificar pertenencia a CIAP u otra
comunidad.

## Fases siguientes

1. Directorio y perfiles públicos.
2. Solicitudes y estados de membresía.
3. Bandeja de aprobación para organizadores.
4. Asignación de `tutor` por un organizador y espacio de membresías.
5. Política separada para proponer nuevas comunidades.

La base actual ya soporta la relación normalizada; las fases pendientes deben
agregar sus APIs y policies sin volver a crear `community_organizers` ni roles
globales de comunidad.
