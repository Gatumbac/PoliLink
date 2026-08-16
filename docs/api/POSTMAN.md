# Pruebas manuales con Postman

Importa el archivo `docs/api/PoliLink.postman_collection.json` desde
**Import** y **File**.

## Antes de enviar solicitudes

1. Un humano debe iniciar MySQL y Laravel según backend/README.md.
2. En Postman, ejecuta Obtener cookie CSRF y confirma que responde `204`.
3. La prueba de esa solicitud debe pasar y la variable `xsrfToken` debe dejar
   de aparecer en rojo. Postman conserva las cookies de localhost y la
   colección copia `XSRF-TOKEN` al encabezado necesario para POST, PATCH y
   DELETE.
4. Si la prueba falla, abre **Cookies** en la esquina superior derecha de
   Postman y confirma que, para `localhost`, existen `XSRF-TOKEN` y
   `laravel_session`. No continúes con login hasta que ambas estén presentes.

## Recorrido de Gabriel

1. Ejecuta una ruta del grupo Público.
2. Obtén la cookie CSRF.
3. Ejecuta Login Gabriel y luego Crear mi comunidad y obtener rol organizador.
   Usa un `newCommunityName` único; la colección guarda su ID en `communityId`.
4. Ejecuta Mis comunidades, Crear evento, Editar evento creado y Cancelar
   evento creado.

Crear evento guarda automáticamente el ID retornado en eventId; las dos
solicitudes siguientes usan ese valor.

## Recorrido de Darwin

1. Ejecuta Obtener cookie CSRF.
2. En la carpeta 03, ejecuta Buscar evento Hackathon TAWS; guarda su ID en
   registrationEventId automáticamente.
3. Cambia newStudentEmail por un correo único y ejecuta Registrar estudiante
   nuevo (carpeta 01).
4. Ejecuta Obtener cookie CSRF de nuevo y luego Login estudiante nuevo
   (inscripciones).
5. Ejecuta Inscribirme al evento (`201`), Cancelar mi inscripción (`200`) y
   vuelve a ejecutar Inscribirme al evento para capturar la reactivación
   (`200`).
6. Ejecuta Mis inscripciones.
7. Ejecuta Logout (carpeta 01), Obtener cookie CSRF y luego Login organizador
   semilla.
8. Ejecuta Lista de inscritos para ver los inscritos activos y el summary de
   cupos del evento.

## Datos semilla

- Usuario de la colección: gatumbac@espol.edu.ec y password.
- La comunidad creada obtiene su ID automáticamente; no depende de TAWS ni del ID 1.
- Categoría Hackathon: ID 3.
- Modalidad presencial: ID 1.
- Ubicación Campus Gustavo Galindo: ID 1.
- Usuarios semilla de inscripciones: student@espol.edu.ec y
  organizer@espol.edu.ec, ambos con password. El estudiante semilla ya tiene
  una inscripción activa en Hackathon TAWS, por lo que el recorrido de Darwin
  usa un estudiante nuevo para capturar la inscripción `201`.

Para probar el registro de Gabriel, cambia newStudentEmail por un correo único
en las variables de la colección; ese mismo correo se reutiliza en el
recorrido de Darwin.
