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
| `POST` | `/events/{event}/image` | Implementado | Reemplaza la imagen de portada de un evento propio. |
| `DELETE` | `/events/{event}/image` | Implementado | Elimina la imagen de portada de un evento propio. |
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

La solicitud puede enviarse como JSON, sin imagen, o como `multipart/form-data`
con los mismos campos y un campo `image` opcional. La imagen debe ser JPEG, PNG
o WebP y pesar como máximo 5 MB.

### Editar: `PATCH /events/{event}`

Requiere sesión Sanctum. Los campos de creación son opcionales. Se puede enviar
`community_id` para mover el evento únicamente a otra comunidad administrada
por el organizador de la sesión. No se puede editar un evento cancelado.

### Imagen de portada

`POST /events/{event}/image` recibe `multipart/form-data` con un campo `image`
obligatorio. Solo el organizador responsable puede reemplazar la imagen y no se
puede modificar un evento cancelado.

`DELETE /events/{event}/image` no recibe cuerpo. Elimina la imagen asociada y
responde con el evento actualizado. La imagen se almacena en el filesystem
público del backend; la API devuelve `image_url`, no la ruta interna del servidor.
Para habilitar la URL pública en una instalación local o desplegada, ejecutar:

```bash
php artisan storage:link
```

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
    "image_url": null,
    "starts_at": "2026-08-20T14:00:00.000000Z",
    "capacity": 50,
    "available_capacity": 49,
    "category": { "id": 3, "code": "hackathon", "name": "Hackatón" },
    "modality": { "id": 1, "code": "in_person", "name": "Presencial" },
    "location": { "id": 1, "name": "Campus Gustavo Galindo", "description": null },
    "community": { "id": 1, "name": "TAWS", "description": "..." },
    "status": { "code": "published", "name": "Publicado" }
  }
}
```

La lista añade la metadata de paginación de Laravel. Los cupos disponibles se
calculan como capacidad menos inscripciones con estado `active`.

### Errores de eventos

| Código | Situación |
| --- | --- |
| `422` | Filtros o cuerpo inválidos; por ejemplo, cupo menor que uno o una imagen no compatible. |
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

## Administración de catálogos — implementado

Estas rutas requieren una sesión Sanctum y el rol `admin`. En esta primera
versión, el rol administra únicamente categorías, modalidades y ubicaciones.
No puede administrar usuarios, roles, comunidades, eventos, inscripciones ni
moderación.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/admin/catalog/event-categories` | Lista categorías activas e inactivas. |
| `POST` | `/admin/catalog/event-categories` | Crea una categoría activa. |
| `PATCH` | `/admin/catalog/event-categories/{eventCategory}` | Edita el nombre o activa/desactiva una categoría. |
| `GET` | `/admin/catalog/event-modalities` | Lista modalidades activas e inactivas. |
| `POST` | `/admin/catalog/event-modalities` | Crea una modalidad activa. |
| `PATCH` | `/admin/catalog/event-modalities/{eventModality}` | Edita el nombre o activa/desactiva una modalidad. |
| `GET` | `/admin/catalog/locations` | Lista ubicaciones activas e inactivas. |
| `POST` | `/admin/catalog/locations` | Crea una ubicación activa. |
| `PATCH` | `/admin/catalog/locations/{location}` | Edita la ubicación o activa/desactiva una ubicación. |

Las categorías y modalidades reciben `code` y `name` al crearse. El `code` es
inmutable; únicamente el nombre puede editarse. Las ubicaciones reciben
`name` y una `description` opcional. No existen rutas `DELETE`: desactivar una
fila conserva los eventos históricos que la utilizan y la excluye de los
formularios y filtros públicos. Los catálogos `event_statuses`,
`registration_statuses` y `roles` permanecen controlados por el sistema.

La cuenta demo inicial se crea mediante `php artisan migrate:fresh --seed` con
`admin@espol.edu.ec` y contraseña `admin`. Para promover otra cuenta se puede
usar `php artisan polilink:provision-admin correo@espol.edu.ec`; no se puede
asignar el rol desde el registro público.

## Autenticación local — implementado

La SPA usa Laravel Sanctum con cookies de sesión y CSRF. No se emiten tokens
Bearer ni se integra ninguna cuenta institucional.
Para una explicación conceptual del flujo, consulta
[`SANCTUM_SESSION_AUTH.md`](SANCTUM_SESSION_AUTH.md).

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/sanctum/csrf-cookie` | Inicializa las cookies CSRF y de sesión. |
| `POST` | `/auth/register` | Registra un usuario local con rol `student`. |
| `POST` | `/auth/login` | Inicia la sesión local. |
| `DELETE` | `/auth/logout` | Cierra la sesión actual. Requiere sesión. |
| `GET` | `/auth/me` | Devuelve el usuario y sus roles. Requiere sesión. |

Las últimas cuatro rutas usan el prefijo `/api`. El registro recibe
`first_name`, `last_name`, `email`, `password` y `password_confirmation`. El
email debe terminar exactamente en `@espol.edu.ec` y la contraseña debe
coincidir con `password_confirmation`. El servidor asigna exclusivamente el
rol `student`; no acepta roles enviados por el navegador. Login recibe `email`
y `password`, exige también el dominio `@espol.edu.ec` y aplica un máximo de
cinco intentos fallidos por minuto para el mismo email e IP.

`GET /auth/me`, `POST /auth/login` y `POST /auth/register` responden:

```json
{
  "data": {
    "id": 2,
    "first_name": "Estudiante",
    "last_name": "PoliLink",
    "email": "student@espol.edu.ec",
    "roles": [{ "code": "student", "name": "Estudiante" }]
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

## Experiencia del organizador — implementado

Estas rutas requieren una sesión autenticada mediante Sanctum. La identidad se
obtiene desde la cookie de sesión; el cliente no envía un usuario ni roles.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/communities` | Crea una comunidad y convierte al usuario actual en organizador. |
| `GET` | `/me/communities` | Lista las comunidades administradas por la sesión actual. |
| `GET` | `/me/events` | Lista sus eventos, incluidos los cancelados. |

La relación de responsabilidad se resuelve mediante `community_organizers`.
Un organizador solo puede crear, editar, cancelar o administrar imágenes de
eventos pertenecientes a una comunidad que administra. El backend nunca acepta
`user_id`, `organizer_id` ni `community_organizer_id` enviados por el cliente.

### Crear una comunidad: `POST /communities`

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

Respuesta:

```json
{
  "data": {
    "id": 2,
    "name": "Club de Robótica",
    "description": "Comunidad de robótica de ESPOL."
  }
}
```

### Listar comunidades administradas: `GET /me/communities`

Devuelve un arreglo sin paginación, ordenado por `name` ascendente. Cada
elemento contiene `id`, `name` y `description`. Si no hay comunidades, la
respuesta es:

```json
{ "data": [] }
```

### Listar eventos administrados: `GET /me/events`

Las rutas `/api/me/communities` y `/api/me/events` devuelven listas vacías si
el usuario aún no administra ninguna comunidad. Los eventos se ordenan por
fecha descendente y usan paginación con `per_page=12` por defecto y máximo
`50`. Acepta `page` y `per_page`; un valor inválido devuelve `422` con errores
por campo.

La respuesta reutiliza `EventResource`: incluye `image_url` nullable, comunidad,
catálogo, estado, capacidad y `available_capacity`. Incluye además la metadata
estándar de paginación (`links` y `meta`) de Laravel. Los eventos `cancelled`
se conservan para que el organizador pueda distinguir historial y estado, pero
no aparecen en el catálogo público.

### Estados y errores del flujo del organizador

| Código | Situación |
| --- | --- |
| `401` | No existe una sesión Sanctum. |
| `403` | Falta el rol `organizer` o el usuario no administra la comunidad/evento. |
| `404` | El recurso solicitado no existe; los detalles públicos cancelados también responden `404`. |
| `409` | Se intenta editar, cambiar la imagen o cancelar un evento ya cancelado. |
| `422` | Cuerpo, paginación, catálogo o archivo inválido. |

Los errores `422` mantienen el formato de validación de Laravel con un objeto
`errors` indexado por nombre de campo. Las operaciones de escritura devuelven
el recurso actualizado dentro de `data`; la creación de comunidad y evento
responde `201`, y las actualizaciones responden `200`.

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
      "status": { "code": "active", "name": "Activa" },
      "student": {
        "id": 2,
        "first_name": "Estudiante",
        "last_name": "PoliLink",
        "email": "student@espol.edu.ec"
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
