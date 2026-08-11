# Contrato de la API

La API usa el prefijo `/api` y responde JSON. El módulo de eventos está
implementado; el módulo de inscripciones queda reservado para Darwin Díaz.

## Eventos

| Método | Ruta | Estado | Descripción |
| --- | --- | --- | --- |
| `GET` | `/events` | Implementado | Lista eventos publicados y aplica filtros. |
| `GET` | `/events/{event}` | Implementado | Obtiene el detalle de un evento publicado. |
| `POST` | `/events` | Implementado | Crea un evento para una comunidad administrada. |
| `PATCH` | `/events/{event}` | Implementado | Actualiza un evento propio publicado. |
| `PATCH` | `/events/{event}/cancel` | Implementado | Cancela un evento propio sin eliminarlo. |

### Catálogo: `GET /events`

Filtros opcionales y combinables:

| Parámetro | Formato | Descripción |
| --- | --- | --- |
| `search` | texto | Busca en título y descripción. |
| `date` | `YYYY-MM-DD` | Filtra por día del evento. |
| `category` | código | Código de categoría, por ejemplo `hackathon`. |
| `modality` | código | Código de modalidad, por ejemplo `in_person`. |
| `community_id` | entero | Comunidad organizadora. |
| `page` | entero | Página, mínimo `1`. |
| `per_page` | entero | Elementos por página; predeterminado `12`, máximo `50`. |

Solo devuelve eventos con estado `published`, ordenados por `starts_at`
ascendente. Un evento cancelado no se muestra ni en el catálogo ni en
`GET /events/{event}`; ambas consultas públicas devuelven `404` para ese
detalle.

### Crear: `POST /events`

```json
{
  "organizer_id": 1,
  "community_id": 1,
  "event_category_id": 3,
  "event_modality_id": 1,
  "location_id": 1,
  "title": "Taller Laravel",
  "description": "Introducción a Laravel.",
  "starts_at": "2026-08-20T10:00:00-05:00",
  "capacity": 30
}
```

El usuario debe tener el rol `organizer` y administrar la comunidad indicada.
El evento se crea con estado `published`.

### Editar: `PATCH /events/{event}`

El cuerpo requiere `organizer_id`. Los demás campos de creación son opcionales.
Se puede enviar `community_id` para mover el evento únicamente a otra comunidad
administrada por ese mismo organizador. No se puede editar un evento cancelado.

### Cancelar: `PATCH /events/{event}/cancel`

```json
{
  "organizer_id": 1
}
```

Solo el organizador responsable puede cancelarlo. La operación cambia el
estado a `cancelled`; no borra el registro ni permite una segunda cancelación.

### Respuesta de evento

```json
{
  "data": {
    "id": 1,
    "title": "Hackathon TAWS",
    "description": "Evento de demostración.",
    "starts_at": "2026-08-20T14:00:00.000000Z",
    "capacity": 50,
    "available_capacity": 49,
    "category": { "id": 3, "code": "hackathon", "name": "Hackathon" },
    "modality": { "id": 1, "code": "in_person", "name": "In person" },
    "location": { "id": 1, "name": "Campus Gustavo Galindo", "description": null },
    "community": { "id": 1, "name": "TAWS", "description": "..." },
    "status": { "code": "published", "name": "Published" }
  }
}
```

La lista añade la metadata de paginación de Laravel. Los cupos disponibles se
calculan como capacidad menos inscripciones con estado `active`.

### Errores de eventos

| Código | Situación |
| --- | --- |
| `422` | Filtros o cuerpo inválidos; por ejemplo, cupo menor que uno. |
| `403` | El usuario no tiene rol de organizador o no administra la comunidad/evento. |
| `404` | Evento inexistente o cancelado en una consulta pública. |
| `409` | Intento de editar o cancelar un evento ya cancelado. |

## Inscripciones — pendiente

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/events/{event}/registrations?organizer_id={id}` | Lista inscritos y cupos para el organizador responsable. |
| `POST` | `/events/{event}/registrations` | Inscribe o reactiva a un estudiante con `student_id`. |
| `DELETE` | `/events/{event}/registrations` | Cancela la inscripción activa con `student_id`. |

Las reglas y evidencia requeridas del módulo están documentadas en
`docs/backend/DARWIN_REGISTRATIONS_HANDOFF.md`.
