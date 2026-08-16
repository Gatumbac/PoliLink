# Fases de desarrollo del backend de PoliLink

**Estado:** base funcional implementada; evolución de membresías pendiente.

El backend usa Laravel, MySQL y sesiones Sanctum. Los organizadores publican,
editan y cancelan eventos directamente; no existe aprobación administrativa de
eventos. La autenticación institucional y otras integraciones permanecen fuera
del alcance.

## Estado implementado

1. **Persistencia limpia:** `users.is_admin`, comunidades, roles comunitarios,
   estados de membresía, eventos, catálogos e inscripciones.
2. **Modelo de pertenencia:** `community_memberships` relaciona un usuario con
   una comunidad y un rol principal: `member`, `organizer` o `tutor`.
3. **Eventos:** `events.community_id` identifica la comunidad; solo una
   membresía `active/organizer` puede crear, editar, cancelar o administrar
   imágenes.
4. **Inscripciones:** `registrations.user_id` permite a cualquier usuario
   autenticado inscribirse, cancelar y reactivar su registro sin duplicados ni
   sobrecupo.
5. **Administración global:** `users.is_admin` protege exclusivamente el
   catálogo de categorías, modalidades y ubicaciones.
6. **Calidad:** migraciones, seeders, policies, resources y pruebas feature
   están alineados con el esquema nuevo.

## Próximas fases

### Fase A — Directorio de comunidades

Agregar búsqueda y perfil público sin modificar el propósito de
`GET /communities`, que continúa alimentando filtros de eventos publicados.

### Fase B — Solicitudes de membresía

Agregar solicitudes `pending/member`, cancelación, reactivación y consulta de
la membresía propia. No se permitirá que el cliente asigne roles o estados.

### Fase C — Aprobación comunitaria

Permitir que únicamente un `organizer` activo de la comunidad apruebe,
rechace o asigne el rol `tutor`. Este flujo no aprueba eventos.

### Fase D — Integración frontend

Conectar `/comunidades`, perfiles, solicitudes, `/mis-comunidades` y la bandeja
de organizador con los contratos backend aprobados.

### Fase E — Propuestas de nuevas comunidades

Decidir si la creación directa continúa o si se introduce una
`community_creation_request`. No implementar validación institucional sin una
fuente autorizada y aprobación explícita del alcance.

## Validación de entrega

Desde `backend/`:

```bash
php artisan migrate:fresh --seed
php artisan test
vendor/bin/pint --test
```

Los agentes no inician ni detienen MySQL, Laravel o Vite. La verificación
navegador → Laravel → MySQL debe registrarse como evidencia separada.
