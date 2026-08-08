# PoliLink

Proyecto académico de la asignatura Lenguajes de Programación.

PoliLink será una plataforma web para centralizar la publicación, consulta e inscripción a eventos organizados por comunidades estudiantiles de ESPOL.

## Estado del repositorio

Este repositorio contiene el molde inicial del proyecto. La infraestructura está configurada, pero las funcionalidades asignadas a los integrantes todavía no están implementadas.

Darwin y Gabriel desarrollarán posteriormente sus respectivos módulos:

- Gestión y consulta de eventos.
- Inscripción, cancelación de inscripción, consulta de inscritos y cupos.

## Estructura del proyecto

    polilink/
    ├── backend/                  # API y servidor Laravel con PHP
    │   ├── app/                  # Código de la aplicación
    │   ├── database/             # Migraciones, factories y seeders
    │   ├── routes/               # Rutas web y API
    │   ├── tests/                # Pruebas automatizadas
    │   └── README.md             # Instrucciones específicas del backend
    ├── frontend/                 # Interfaz React con TypeScript
    │   ├── public/               # Recursos públicos
    │   ├── src/                  # Componentes y código de la interfaz
    │   └── README.md             # Instrucciones específicas del frontend
    ├── docs/                     # Documentación técnica y bitácora
    ├── .env.example              # Ejemplo de configuración general
    └── .gitignore                # Archivos que no deben subirse

## Tecnologías

- Backend: PHP 8.3+, Laravel 13 y Composer.
- Frontend: React, TypeScript, Vite y Node.js.
- Base de datos prevista: MySQL, de acuerdo con la propuesta del proyecto.
- Control de versiones: Git y GitHub.

## Requisitos para ejecutar el proyecto

Instalar previamente:

- PHP 8.3 o superior.
- Composer.
- Node.js y npm.
- MySQL para la configuración definida en el backend.

Las carpetas vendor/ y node_modules/ no se incluyen en el repositorio. Se generan localmente a partir de composer.lock y package-lock.json.

## Instalación del backend

Desde la carpeta raíz:

    cd backend
    composer install
    cp .env.example .env
    php artisan key:generate

Crear una base de datos MySQL llamada polilink y verificar las variables DB_* del archivo .env. Luego ejecutar:

    php artisan migrate
    php artisan db:seed
    php artisan test
    php artisan serve

El backend quedará disponible en http://localhost:8000.

Actualmente solo existe el endpoint técnico:

    GET http://localhost:8000/api/health

## Instalación del frontend

En otra terminal:

    cd frontend
    npm install
    npm run lint
    npm run build
    npm run dev

El frontend quedará disponible en la URL que muestre Vite, normalmente http://localhost:5173.

## Documentación

- Plan del primer avance: docs/PLAN_PRIMER_AVANCE.md
- Bitácora de desarrollo: docs/BITACORA.md
- Contrato propuesto de la API: docs/API.md
- Documentación del backend: backend/README.md
- Documentación del frontend: frontend/README.md
- La propuesta original se conserva en el proyecto de trabajo; este repositorio contiene el molde técnico para comenzar el desarrollo.

## Alcance académico

El proyecto se desarrollará progresivamente. La autenticación institucional, los pagos, el correo, el calendario institucional, los códigos QR y la validación de asistencia están fuera del alcance inicial.
