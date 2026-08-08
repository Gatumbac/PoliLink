# Contrato propuesto de la API

Este archivo describe las rutas planificadas para los módulos de eventos e inscripciones. Actualmente solo funciona el endpoint de salud y las rutas de este documento quedan como guía para Darwin y Gabriel.

La API tendrá como prefijo `/api` y devolverá respuestas en formato JSON.

## Eventos

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/events` | Lista eventos activos y acepta filtros. |
| `GET` | `/events/{id}` | Obtiene el detalle de un evento. |
| `POST` | `/events` | Crea un evento. |
| `PATCH` | `/events/{id}` | Actualiza un evento. |
| `PATCH` | `/events/{id}/cancel` | Cambia el estado del evento a cancelado. |

### Filtros de `GET /events`

- `search`: texto del título o descripción.
- `date`: fecha del evento.
- `category`: categoría.
- `modality`: modalidad presencial, virtual o híbrida.
- `community_id`: comunidad organizadora.

## Inscripciones

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/events/{id}/registrations` | Lista inscritos y cupos disponibles. |
| `POST` | `/events/{id}/registrations` | Inscribe al estudiante actual. |
| `DELETE` | `/events/{id}/registrations` | Cancela la inscripción del estudiante actual. |

## Reglas de negocio

- No se permiten inscripciones duplicadas.
- No se permiten inscripciones cuando el evento está lleno o cancelado.
- Solo el organizador responsable puede editar o cancelar su evento.
- La cancelación cambia el estado; no elimina el registro.
- Los cupos disponibles se calculan restando las inscripciones activas al cupo máximo.

## Recursos persistentes

- users: usuarios locales identificados por los roles student y organizer.
- communities: clubes u organizaciones estudiantiles.
- events: eventos asociados a un organizador y una comunidad.
 - registrations: inscripciones únicas por combinación de evento y estudiante.

## Identidad temporal

Para este primer avance, las operaciones de escritura reciben organizer_id o student_id en el cuerpo o en la consulta. Esta solución es temporal y será reemplazada por autenticación local con roles antes de la entrega final.

## Respuesta de error propuesta

```json
{
  "message": "No hay cupos disponibles.",
  "errors": {}
}
```
