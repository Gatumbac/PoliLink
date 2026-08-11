# Handoff de Darwin Díaz: módulo de inscripciones

**Estado:** iniciar solo después de integrar la base compartida en `master`.

## Inicio y límites

1. Actualizar la rama local desde `master` después de que se integren las
   migraciones, modelos, relaciones, factories y datos semilla compartidos.
2. Crear la rama `feat/registrations-darwin`.
3. Implementar solo inscripciones y cupos. No modificar migraciones, usuarios,
   roles, comunidades, eventos, modelos compartidos, seeders ni el módulo de
   eventos/catálogo de Gabriel sin acordarlo previamente.

## API a implementar

| Método | Ruta | Identidad temporal | Resultado |
| --- | --- | --- | --- |
| `POST` | `/api/events/{event}/registrations` | `student_id` en JSON | Inscribe o reactiva la inscripción del estudiante. |
| `DELETE` | `/api/events/{event}/registrations` | `student_id` en JSON | Cancela la inscripción activa del estudiante. |
| `GET` | `/api/events/{event}/registrations?organizer_id={id}` | `organizer_id` en query | Devuelve inscritos activos y cupos para el organizador responsable. |

## Reglas obligatorias

- Crear `RegistrationController`, Form Requests específicos, política o
  servicio de inscripción cuando sea necesario, las tres rutas y pruebas de
  funcionalidad.
- `student_id` debe corresponder a un usuario con rol `student`.
- `organizer_id` debe ser el organizador conectado mediante
  `community_organizers` al evento solicitado.
- El `POST` se ejecuta dentro de una transacción y bloquea el evento antes de
  contar inscripciones `active`.
- Rechazar con `409` un evento cancelado, sin cupos o una segunda inscripción
  activa del mismo estudiante.
- Si existe una inscripción `cancelled`, reactivar esa misma fila: estado
  `active`, nuevo `registered_at` y `cancelled_at` en `null`. Responder `201`
  al crear y `200` al reactivar.
- El `DELETE` cambia una inscripción activa a `cancelled` y establece
  `cancelled_at`; nunca elimina la fila. Una inscripción inexistente o ya
  cancelada responde `404`.
- El `GET` devuelve solo inscripciones activas y los campos `capacity`,
  `active_registrations` y `available_capacity`. Un organizador no responsable
  recibe `403`.
- Usar `422` para validación, `403` para rol/propiedad, `404` para recursos no
  encontrados y `409` para conflictos de cupo, estado o duplicado.

## Evidencia requerida para Avance 1

- Pruebas: inscripción correcta, duplicado, evento lleno, evento cancelado,
  cancelación que libera cupo, reactivación, lista de inscritos y organizador
  no autorizado.
- Capturas de Postman, navegador o consola de un `POST`, un `DELETE` y un
  `GET` exitosos.
- Commits del módulo únicamente en `feat/registrations-darwin`; integrar a
  `master` mediante revisión.

## Referencias

- `docs/API.md`
- `docs/backend/DATABASE_SCHEMA_PLAN.md`
- `docs/backend/BACKEND_DEVELOPMENT_PHASES.md`
