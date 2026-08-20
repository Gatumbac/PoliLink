# Guía para las capturas finales del informe

El informe final debe incluir una sola evidencia frontend por integrante. Para
mostrar mejor el recorrido de la aplicación se agregarán tres vistas generales
complementarias, con un máximo de cinco imágenes en total. Las capturas deben
mostrar la aplicación ejecutándose, sin código, DevTools, credenciales,
terminales ni información personal visible.

## Preparación

1. Actualizar el repositorio en la rama `main`.
2. Iniciar MySQL, Laravel y Vite siguiendo las instrucciones del README raíz.
3. Usar datos de demostración preparados: una comunidad activa, una solicitud
   de creación de comunidad pendiente y al menos un evento publicado.
4. Abrir el frontend en el navegador y usar una ventana de aproximadamente
   1440 x 900 px.
5. Verificar que las imágenes, nombres, fechas, cupos y estados visibles sean
   datos de prueba apropiados para compartir.
6. Tomar capturas en formato PNG, con el navegador limpio y sin el cursor
   ocultando botones o texto.

## Captura de Gabriel

Guardar como:

```text
docs/latex/images/resultado-gabriel-landing.png
```

Pasos:

1. Abrir `/` sin iniciar sesión.
2. Esperar a que carguen las métricas, eventos y comunidades.
3. Mostrar el hero, los CTA `Explorar eventos` y `Ver comunidades`, y la
   sección de contenido público en una vista legible.
4. Si la página completa no cabe con buena legibilidad, tomar una captura
   enfocada en el hero, las métricas y el inicio de `Explora lo que está
   pasando`.
5. Confirmar que la captura no muestre skeletons, errores ni catálogos vacíos.

La evidencia demuestra la landing pública, la navegación hacia eventos y
comunidades y la integración de datos públicos.

## Captura de Darwin

Guardar como:

```text
docs/latex/images/resultado-darwin-admin-comunidades.png
```

Pasos:

1. Iniciar sesión con una cuenta que tenga permisos administrativos.
2. Abrir `/admin/solicitudes-comunidades`.
3. Asegurar que exista una solicitud pendiente visible.
4. Mostrar la información de la comunidad y las acciones de aprobar o
   rechazar.
5. Mantener la captura en un estado seguro antes de confirmar una mutación;
   no es necesario ejecutar la aprobación durante la evidencia.
6. Confirmar que el nombre, estado, botones y paginación sean legibles.

La evidencia demuestra el panel administrativo y la revisión de solicitudes de
creación de comunidades implementada por Darwin.

## Capturas generales

Estas tres imágenes son complementarias. No se presentan como una segunda
evidencia de Gabriel o Darwin.

### Catálogo público

Guardar como:

```text
docs/latex/images/resultado-general-catalogo.png
```

Pasos:

1. Abrir `/eventos` sin iniciar sesión.
2. Mostrar la búsqueda, uno o más filtros y tarjetas de eventos cargadas.
3. Mantener visibles los nombres, fechas y comunidades de demostración.

### Directorio de comunidades

Guardar como:

```text
docs/latex/images/resultado-general-comunidades.png
```

Pasos:

1. Abrir `/comunidades` sin iniciar sesión.
2. Mostrar la búsqueda y varias comunidades activas.
3. Confirmar que las tarjetas permitan reconocer el acceso a sus perfiles.

### Detalle de evento

Guardar como:

```text
docs/latex/images/resultado-general-detalle-evento.png
```

Pasos:

1. Desde `/eventos`, abrir un evento publicado.
2. Mostrar título, descripción, fecha, modalidad, ubicación, comunidad y
   cupos.
3. Si aparece un botón de inscripción, verificar que sea legible y que no se
   muestre información personal.

## Verificación antes de compilar

- [ ] Las cinco rutas o vistas cargan sin errores.
- [ ] Las capturas tienen extensión `.png` y los nombres exactos.
- [ ] No aparecen DevTools, terminales, contraseñas ni datos personales.
- [ ] La imagen de Gabriel muestra la landing final.
- [ ] La imagen de Darwin muestra una solicitud administrativa pendiente.
- [ ] Las capturas se ven nítidas al 100% de zoom.
- [ ] Se agregaron las cinco imágenes dentro de `docs/latex/images/`.
- [ ] Se revisaron visualmente portada, tablas, captions, resultados,
  conclusiones, recomendaciones y referencias si se realizó una compilación.
