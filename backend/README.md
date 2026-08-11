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

- users: usuarios locales con rol student u organizer.
- communities: clubes u organizaciones responsables de eventos.
- events: información, capacidad, modalidad y estado de cada evento.
- registrations: relación entre estudiantes y eventos, con restricción de inscripción duplicada.

Para recrear la base local con datos de prueba:

    php artisan migrate:fresh --seed

El seeder crea los usuarios organizer@polilink.test y student@polilink.test, una comunidad, un evento y una inscripción.

## Estado

Están implementados los modelos, migraciones, catálogos, gestión de eventos,
panel temporal de organizador y autenticación local con Laravel Sanctum. El
módulo de inscripciones permanece asignado a Darwin Díaz. Consultar
`../docs/API.md` para el contrato completo y la prueba manual de autenticación.
