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

## Panel de organizador — implementado

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/organizers/{organizer}/communities` | Comunidades administradas por el organizador. |
| `GET` | `/organizers/{organizer}/events` | Eventos propios, incluidos publicados y cancelados. |

El identificador de la ruta debe pertenecer a un usuario con rol `organizer`.
Las comunidades se ordenan por nombre. Los eventos usan la misma respuesta de
evento anterior, se ordenan por fecha descendente y están paginados con
`per_page=12` por defecto (máximo `50`).

## Inscripciones — pendiente

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/events/{event}/registrations?organizer_id={id}` | Lista inscritos y cupos para el organizador responsable. |
| `POST` | `/events/{event}/registrations` | Inscribe o reactiva a un estudiante con `student_id`. |
| `DELETE` | `/events/{event}/registrations` | Cancela la inscripción activa con `student_id`. |
| `GET` | `/students/{student}/registrations` | Lista las inscripciones activas de un estudiante. |

Las reglas y evidencia requeridas del módulo están documentadas en
`docs/backend/DARWIN_REGISTRATIONS_HANDOFF.md`.
