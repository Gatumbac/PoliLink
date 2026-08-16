# Flujo de comunidades y membresías

**Estado:** `Planned` — propuesta pendiente de aprobación de alcance.

Este documento describe una evolución de PoliLink para distinguir entre una
persona que tiene una cuenta, una persona que pertenece a una comunidad y una
persona que administra una comunidad. No modifica todavía el backend ni el
frontend actuales.

## Motivación

Un estudiante puede conocer una comunidad como CIAP, TAWS o un club de ESPOL y
querer identificarse como miembro sin convertirse en organizador. El flujo
debe permitir buscar la comunidad, solicitar acceso y esperar la aprobación de
una persona que ya la administra.

La membresía no debe ser necesaria para ver eventos: los eventos publicados
seguirán siendo públicos. La membresía permitirá construir una experiencia
personalizada de comunidades y distinguir claramente la pertenencia de la
responsabilidad de publicar eventos.

## Estado actual

El modelo existente contiene:

- `users` y roles globales como `student` y `organizer`.
- `communities` con nombre y descripción.
- `community_organizers`, que relaciona usuarios con comunidades que pueden
  administrar.
- Eventos vinculados a una asignación de organizador mediante
  `community_organizer_id`.

Actualmente no existe una tabla de miembros ni de solicitudes. Además:

- `GET /api/communities` devuelve comunidades que tienen eventos publicados y
  se usa como referencia para filtros.
- `POST /api/communities` permite a un usuario autenticado crear una comunidad
  y le asigna inmediatamente la responsabilidad de organizador.
- El correo `@espol.edu.ec` demuestra una cuenta ESPOL, pero no demuestra que
  la persona pertenezca a CIAP o a otra comunidad.

Por eso, una casilla de confirmación en la interfaz mejora el contexto, pero no
puede validar por sí sola la pertenencia.

## Modelo de producto

| Concepto | Responsabilidad |
| --- | --- |
| Estudiante | Puede descubrir eventos y solicitar pertenecer a comunidades. |
| Miembro | Tiene una relación `active` con una comunidad aprobada. |
| Organizador | Administra una comunidad específica y publica sus eventos. |

Una persona puede ser miembro de varias comunidades y organizador de una o
varias. Ser miembro no debe asignar el rol global `organizer`. La relación de
administración debe seguir dependiendo de `community_organizers`.

Los organizadores de una comunidad serían los responsables de revisar sus
solicitudes. Esta aprobación es de pertenencia a una comunidad y no es una
aprobación administrativa de eventos; los organizadores seguirán publicando
eventos directamente, como establece el alcance aprobado.

## Experiencia propuesta

### 1. Descubrir una comunidad

El estudiante entra a `/comunidades` y busca por nombre, por ejemplo `CIAP`.
También puede llegar desde:

- El nombre de la comunidad en una tarjeta o detalle de evento.
- Un enlace desde el catálogo público.
- La sección de comunidades de su cuenta.

### 2. Revisar el perfil

`/comunidades/:communityId` muestra nombre, descripción y eventos publicados.
El botón depende del estado de la sesión:

| Estado | Acción visible |
| --- | --- |
| Visitante | `Iniciar sesión para unirte` |
| Estudiante sin solicitud | `Solicitar unirme` |
| Solicitud pendiente | `Solicitud enviada` |
| Miembro activo | `Eres miembro` |
| Organizador responsable | `Administrar comunidad` |

### 3. Solicitar membresía

El estudiante confirma que forma parte o participa en la comunidad. El sistema
crea una solicitud `pending`; no asigna el rol `organizer` ni concede permisos
de publicación.

### 4. Revisar la solicitud

El organizador encuentra una bandeja de solicitudes dentro de su panel. Puede
ver el nombre, correo ESPOL y fecha de solicitud del estudiante, y elegir:

- `Aprobar`: cambia la relación a `active`.
- `Rechazar`: cambia la relación a `rejected`.

Solo los organizadores relacionados con esa comunidad pueden revisar sus
solicitudes. Un organizador no puede aprobar solicitudes de otra comunidad.

### 5. Consultar mis comunidades

Después de la aprobación, CIAP aparece en `/mis-comunidades` junto con las
comunidades a las que el estudiante pertenece. El panel de administración de
eventos debe mantenerse conceptualmente separado en `/organizar`.

La implementación actual usa `/mis-comunidades` para el panel de comunidades
administradas. Al comenzar esta fase se deberá mover ese panel a `/organizar`
o a `/organizar/panel`, y reservar `/mis-comunidades` para las membresías.

## Modelo de datos propuesto

Crear una tabla `community_memberships` con una relación única por usuario y
comunidad:

| Campo | Propósito |
| --- | --- |
| `id` | Identificador de la relación. |
| `community_id` | Comunidad solicitada. |
| `user_id` | Estudiante o usuario miembro. |
| `status` | `pending`, `active`, `rejected` o `left`. |
| `requested_at` | Momento de la solicitud. |
| `reviewed_at` | Momento de aprobación o rechazo. |
| `reviewed_by` | Organizador que revisó la solicitud. |
| `created_at`, `updated_at` | Auditoría estándar. |

La restricción única `community_id + user_id` evita solicitudes duplicadas.
Una nueva solicitud puede reactivarse después de un rechazo o una salida según
la regla que se confirme durante la implementación.

No se debe reutilizar `community_organizers` para miembros: esa tabla representa
responsabilidad de gestión, no pertenencia.

## Contrato API propuesto

Estos endpoints son una propuesta y no están implementados todavía. Los paths
del backend conservan el idioma inglés del contrato actual.

| Método | Endpoint propuesto | Actor | Propósito |
| --- | --- | --- | --- |
| `GET` | `/communities/discover?search=ciap` | Público | Buscar comunidades activas sin alterar el endpoint usado por filtros. |
| `GET` | `/communities/{community}` | Público | Consultar el perfil y referencias de una comunidad. |
| `POST` | `/communities/{community}/membership-requests` | Estudiante | Crear o reactivar una solicitud propia. |
| `DELETE` | `/communities/{community}/membership-requests` | Estudiante | Cancelar una solicitud pendiente o abandonar la comunidad. |
| `GET` | `/communities/{community}/membership-requests` | Organizador responsable | Listar solicitudes pendientes. |
| `PATCH` | `/communities/{community}/membership-requests/{membership}` | Organizador responsable | Aprobar o rechazar una solicitud. |
| `GET` | `/me/memberships` | Usuario autenticado | Listar membresías propias y sus estados. |

El endpoint existente `GET /communities` debe conservar su propósito actual de
llenar filtros con comunidades que tienen eventos publicados. Por eso se
propone un endpoint de descubrimiento separado, evitando mostrar filtros que
no producirían resultados.

## Validar la creación de nuevas comunidades

Buscar primero una comunidad existente reduce duplicados, pero no prueba que un
usuario pertenezca a una comunidad. Para la creación hay dos alternativas:

### Creación directa

El estudiante puede proponer y crear una comunidad nueva. Es la opción de menor
complejidad, pero confía en la declaración del usuario. Debe presentarse como
`Proponer una comunidad` si se quiere comunicar honestamente esa limitación.

### Propuesta pendiente — recomendada para mayor control

El estudiante crea una `community_creation_request` y la comunidad permanece
`pending` hasta que una autoridad definida la revise. Solo después se crea o
activa la comunidad y se asigna el primer organizador.

Esta alternativa agrega un flujo de aprobación que no existe en el alcance
actual. Requiere aprobación explícita del equipo antes de diseñar sus roles,
pantallas y endpoints. No se debe presentar como una validación institucional,
porque PoliLink no tiene integración con sistemas de ESPOL.

## Fases de implementación propuestas

### Fase A — Directorio y perfiles

- Crear el endpoint de descubrimiento sin romper los filtros actuales.
- Añadir búsqueda, tarjetas y detalle de comunidades.
- Mantener eventos públicos.

### Fase B — Solicitudes de membresía

- Crear migración, modelo, estados y relaciones.
- Implementar solicitar, cancelar y consultar el estado propio.
- Cubrir solicitudes duplicadas y usuarios no autenticados.

### Fase C — Aprobación del organizador

- Añadir la bandeja de solicitudes por comunidad.
- Autorizar únicamente a organizadores responsables.
- Implementar aprobación, rechazo y estados de carga/error.

### Fase D — Espacio del miembro

- Reservar `/mis-comunidades` para membresías.
- Mostrar comunidades activas, pendientes y rechazadas.
- Enlazar cada comunidad con su perfil y eventos.

### Fase E — Política de nuevas comunidades

- Elegir creación directa o propuesta pendiente.
- Actualizar el onboarding `/crear-comunidad` según la decisión.
- Documentar quién puede aprobar una comunidad nueva.

## Complejidad y riesgos

| Parte | Complejidad | Motivo |
| --- | --- | --- |
| Directorio y búsqueda | Baja | Lectura y filtros sobre comunidades existentes. |
| Solicitud de unión | Media | Nueva relación, estados y reglas de duplicidad. |
| Aprobación por organizador | Media | Policies por comunidad y panel adicional. |
| Validación de nuevas comunidades | Media-alta | Requiere decidir una autoridad o aceptar autodeclaración. |
| Personalización de eventos | Baja-media | Los eventos ya son públicos; la membresía solo añade contexto. |

## Decisiones pendientes

- ¿La membresía solo personaliza la cuenta o habilita contenido privado?
- ¿Un organizador es miembro activo automáticamente de su comunidad?
- ¿Un usuario puede abandonar una comunidad y volver a solicitar ingreso?
- ¿Se permite creación directa o se requiere propuesta pendiente?
- Si existe aprobación, ¿quién aprueba una comunidad nueva?
- ¿Una comunidad puede tener varios organizadores aprobadores?

Hasta resolver estas decisiones, este flujo debe permanecer como propuesta y no
debe mezclarse con el contrato API implementado.
