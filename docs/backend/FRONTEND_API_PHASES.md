# Fases de integración del frontend de PoliLink

**Estado:** integración incremental; las Fases 1 y 2 están implementadas en
código, pero aún requieren verificación con servicios locales.
**Documento canónico:** este archivo describe el trabajo pendiente para
conectar React con la API Laravel. Los detalles exactos de cuerpos, respuestas
y códigos HTTP se mantienen en [`docs/api/API.md`](../api/API.md).

## Línea base actual

- El backend tiene en código autenticación local con Sanctum, comunidades,
  catálogo, gestión de eventos e inscripciones.
- El frontend ya tiene router, shell visual, cliente HTTP, estado de sesión y
  una primera experiencia de autenticación en `frontend/src/features/auth/`.
- Existen las rutas `/iniciar-sesion` y `/registrarse`, formularios con React Hook Form y
  Zod, redirecciones internas seguras, manejo de errores de Laravel, logout y
  menú de usuario según sesión/rol.
- La Fase 2 ya integra en código el catálogo público, búsqueda con debounce,
  filtros URL-backed, datos de referencia, paginación numerada y detalle de
  evento en `/eventos` y `/eventos/:eventId`. La ruta `/` conserva la landing.
- Todavía no existe una integración completa del organizador, inscripciones ni
  de todos los estados de sus recorridos.
- La verificación en ambiente real con MySQL, Laravel y Vite debe registrarse
  por separado; la existencia de código o documentación no la reemplaza.
- Por lo tanto, las fases restantes de integración frontend permanecen
  pendientes hasta que sus pantallas y recorridos funcionen; una API marcada
  como implementada no significa que la experiencia React esté terminada.
- Las rutas visibles del navegador usan español; los nombres de código se
  mantienen en inglés. Los endpoints `/api/...` conservan el contrato backend.

## Responsabilidades

| Área | Responsable principal |
| --- | --- |
| Catálogo, búsqueda, filtros y detalle de eventos | Gabriel Tumbaco |
| Crear, editar y cancelar eventos desde el organizador | Gabriel Tumbaco |
| Inscribirse, cancelar/reactivar y consultar mis inscripciones | Darwin Díaz |
| Consultar inscritos y cupos disponibles | Darwin Díaz |
| Autenticación, shell visual, API client, estados comunes y evidencia | Compartida |

Cada integrante debe cubrir su flujo tanto en frontend como en backend. No se
añaden aprobación administrativa, autenticación institucional, pagos, correo,
calendario, códigos QR ni validación de asistencia.

Las tablas internas no generan pantallas CRUD generales. El backend ya expone
un panel futuro para que el rol `admin` mantenga categorías, modalidades y
ubicaciones; roles, estados y relaciones de responsabilidad permanecen
controlados por el backend. La interfaz de administración se implementará en
una fase separada.

## Fases generales

### Fase 0 — Línea base y contrato

Documentar la estructura actual, agrupar las APIs existentes por experiencia,
confirmar responsables y registrar dependencias. Esta fase evita marcar como
terminada una API cuando aún no existe una pantalla integrada.

### Fase 1 — Fundación compartida y sesión

**Estado actual:** `Implemented` para la interfaz y la integración preparada;
`Verified` queda pendiente para la ejecución navegador → Laravel.

Ya están implementados el cliente con cookies y CSRF, errores tipados, estado de
sesión, mutaciones de login/registro/logout, guards reutilizables, las pantallas
`/iniciar-sesion` y `/registrarse`, validación de correos `@espol.edu.ec`, confirmación de
contraseña, redirecciones internas seguras y el menú de sesión del encabezado.
La prueba con MySQL, Laravel y Vite debe registrarse por separado;
la existencia de estos componentes no la reemplaza.

La navegación hacia las pantallas protegidas de catálogo, organizador e
inscripciones se completará en las fases de sus respectivos dominios.

La fundación de la SPA cubre la estructura general, navegación, estilos
compartidos, cliente HTTP, sesión Sanctum, registro/login/logout, roles y
manejo común de carga, errores y sesión expirada. La verificación de estos
recorridos con los servicios locales queda pendiente.

### Fase 2 — Descubrimiento público

**Estado actual:** `Implemented` en código; `Verified` queda pendiente de
ejecutar React → Laravel con los servicios locales.

La landing se conserva en `/` y el catálogo público se encuentra en `/eventos`.
La integración consume el contrato existente de `GET /events`,
`GET /events/{event}`, categorías, modalidades y comunidades. Incluye búsqueda
con debounce de 300 ms, filtros por fecha/categoría/modalidad/comunidad
persistidos en la URL, paginación numerada, tarjetas enlazadas al detalle,
formateo local de fechas `es-EC`, cupos visibles y estados de carga, error y
catálogo vacío. En móvil los filtros se muestran en un Sheet de shadcn; en
escritorio se muestran como controles inline.

Esta fase es deliberadamente de solo lectura. La inscripción, cancelación de
inscripciones y publicación de eventos quedan para las fases 3 y 4. No fueron
necesarios cambios funcionales adicionales en el backend para implementar este
alcance;
debe verificarse que el contrato y los datos sembrados estén disponibles en el
ambiente local.

### Fase 3 — Experiencia del organizador

**Contrato backend:** `Implemented`; **integración frontend:** `Planned`.

El contrato de esta fase está cerrado en `docs/api/API.md`: onboarding de
comunidades, comunidades administradas, eventos propios paginados, creación
multipart con imagen opcional, edición parcial, reemplazo/eliminación de
imagen y cancelación. El backend aplica la relación
`community_organizers`, acepta únicamente catálogos activos para altas y
ediciones, conserva eventos cancelados en el dashboard y devuelve
`image_url` nullable.

La implementación frontend se dividirá en subfases verticales. Cada una debe
dejar un recorrido pequeño y verificable antes de iniciar la siguiente; no se
añaden endpoints nuevos ni un panel administrativo en esta fase.

#### Fase 3.1 — Fundación del organizador

- Crear la ruta protegida `/organizador`, guard de sesión y layout de la
  experiencia.
- Añadir el cliente API de comunidades, claves de consulta y estados comunes
  de carga, sesión expirada y error.

**Salida:** el usuario autenticado puede entrar al área correcta del
organizador.

#### Fase 3.2 — Comunidades

**Estado:** `Implemented` en código; `Verified` queda pendiente de la
verificación navegador → Laravel.

- Consumir `GET /me/communities` y mostrar las comunidades administradas.
- Implementar estado vacío y formulario para `POST /communities`.
- Actualizar la sesión y la navegación cuando un estudiante crea su primera
  comunidad y obtiene el rol `organizer`.
- Permitir el acceso autenticado de estudiantes al onboarding y mostrar el
  formulario inline sin comunidades; usar un `Dialog` para comunidades
  adicionales.

**Salida:** un usuario autenticado puede convertirse en organizador desde la
interfaz y el dashboard refleja la comunidad creada.

#### Fase 3.3 — Panel de eventos

- Consumir `GET /me/events` con paginación.
- Mostrar eventos propios, estados `published`/`cancelled`, cupos, comunidad e
  imagen.
- Cubrir estados de carga, vacío, error y paginación.

**Salida:** el organizador puede revisar su historial de eventos.

#### Fase 3.4 — Crear evento

- Crear el formulario con React Hook Form y Zod.
- Cargar categorías, modalidades, ubicaciones y comunidades administradas.
- Enviar `multipart/form-data` con imagen opcional y mostrar errores `422`.
- Invalidar o actualizar la lista después de publicar.

**Salida:** el organizador puede publicar un evento completo.

#### Fase 3.5 — Editar evento

- Reutilizar el formulario para editar mediante `PATCH /events/{event}`.
- Permitir cambios de comunidad únicamente entre comunidades administradas.
- Bloquear visualmente eventos cancelados y manejar respuestas `409`.

**Salida:** el organizador puede corregir eventos activos.

#### Fase 3.6 — Gestión de imágenes

- Añadir preview local, estado de subida y errores.
- Implementar reemplazo y eliminación mediante los endpoints de imagen.
- Manejar correctamente `image_url` nullable y refrescar las consultas.

**Salida:** el organizador puede administrar la portada sin afectar el resto
del formulario.

#### Fase 3.7 — Cancelación y estabilización

- Añadir confirmación antes de `PATCH /events/{event}/cancel`.
- Reflejar el estado cancelado sin eliminar el evento.
- Verificar permisos `403`, conflictos `409`, validaciones `422` y el recorrido
  navegador → Laravel → MySQL.
- Registrar evidencia y actualizar README, API y bitácora.

**Salida:** la experiencia del organizador queda verificada y lista para la
fase de inscripciones del estudiante.

### Fase 4 — Experiencia del estudiante

Integrar inscripción, cancelación, reactivación, disponibilidad de cupos y
consulta de inscripciones activas.

### Fase 5 — Inscritos y capacidad

Integrar la vista del organizador para consultar inscritos, resumen de cupos,
permisos y actualización coherente después de cada cambio.

### Fase 6 — Integración y entrega

Ejecutar los recorridos completos navegador → Laravel → MySQL, cubrir respuestas
`401`, `403`, `404`, `409` y `422`, registrar evidencia, actualizar README/API/
bitácora y revisar la propuesta LaTeX en Overleaf.

## Plantilla para documentar cada fase

Cada fase detallada debe incluir objetivo, responsables, prerrequisitos, APIs,
pantallas y flujo, estados y errores, criterios de aceptación, evidencia
requerida y estado (`Planned`, `In progress`, `Implemented`, `Verified` o
`Blocked`). Los nombres de componentes, tipos, rutas internas y casos de
prueba se decidirán al comenzar la fase correspondiente.

## Definición de frontend completo

PoliLink podrá declararse completo cuando todos los flujos asignados funcionen
desde React con sesión real, persistencia en MySQL, autorización y estados de
interfaz correctos; los recorridos hayan sido verificados; y la documentación,
capturas y propuesta reflejen únicamente comportamiento comprobado.

## Referencias

- `docs/CONTEXT/PROJECT_CONTEXT.md`
- `docs/api/API.md`
- `docs/api/POSTMAN.md`
- `backend/routes/api.php`
