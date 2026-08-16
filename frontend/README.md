# Frontend de PoliLink

Interfaz web de PoliLink, desarrollada con React, TypeScript y Vite.

## Comandos

Desde esta carpeta:

```bash
npm install
npm run dev
```

Comandos de calidad y producción:

```bash
npm run format
npm run lint
npm run typecheck
npm run test:run
npm run build
```

`npm run check` combina Biome y TypeScript. El frontend usa Biome para
formateo/linting y Vitest, Testing Library y MSW para pruebas. No se debe
incluir `any`, tipos débiles (`{}`, `object`, `Function`) ni aserciones no nulas.

## Estructura relevante

```text
frontend/
├── public/                  # Recursos públicos
├── src/app/                 # Router, providers, layout y páginas de aplicación
├── src/features/            # Módulos por dominio y sus contratos API
│   ├── auth/
│   ├── communities/
│   └── events/
├── src/shared/              # Cliente HTTP, configuración y errores compartidos
├── src/test/                # Setup de Vitest y servidor MSW
├── src/App.tsx              # Composición de providers y router
└── src/main.tsx             # Punto de entrada
```

Cada feature debe mantener juntas sus páginas, componentes, hooks, esquemas
Zod y módulos de API. `src/shared/` solo contiene piezas reutilizadas por más
de un dominio. Las llamadas protegidas conservan las cookies de Sanctum y el
flujo CSRF del backend.

## Estado

La base de la aplicación está configurada con React Router, React Query,
validación Zod, formularios React Hook Form y una política TypeScript estricta.
Las vistas de catálogo, detalle, autenticación, registro y panel del
organizador todavía se implementarán sobre este scaffold.
