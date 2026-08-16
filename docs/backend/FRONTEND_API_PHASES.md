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
- Existen las rutas `/login` y `/register`, formularios con React Hook Form y
  Zod, redirecciones internas seguras, manejo de errores de Laravel, logout y
  menú de usuario según sesión/rol.
- La Fase 2 ya integra en código el catálogo público, búsqueda con debounce,
  filtros URL-backed, datos de referencia, paginación numerada y detalle de
  evento en `/events` y `/events/:eventId`. La ruta `/` conserva la landing.
- Todavía no existe una integración completa del organizador, inscripciones ni
  de todos los estados de sus recorridos.
- La verificación en ambiente real con MySQL, Laravel y Vite debe registrarse
  por separado; la existencia de código o documentación no la reemplaza.
- Por lo tanto, las fases restantes de integración frontend permanecen
  pendientes hasta que sus pantallas y recorridos funcionen; una API marcada
  como implementada no significa que la experiencia React esté terminada.

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
`/login` y `/register`, validación de correos `@espol.edu.ec`, confirmación de
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

La landing se conserva en `/` y el catálogo público se encuentra en `/events`.
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

Integrar onboarding de comunidad, panel de comunidades/eventos y los flujos de
crear, editar y cancelar eventos, respetando propiedad y estados del backend.

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
