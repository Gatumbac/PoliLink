# Fases de desarrollo del backend de PoliLink

**Fecha:** 2026-08-10  
**Estado:** Planificado  
**Alcance:** API REST Laravel y MySQL. El frontend consume la API, pero no
forma parte de este plan de implementación.

## Objetivo de entrega

Entregar un backend local y reproducible que permita:

1. Publicar, editar, cancelar, consultar y filtrar eventos.
2. Inscribir estudiantes, cancelar una inscripción, consultar inscritos y
   calcular cupos disponibles.
3. Respetar roles, la responsabilidad de cada organizador sobre su comunidad,
   estados y capacidad sin duplicar datos.

El alcance excluye integraciones institucionales, pagos, correo, calendario,
QR y validación de asistencia. La autenticación local queda diferida hasta que
se apruebe expresamente; mientras tanto, el actor se identifica de manera
temporal mediante `organizer_id` o `student_id` en la solicitud.

## Principios de implementación

- El código de aplicación vive solo en `backend/`.
- Las migraciones son la fuente de verdad de MySQL; no se crean tablas ni
  datos manualmente desde un cliente de base de datos.
- Se reutiliza `users` de Laravel. La identidad se completa mediante una
  migración incremental para usar `first_name` y `last_name`, sin crear tablas
  separadas de estudiantes u organizadores.
- No se usan columnas JSON ni tipos `ENUM`; los valores controlados son
  catálogos relacionales.
- Los controladores son delgados: la validación va en Form Requests, la
  autorización en Policies y las operaciones críticas en servicios o acciones
  transaccionales.
- El estado de eventos e inscripciones se conserva; no se eliminan registros
  de negocio para representar una cancelación.

## Orden y fases

### Fase 0 — Base y convenciones

**Propósito:** confirmar el punto de partida antes de escribir dominio.

- [x] Laravel 13 y MySQL local preparados.
- [x] Endpoint de salud `GET /api/health` disponible.
- [x] Esquema propuesto en `DATABASE_SCHEMA_PLAN.md`.
- [ ] Confirmar las semillas de categorías y ubicaciones.
- [ ] Confirmar que una inscripción cancelada se reactiva en la misma fila si
  el estudiante vuelve a registrarse.
- [ ] Establecer respuestas JSON y códigos HTTP consistentes.

**Resultado:** decisiones de datos cerradas y sin código de eventos aún.

### Fase 1 — Persistencia y migraciones

**Propósito:** crear el esquema normalizado y sus garantías de integridad.

1. Crear una migración incremental sobre `users`: reemplazar el significado
   ambiguo de `name` por `first_name` y agregar `last_name`.
2. Crear `roles` y el pivote `role_user`.
3. Crear `communities` y `community_organizers`.
4. Crear catálogos: `event_categories`, `event_modalities`, `locations`,
   `event_statuses` y `registration_statuses`.
5. Crear `events` con FKs, capacidad positiva, fecha/hora y estado.
6. Crear `registrations` con `UNIQUE(event_id, student_id)`.
7. Agregar índices para catálogo, filtros, inscritos y cupos.

**Archivos:** `backend/database/migrations/`.

**Criterio de salida:** una base recién migrada contiene todas las tablas,
claves foráneas, restricciones de unicidad e índices del diseño acordado.

### Fase 2 — Modelos, relaciones y datos semilla

**Propósito:** convertir las tablas en un modelo Eloquent navegable y una base
local repetible.

- Actualizar `User` con los campos de identidad y relaciones a roles,
  comunidades administradas e inscripciones.
- Crear modelos para el resto de entidades y catálogos.
- Definir relaciones: `belongsTo`, `hasMany` y `belongsToMany` según el
  esquema.
- Crear factories para usuario, comunidad, evento e inscripción.
- Preparar seeders con roles, catálogos, dos usuarios de prueba, una
  comunidad, su organizador y eventos de ejemplo.
- Agregar al modelo `Event` una consulta o accesor para cupos disponibles,
  calculados desde inscripciones activas.

**Archivos:** `backend/app/Models/`, `backend/database/factories/`,
`backend/database/seeders/`.

**Criterio de salida:** los seeders crean datos coherentes y las relaciones se
pueden consultar sin SQL manual en controladores.

### Fase 3 — Lectura del catálogo y detalle

**Propósito:** entregar primero la parte pública de consulta.

- Crear `EventController` para `index` y `show`.
- Crear un Form Request para filtros opcionales y combinables: texto, fecha,
  categoría, modalidad y comunidad.
- Mostrar únicamente eventos con estado `published`.
- Incluir comunidad, categoría, modalidad, ubicación y cupos disponibles en la
  respuesta.
- Usar paginación y orden predeterminado por `starts_at` ascendente.
- Crear API Resources para no devolver directamente el modelo de base de datos.

**Rutas:** `GET /api/events`, `GET /api/events/{event}`.

**Criterio de salida:** el catálogo responde datos consistentes, se filtra
correctamente y no muestra eventos cancelados.

### Fase 4 — Gestión de eventos

**Responsable funcional:** Gabriel Tumbaco.

**Propósito:** permitir a un organizador administrar únicamente eventos de sus
comunidades.

- Crear Form Requests para creación, actualización y cancelación.
- Crear `EventPolicy` para verificar rol `organizer`, propiedad y vínculo con
  la comunidad mediante `community_organizers`.
- Implementar creación; el estado inicial es `published`.
- Implementar edición de datos permitidos.
- Implementar cancelación mediante cambio a `cancelled`; nunca borrar el
  evento.
- Resolver temporalmente el actor desde `organizer_id` y encapsular esa lógica
  para reemplazarla luego por autenticación local sin reescribir reglas.

**Rutas:** `POST /api/events`, `PATCH /api/events/{event}`, `PATCH
/api/events/{event}/cancel`.

**Criterio de salida:** un organizador no puede crear ni modificar eventos de
otra comunidad, y las validaciones devuelven errores JSON claros.

### Fase 5 — Inscripciones y capacidad

**Responsable funcional:** Darwin Díaz.

**Propósito:** administrar reservas sin duplicados ni sobrecupo.

- Crear `RegistrationController` y Form Requests pertinentes.
- Crear políticas para que solo estudiantes gestionen sus inscripciones y los
  organizadores consulten las de sus eventos.
- Implementar inscripción dentro de una transacción: bloquear el evento,
  comprobar estado, contar inscripciones `active`, comparar con `capacity` y
  crear o reactivar la inscripción.
- Implementar cancelación cambiando el estado a `cancelled` y registrando la
  fecha de cancelación.
- Implementar lista de inscritos y cupos disponibles para el responsable del
  evento.

**Rutas:** `POST /api/events/{event}/registrations`, `DELETE
/api/events/{event}/registrations`, `GET /api/events/{event}/registrations`.

**Criterio de salida:** no hay duplicados, no hay sobrecupo, no se aceptan
inscripciones en eventos cancelados y una cancelación libera el cupo.

### Fase 6 — Autorización y manejo transversal

**Propósito:** centralizar reglas que no deben repetirse en controladores.

- Consolidar `EventPolicy` y `RegistrationPolicy`.
- Aplicar middleware o una resolución temporal uniforme del actor.
- Estandarizar errores: validación (`422`), no autenticado cuando aplique
  (`401`), prohibido (`403`), no encontrado (`404`), duplicado o conflicto de
  cupo (`409`).
- Definir una estrategia uniforme para cargar relaciones y evitar consultas
  N+1.
- Centralizar la transacción de inscripción en una clase de servicio si el
  controlador empieza a tener lógica de negocio.

**Criterio de salida:** las reglas de permisos, propiedad y errores son iguales
en todas las rutas.

### Fase 7 — Pruebas automatizadas

**Propósito:** demostrar que las reglas sobreviven cambios e integración.

- Pruebas de migraciones y restricciones: email, roles, responsables de
  comunidad y unicidad de inscripción.
- Pruebas de modelos: relaciones y cálculo de cupos.
- Pruebas de catálogo: filtros individuales y combinados, orden y eventos
  cancelados ocultos.
- Pruebas de eventos: creación válida, capacidad inválida, edición ajena y
  cancelación.
- Pruebas de inscripciones: éxito, duplicado, evento cancelado, evento lleno,
  cancelación, reactivación si se aprueba y concurrencia simulada donde sea
  viable.
- Pruebas de autorización: organizador incorrecto, estudiante incorrecto y
  usuario sin rol.

**Archivos:** `backend/tests/Feature/`, `backend/tests/Unit/`.

**Criterio de salida:** las rutas y reglas críticas tienen pruebas reproducibles
en una base de datos de prueba.

### Fase 8 — Contrato, documentación y entrega

**Propósito:** que frontend y equipo puedan integrar sin adivinar el backend.

- Actualizar `docs/api/API.md` con cuerpos de solicitud, respuestas, errores,
  paginación y filtros implementados.
- Actualizar `backend/README.md` con instalación, configuración MySQL,
  migraciones, seeders y usuarios de desarrollo.
- Mantener `docs/backend/DATABASE_SCHEMA_PLAN.md` alineado con las decisiones
  que lleguen a implementarse.
- Registrar cambios verificables en `docs/BITACORA.md` sin afirmar trabajo no
  realizado.
- Preparar una colección de solicitudes o pasos de demostración para el flujo
  completo y sus errores principales.

**Criterio de salida:** otra persona puede instalar, migrar, sembrar y consumir
la API local siguiendo solo la documentación.

### Fase 9 — Autenticación local (diferida)

Esta fase **no se implementa** dentro del alcance actual sin aprobación
explícita. Si se aprueba antes de la entrega final:

1. Elegir autenticación local de Laravel para la API React, normalmente con
   Sanctum.
2. Implementar registro/inicio/cierre de sesión local y proteger rutas.
3. Reemplazar la resolución temporal de `organizer_id` y `student_id` por el
   usuario autenticado.
4. Conservar las Policies: autenticar identifica al usuario; las Policies
   siguen decidiendo si puede actuar sobre un recurso concreto.

No se añade autenticación institucional.

## Dependencias entre fases

```text
Fase 1 ──> Fase 2 ──> Fase 3
                    ├──> Fase 4 ──┐
                    └──> Fase 5 ──┼──> Fase 6 ──> Fase 7 ──> Fase 8
                                  │
Fase 9 es opcional y posterior a las rutas funcionales.
```

## Checklist mínimo para el primer avance

- [ ] Esquema migrado y sembrado.
- [ ] Catálogo, detalle y filtros funcionando.
- [ ] Crear, editar y cancelar eventos funcionando.
- [ ] Inscribir, cancelar inscripción y consultar inscritos funcionando.
- [ ] Reglas de rol, propiedad, estado y cupo cubiertas por pruebas.
- [ ] API y README actualizados.

## Referencias

- `docs/CONTEXT/PROJECT_CONTEXT.md`
- `docs/PLAN_PRIMER_AVANCE.md`
- `docs/api/API.md`
- `docs/backend/DATABASE_SCHEMA_PLAN.md`
- `docs/backend/LARAVEL_BASICS.md`
