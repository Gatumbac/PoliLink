# Documentación de PoliLink

Este directorio separa el contexto académico, la propuesta entregable, el
contrato de la API y las guías de implementación.

## Ubicaciones principales

| Ubicación | Contenido |
| --- | --- |
| `CONTEXT/PROJECT_CONTEXT.md` | Alcance aprobado, responsables y restricciones del proyecto. |
| `latex/` | Fuente vigente de la propuesta (`main.tex`) e imágenes para Overleaf. |
| `api/API.md` | Endpoints disponibles y pendientes. |
| `api/SANCTUM_SESSION_AUTH.md` | Fundamentos de sesiones y CSRF con Sanctum. |
| `api/POSTMAN.md` | Guía para probar la API manualmente. |
| `api/PoliLink.postman_collection.json` | Colección importable de Postman. |
| `backend/` | Diseño de base de datos, fases del backend y handoff de Darwin. |
| `backend/COMMUNITY_MEMBERSHIP_FLOW.md` | Propuesta de descubrimiento, membresías y solicitudes de unión. |
| `PLAN_PRIMER_AVANCE.md` | Plan funcional del primer avance. |
| `BITACORA.md` | Historial de decisiones y avances. |

## Propuesta LaTeX

La única fuente vigente de la propuesta es `latex/main.tex`. Las imágenes se
guardan en `latex/images/` y se compila en Overleaf; no se versionan archivos
generados como PDF, AUX o LOG.
