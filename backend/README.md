# Backend de PoliLink

API REST de PoliLink, desarrollada con Laravel 13, PHP y MySQL.

## Comandos

```bash
composer install
cp .env.example .env
php artisan key:generate
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

El framework está instalado y cuenta únicamente con el endpoint de comprobación `GET /api/health`. Los modelos, migraciones y operaciones de eventos e inscripciones quedan pendientes para su implementación por parte de los integrantes responsables.
