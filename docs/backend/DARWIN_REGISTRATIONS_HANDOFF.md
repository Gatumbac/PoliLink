# Handoff de Darwin Díaz: inscripciones autenticadas

Objetivo: implementar el módulo de inscripciones directamente con la sesión
local de Laravel Sanctum. No usar student_id, organizer_id, rutas de usuarios
por ID ni una versión temporal de estas APIs.

## Inicio seguro

1. Esperar a que se integren los cambios actuales de Fase 5 en master.
2. Crear la rama feat/registrations-darwin.
3. Revisar docs/API.md, docs/backend/FRONTEND_API_PHASES.md y este archivo
   antes de modificar código.
4. Implementar solo inscripciones y cupos. No cambiar migraciones, modelos
   compartidos, seeders, autenticación, comunidades ni el controlador de
   eventos de Gabriel.

Las tablas, relaciones, estados, factories y datos semilla ya existen. No crear
una migración ni una tabla nueva.

## Rutas a implementar

Todas requieren auth:sanctum. El actor siempre es $request->user().

| Método | Ruta | Rol requerido | Resultado |
| --- | --- | --- | --- |
| POST | /api/events/{event}/registrations | student | Crea o reactiva la inscripción propia. |
| DELETE | /api/events/{event}/registrations | student | Cancela la inscripción propia activa. |
| GET | /api/events/{event}/registrations | organizer responsable | Lista inscritos activos y cupos. |
| GET | /api/me/registrations | student | Lista mis inscripciones activas. |

POST y DELETE no reciben cuerpo. El navegador no puede elegir otro estudiante.
GET de inscritos tampoco recibe query string: el organizador se obtiene desde
la sesión.

## Reglas de dominio

### Inscribir o reactivar

- Ejecutar todo dentro de DB::transaction.
- Bloquear el evento con lockForUpdate antes de verificar estado, registro y cupo.
- Solo permitir eventos published; uno cancelled devuelve 409.
- Verificar que la sesión tiene rol student; de lo contrario 403.
- Una inscripción active existente devuelve 409.
- Contar solo inscripciones active; si alcanzan capacity, devolver 409.
- Si existe una fila cancelled para ese evento y estudiante, reactivarla:
  estado active, nuevo registered_at y cancelled_at nulo; responder 200.
- Si no existe, crearla con estado active; responder 201.

### Cancelar

- Ejecutar dentro de transacción y bloquear el evento antes del registro.
- Buscar la inscripción active del usuario de sesión para ese evento.
- Si no existe o ya estaba cancelada, devolver 404.
- Nunca borrar la fila: cambiar a cancelled y registrar cancelled_at.
- Responder 200. Al dejar de contarla como activa, libera un cupo.

### Consultar inscritos

- Verificar rol organizer y que el usuario autenticado administra la comunidad
  del evento mediante community_organizers; de lo contrario 403.
- Devolver únicamente inscripciones active, ordenadas por registered_at.
- Incluir por asistente: id, registered_at, estado y estudiante
  (id, first_name, last_name, email).
- Incluir summary con capacity, active_registrations y available_capacity.

### Mis inscripciones

- Verificar rol student; de lo contrario 403.
- Devolver solo registros active, ordenados por registered_at descendente.
- Paginar con per_page=12 por defecto, mínimo 1 y máximo 50.
- Cargar el evento completo con comunidad, categoría, modalidad, ubicación,
  estado y cupos disponibles. Un evento cancelled no modifica una inscripción.

## Forma de respuesta

Crear RegistrationResource para no exponer columnas internas. Debe devolver
id, registered_at, cancelled_at, status y, cuando esté cargado, event mediante
el recurso de eventos existente. En la lista de asistentes, añadir student.

La lista de asistentes debe responder data y summary. Mis inscripciones debe
ser una colección paginada de RegistrationResource con el evento completo.

## Código y pruebas esperadas

- Crear RegistrationController, Form Requests solo para paginación,
  RegistrationResource y pruebas feature propias.
- Añadir las cuatro rutas dentro del grupo auth:sanctum existente.
- Reutilizar Registration, RegistrationStatus, Event y sus relaciones; no
  duplicar lógica de eventos.
- Cubrir: sin sesión (401), rol incorrecto (403), inscripción nueva (201),
  duplicado (409), evento cancelado (409), evento lleno (409), cancelación
  (200), inscripción inexistente (404), reactivación (200), lista autorizada y
  no autorizada, y mis inscripciones paginadas.
- Ejecutar php artisan test y vendor/bin/pint --test sobre el módulo. No
  iniciar servidores ni contenedores desde agentes.

## Entrega

- Actualizar docs/API.md y docs/backend/FRONTEND_API_PHASES.md para marcar
  Fase 5 completa cuando las cuatro rutas estén integradas.
- Obtener capturas manuales con Sanctum: login, inscripción, cancelación,
  lista de inscritos y mis inscripciones.
- Mantener el módulo en feat/registrations-darwin e integrar a master mediante
  revisión.
