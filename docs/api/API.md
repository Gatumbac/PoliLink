# Contrato de la API

La API usa el prefijo `/api` y responde JSON. Los módulos de eventos e
inscripciones están implementados.

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

Requiere sesión Sanctum. El usuario de la sesión debe tener el rol `organizer`
y administrar la comunidad indicada. El evento se crea con estado `published`.
El cliente no envía un identificador de organizador.

### Editar: `PATCH /events/{event}`

Requiere sesión Sanctum. Los campos de creación son opcionales. Se puede enviar
`community_id` para mover el evento únicamente a otra comunidad administrada
por el organizador de la sesión. No se puede editar un evento cancelado.

### Cancelar: `PATCH /events/{event}/cancel`

Requiere sesión Sanctum y no recibe cuerpo. Solo el organizador responsable
puede cancelarlo. La operación cambia el estado a `cancelled`; no borra el
registro ni permite una segunda cancelación.

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
| `401` | No existe una sesión autenticada para crear, editar o cancelar. |
| `403` | El usuario no tiene rol de organizador o no administra la comunidad/evento. |
| `404` | Evento inexistente o cancelado en una consulta pública. |
| `409` | Intento de editar o cancelar un evento ya cancelado. |

## Datos de referencia — implementado

Estas rutas son públicas, de solo lectura y no requieren identidad temporal.
Sirven para llenar filtros y selectores del frontend.

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/event-categories` | Categorías con `id`, `code` y `name`. |
| `GET` | `/event-modalities` | Modalidades con `id`, `code` y `name`. |
| `GET` | `/locations` | Ubicaciones con `id`, `name` y `description`. |
| `GET` | `/communities` | Comunidades con `id`, `name` y `description`. |

Todos responden con un arreglo en `data`, ordenado alfabéticamente por nombre.
`GET /communities` devuelve únicamente comunidades que poseen al menos un
evento con estado `published`, para evitar opciones de filtro sin resultados.

## Autenticación local — implementado

La SPA usa Laravel Sanctum con cookies de sesión y CSRF. No se emiten tokens
Bearer ni se integra ninguna cuenta institucional.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/sanctum/csrf-cookie` | Inicializa las cookies CSRF y de sesión. |
| `POST` | `/auth/register` | Registra un usuario local con rol `student`. |
| `POST` | `/auth/login` | Inicia la sesión local. |
| `DELETE` | `/auth/logout` | Cierra la sesión actual. Requiere sesión. |
| `GET` | `/auth/me` | Devuelve el usuario y sus roles. Requiere sesión. |

Las últimas cuatro rutas usan el prefijo `/api`. El registro recibe
`first_name`, `last_name`, `email`, `password` y `password_confirmation`. El
servidor asigna exclusivamente el rol `student`; no acepta roles enviados por
el navegador. Login recibe `email` y `password` y aplica un máximo de cinco
intentos fallidos por minuto para el mismo email e IP.

`GET /auth/me`, `POST /auth/login` y `POST /auth/register` responden:

```json
{
  "data": {
    "id": 2,
    "first_name": "Estudiante",
    "last_name": "PoliLink",
    "email": "student@polilink.test",
    "roles": [{ "code": "student", "name": "Student" }]
  }
}
```

`DELETE /auth/logout` responde `204`. Las credenciales inválidas responden
`401`, una sesión ausente responde `401`, los datos inválidos `422` y el límite
de intentos `429`.

### Prueba manual con Postman

1. Usar `http://localhost:8000` como backend y conservar las cookies de la
   colección.
2. Solicitar `GET /sanctum/csrf-cookie`.
3. Enviar `Origin: http://localhost:5173` y copiar el valor URL-decodificado de
   la cookie `XSRF-TOKEN` al encabezado `X-XSRF-TOKEN` para cada `POST` o
   `DELETE`.
4. Ejecutar register o login, luego `GET /api/auth/me`, `DELETE /api/auth/logout`
   y nuevamente `GET /api/auth/me` para evidenciar el `401` final.

## Onboarding de comunidades — implementado

Estas rutas requieren una sesión autenticada mediante Sanctum. La identidad se
obtiene desde la cookie de sesión; el cliente no envía un usuario ni roles.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/communities` | Crea una comunidad y convierte al usuario actual en organizador. |
| `GET` | `/me/communities` | Lista las comunidades administradas por la sesión actual. |
| `GET` | `/me/events` | Lista sus eventos, incluidos los cancelados. |

`POST /api/communities` recibe:

```json
{
  "name": "Club de Robótica",
  "description": "Comunidad de robótica de ESPOL."
}
```

El servidor crea la comunidad, conserva el rol `student`, asigna `organizer` y
crea la relación de responsabilidad dentro de una sola transacción. Devuelve
`201`; un nombre repetido o inválido devuelve `422`.

Las rutas `/api/me/communities` y `/api/me/events` devuelven listas vacías si
el usuario aún no administra ninguna comunidad. Los eventos se ordenan por
fecha descendente y usan paginación con `per_page=12` por defecto y máximo
`50`.

## Inscripciones autenticadas — implementado

Todas requieren sesión Sanctum; el actor siempre es el usuario de la sesión.
Ninguna recibe cuerpo ni query string: el estudiante o el organizador se
obtienen de la cookie de sesión.

| Método | Ruta | Rol requerido | Descripción |
| --- | --- | --- | --- |
| `POST` | `/events/{event}/registrations` | `student` | Crea o reactiva la inscripción propia. |
| `DELETE` | `/events/{event}/registrations` | `student` | Cancela la inscripción propia activa. |
| `GET` | `/events/{event}/registrations` | `organizer` responsable | Lista inscritos activos y cupos. |
| `GET` | `/me/registrations` | `student` | Lista las inscripciones activas de la sesión actual. |

### Inscribirse o reactivar: `POST /events/{event}/registrations`

Solo permite eventos con estado `published`. Si el estudiante ya tiene una
inscripción `active` para ese evento, responde `409`. Si el cupo activo
alcanzó `capacity`, responde `409`. Si existe una inscripción `cancelled`
previa del mismo estudiante para el evento, la reactiva (`registered_at`
actual y `cancelled_at` nulo) y responde `200`; si no existe, crea una nueva
fila `active` y responde `201`.

### Cancelar: `DELETE /events/{event}/registrations`

Busca la inscripción `active` del estudiante de la sesión para ese evento. Si
no existe o ya estaba cancelada, responde `404`. Nunca borra la fila: cambia
el estado a `cancelled` y registra `cancelled_at`. Responde `200` y libera un
cupo.

### Lista de inscritos: `GET /events/{event}/registrations`

Solo el organizador que administra la comunidad del evento (tabla
`community_organizers`) puede consultarla; en caso contrario responde `403`.
Devuelve únicamente inscripciones `active`, ordenadas por `registered_at`:

```json
{
  "data": [
    {
      "id": 5,
      "registered_at": "2026-08-11T10:00:00.000000Z",
      "cancelled_at": null,
      "status": { "code": "active", "name": "Active" },
      "student": {
        "id": 2,
        "first_name": "Estudiante",
        "last_name": "PoliLink",
        "email": "student@polilink.test"
      }
    }
  ],
  "summary": {
    "capacity": 50,
    "active_registrations": 1,
    "available_capacity": 49
  }
}
```

### Mis inscripciones: `GET /me/registrations`

Requiere rol `student`. Devuelve solo inscripciones `active` del usuario de la
sesión, ordenadas por `registered_at` descendente, paginadas con
`per_page=12` por defecto (mínimo `1`, máximo `50`). Cada elemento incluye el
evento completo mediante el recurso de eventos existente; un evento cancelado
no modifica la inscripción.

### Errores de inscripciones

| Código | Situación |
| --- | --- |
| `401` | No existe una sesión autenticada. |
| `403` | El usuario no tiene el rol requerido o el organizador no administra la comunidad del evento. |
| `404` | Cancelar una inscripción inexistente o ya cancelada. |
| `409` | Inscripción duplicada, evento cancelado o cupo agotado. |

Las reglas de dominio detalladas están en
`docs/backend/DARWIN_REGISTRATIONS_HANDOFF.md`.
