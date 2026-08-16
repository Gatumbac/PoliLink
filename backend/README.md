# Backend de PoliLink

API REST de PoliLink, desarrollada con Laravel 13, PHP y MySQL.

## Inicio recomendado: PHP en el host y MySQL en Docker

Desde la raíz del repositorio, iniciar solo la base de datos:

```bash
docker compose up -d mysql
```

Luego, desde `backend/`, instalar las dependencias y crear la configuración
local si todavía no existe:

```bash
composer install
cp .env.example .env
php artisan key:generate
```

En `.env`, usar la conexión hacia el puerto publicado por Docker:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=polilink
DB_USERNAME=polilink
DB_PASSWORD=polilink
```

Para que React en `http://localhost:5173` use autenticación local mediante
cookies, conservar también:

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

Finalmente:

```bash
php artisan migrate
php artisan storage:link
php artisan serve
```

La API quedará disponible en `http://localhost:8000`.

## Estructura relevante

```text
backend/
├── app/                 # Modelos, controladores, solicitudes y servicios
├── bootstrap/           # Configuración de arranque de Laravel
├── database/migrations/ # Estructura de tablas
├── database/seeders/    # Datos de prueba
├── routes/api.php       # Endpoints REST de PoliLink
├── routes/web.php       # Rutas web de Laravel
└── tests/               # Pruebas automatizadas
```

## Modelo de datos

Las tablas principales son:

- users: cuentas locales con el indicador global `is_admin`.
- communities: clubes u organizaciones responsables de eventos.
- community_memberships: relación única entre un usuario y una comunidad, con
  rol `member`, `organizer` o `tutor` y estado de membresía.
- events: información, capacidad, modalidad, estado e imagen de portada
  opcional de cada evento, relacionada directamente con una comunidad.
- registrations: relación entre usuarios y eventos, con restricción de
  inscripción duplicada.

Para recrear la base local con datos de prueba:

    php artisan migrate:fresh --seed

El seeder crea los usuarios organizer@espol.edu.ec, student@espol.edu.ec y
admin@espol.edu.ec, asigna una membresía de organizador y otra de miembro,
además de una comunidad, un evento y una inscripción. La cuenta demo de
administración usa la contraseña `admin`.

## Estado

Están implementados los modelos, migraciones, catálogos, gestión de eventos,
panel temporal y autenticado de organizador, onboarding de comunidades y
autenticación local con Laravel Sanctum. También están implementadas las
inscripciones autenticadas: registrar, cancelar y reactivar una inscripción,
validar cupos y duplicados, consultar inscritos como organizador responsable y
consultar las inscripciones activas del usuario. La cuenta con `is_admin` puede
administrar categorías, modalidades y ubicaciones mediante las rutas protegidas
de catálogo; los estados del sistema no se editan desde la API.

## Provisión adicional del administrador

La cuenta demo inicial se crea automáticamente con `migrate:fresh --seed`:

    admin@espol.edu.ec / admin

Para habilitar la administración global de otra cuenta ESPOL sin cambiar su
contraseña, se puede usar:

    php artisan polilink:provision-admin admin@espol.edu.ec

El comando solicita la contraseña solo cuando debe crear una cuenta nueva. La
contraseña `admin` es únicamente para la demo académica; no debe reutilizarse
en producción. No se asigna `is_admin` desde el registro público y la
administración global no otorga permisos de organizador automáticamente.

Consultar `../docs/api/API.md` para el contrato completo y
`../docs/api/POSTMAN.md` para el recorrido manual con cookies de Sanctum.
