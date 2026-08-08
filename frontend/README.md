# Frontend de PoliLink

Interfaz web de PoliLink, desarrollada con React, TypeScript y Vite.

## Comandos

```bash
npm install
npm run dev
```

Para validar una compilación de producción:

```bash
npm run build
```

## Estructura relevante

```text
frontend/
├── public/          # Recursos públicos
├── src/components/  # Componentes reutilizables
├── src/hooks/       # Hooks personalizados
├── src/pages/       # Vistas principales
├── src/services/    # Cliente HTTP y acceso a la API
├── src/types/       # Interfaces y tipos TypeScript
├── src/App.tsx      # Componente raíz
└── src/main.tsx     # Punto de entrada
```

## Instalación

Desde esta carpeta:

    npm install
    npm run lint
    npm run build
    npm run dev

## Estado

El frontend está inicializado y muestra la pantalla base de PoliLink. Las vistas de catálogo, detalle, formulario y panel del organizador se implementarán sobre esta base.
