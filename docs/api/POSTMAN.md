# Pruebas manuales con Postman

Importa el archivo `docs/api/PoliLink.postman_collection.json` desde
**Import** y **File**.

## Antes de enviar solicitudes

1. Un humano debe iniciar MySQL y Laravel según backend/README.md.
2. En Postman, ejecuta Obtener cookie CSRF.
3. Postman conserva las cookies de localhost y la colección copia XSRF-TOKEN
   al encabezado necesario para POST, PATCH y DELETE.

## Recorrido de Gabriel

1. Ejecuta una ruta del grupo Público.
2. Obtén la cookie CSRF.
3. Inicia sesión con Login organizador semilla.
4. Ejecuta Mis comunidades, Crear evento, Editar evento creado y Cancelar
   evento creado.

Crear evento guarda automáticamente el ID retornado en eventId; las dos
solicitudes siguientes usan ese valor.

## Datos semilla

- Organizador: organizer@polilink.test y password.
- Estudiante: student@polilink.test y password.
- Comunidad TAWS: ID 1.
- Categoría Hackathon: ID 3.
- Modalidad presencial: ID 1.
- Ubicación Campus Gustavo Galindo: ID 1.

Para probar el registro, cambia newStudentEmail por un correo único en las
variables de la colección. Las rutas de inscripciones aparecerán cuando Darwin
integre su módulo autenticado.
