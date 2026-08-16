# Fases de integración del frontend de PoliLink

**Estado:** hoja de ruta de integración.  
**Documento canónico:** este archivo describe el trabajo pendiente para
conectar React con la API Laravel. Los detalles exactos de cuerpos, respuestas
y códigos HTTP se mantienen en [`docs/api/API.md`](../api/API.md).

## Línea base actual

- El backend tiene en código autenticación local con Sanctum, comunidades,
  catálogo, gestión de eventos e inscripciones.
- El frontend es un scaffold inicial: `frontend/src/App.tsx` muestra una
  pantalla estática y `frontend/src/lib/api.ts` contiene solo helpers parciales
  de autenticación, comunidades y dashboard.
- Todavía no existe una integración completa de pantallas, navegación, estados
  de carga/error ni recorridos de usuario en React.
- La verificación en ambiente real con MySQL, Laravel y Vite debe registrarse
  por separado; la existencia de código o documentación no la reemplaza.
- Por lo tanto, las fases de integración frontend permanecen pendientes hasta
  que sus pantallas y recorridos funcionen; una API marcada como implementada
  no significa que la experiencia React esté terminada.

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

Las tablas internas no generan pantallas CRUD. Roles, estados y relaciones de
responsabilidad se administran desde el backend; la interfaz solo expone las
acciones necesarias para la experiencia de estudiantes y organizadores.

## Fases generales

### Fase 0 — Línea base y contrato

Documentar la estructura actual, agrupar las APIs existentes por experiencia,
confirmar responsables y registrar dependencias. Esta fase evita marcar como
terminada una API cuando aún no existe una pantalla integrada.

### Fase 1 — Fundación compartida y sesión

**Estado actual:** `In progress`. La integración no visual con Laravel Sanctum
ya está preparada en React: cliente con cookies y CSRF, errores tipados, estado
de sesión, mutaciones de autenticación y guards reutilizables. Las pantallas de
login/registro, el menú de sesión y la verificación navegador → Laravel quedan
para el siguiente trabajo de interfaz.

Definir la estructura general de la SPA, navegación, estilos compartidos,
cliente HTTP, sesión Sanctum, registro/login/logout, roles y manejo común de
carga, errores y sesión expirada.

### Fase 2 — Descubrimiento público

Integrar catálogo, búsqueda, filtros, paginación, datos de referencia, detalle
de evento, cupos visibles, estados vacío/error y comportamiento responsive.

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
