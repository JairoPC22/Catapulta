# Revisión de CatapultaPayment — 27 de octubre de 2026

## Qué se revisó

HTML, CSS, JavaScript propio, idiomas, formulario y plantilla de correo, simulador, calculadora, galería, recuperación de errores, service worker, manifiesto, metadatos y archivos de descubrimiento. También se comprobaron las referencias a imágenes, fuentes, scripts y documentos locales. El paquete Lucide original se conserva como fuente del generador, sin descargarse durante la visita.

## Correcciones principales

- Pestañas de catálogo y soluciones: una lógica compartida, sin temporizadores que reactiven paneles anteriores. Selección ARIA y navegación con flechas, Home y End.
- Idiomas: actualización síncrona, sin transiciones pendientes que mezclen textos. Preferencias protegidas frente a almacenamiento bloqueado. Cambiar idioma ya no convierte un aviso de error activo en un mensaje de éxito.
- Formulario: inicialización inmediata, exclusión de envíos simultáneos, límites de longitud, validación de espacios/correo, errores accesibles, campos deshabilitados mientras se envía y conservación del texto cuando falla el envío. POST y botón deshabilitado hasta inicialización para evitar una entrega accidental por URL si falla JavaScript.
- EmailJS: conexión REST únicamente cuando el usuario envía. Se retiró el SDK externo de la carga inicial. Tiempo máximo de confirmación y mensaje específico cuando no se puede confirmar la entrega. No hay reintentos automáticos.
- Simulador: entrada numérica acotada, cancelación de temporizadores al reiniciar, bloqueo de arrastres simultáneos, cancelación de gestos interrumpidos y controles por teclado. La demostración está identificada como simulación sin cargos reales.
- Calculadora: cancela la animación anterior antes de iniciar otra; los valores finales corresponden a los controles actuales incluso al moverlos rápidamente.
- Galería: una fotografía completa sin recorte, miniaturas y una ficha separada del negocio/equipo. Flechas, deslizamiento táctil y navegación por teclado. Al cerrar el visor ampliado conserva la última foto vista y devuelve el foco a esa imagen. Los bloqueos de desplazamiento se coordinan con el menú móvil.
- Menú móvil: Escape, foco contenido y retirada de los enlaces cerrados del orden de teclado. Etiquetas de tema reales y traducibles, sin texto duplicado por pseudoelementos CSS.
- Rendimiento: sin canvas de partículas ni código de inclinación/revelado inactivo. Los iconos pasan de un paquete de 358.106 bytes y una fuente de 820.316 bytes a 15.450 bytes de JavaScript y 4.604 bytes de SVG/CSS. Cifras de archivos sin compresión; el ahorro de red depende de la caché y compresión del hosting.
- Vídeo: respeta movimiento reducido, ahorro de datos, visibilidad del elemento y de la pestaña.
- Caché: no intercepta POST ni respuestas parciales; límite de recursos adicionales; conserva cachés de otras aplicaciones; errores de almacenamiento no sustituyen una respuesta de red correcta por un fallo.
- Servidor local: rutas inexistentes con 404, métodos no admitidos con 405, URLs inválidas con 400 y rangos de vídeo con 206/416.
- Marca: CatapultaPayment en textos, metadatos y etiquetas. Se conserva el dominio confirmado catapultapay.com y sus correos.
- Portada responsive: se eliminó el conflicto que ocultaba la tarjeta 3D por debajo de 1024 px y dejaba una columna vacía. Se verificó la tarjeta visible, sin desbordamiento horizontal, a 390, 780 y 1280 px.

## Validación

Ejecutar `node --test tests/regression.cjs` para las 10 pruebas de regresión, sin instalar dependencias. Cubren almacenamiento bloqueado, bloqueos de scroll, valores inválidos, reinicio del simulador, datos de envío y errores HTTP, timeout, doble envío, referencias locales, formulario sin GET, fallos de caché, exclusión de POST/rangos y limpieza de caché por aplicación.

Las pruebas del formulario utilizan una respuesta simulada: no se enviaron mensajes reales al equipo. La entrega final depende de la cuenta, plantilla y servicio de EmailJS configurados. La plantilla local no se sincroniza automáticamente con el panel de EmailJS.

En navegador se comprobaron cambios rápidos de idioma y pestañas, una operación completa del simulador y reinicio durante la operación, la calculadora en sus extremos, validación del formulario vacío, traducción de los avisos legales y vista móvil de 390 px. El menú devuelve el foco al cerrarse con Escape y las fotos ampliadas liberan el desplazamiento y devuelven el foco al control que las abrió. No se observó desbordamiento horizontal en estas vistas.

Para regenerar recursos:

- `node tools/build-icons.cjs`
- `node tools/build-legal.cjs`

Para abrir la vista previa: `node preview-server.cjs` y visitar http://127.0.0.1:4173/.

## Ideas de mejora, por prioridad

1. **Cotización guiada en tres pasos:** giro del negocio, volumen mensual y tipo de equipo. Ayuda a solicitar asesoría con información útil sin pedir datos bancarios.
2. **Comparador de equipos:** filtrar por mostrador, movilidad, restaurante y retail, usando las especificaciones verificadas del catálogo.
3. **URLs independientes para español e inglés:** permitir enlaces compartibles y una indexación real por idioma. No basta con traducir en JavaScript sobre una misma URL.
4. **Casos de clientes con contexto:** equipo instalado, necesidad del negocio y resultado autorizado por el cliente, sin porcentajes inventados.
5. **Protección del formulario en el proveedor:** revisar la lista de dominios permitidos de EmailJS y habilitar protección de abuso/CAPTCHA si el tráfico lo requiere. Los controles del navegador no sustituyen límites del proveedor o de un backend.
6. **Medición de conversiones:** definir qué se desea medir antes de instalar analítica y revisar el aviso/consentimiento correspondiente antes de activarla.

## Firma sonora y carga

Se integró una firma sonora original generada con ElevenLabs Sound Effects v2: MP3 estéreo de 2 segundos y 50.187 bytes, servido desde el propio sitio. La reproducción comienza al retirarse el logo de carga, con volumen 0.28, sin bucle y sin retrasar el contenido. Hay entrada explícita con/sin sonido y un control permanente para silenciar o activar; `cpay-sound` recuerda la decisión. Si autoplay está bloqueado, se muestra Escuchar sonido. No se vincula la reproducción a clics ajenos a ese control. La pestaña oculta detiene el sonido sin reanudarlo sola.

Las pruebas completas se ejecutan con `node --test tests/loading.cjs tests/regression.cjs`: 16 casos. Los seis nuevos cubren autoplay bloqueado, entrada explícita sin reproducción duplicada, entrada silenciosa, preferencia guardada, fallos de audio/almacenamiento y detención al ocultar la pestaña. En navegador se verificaron reproducción manual y persistencia del silencio. La procedencia del archivo está en assets/audio/README.md.

## Pendientes de negocio

Los avisos de privacidad, cookies y términos están enlazados, en español e inglés, y expresamente marcados para revisión. Falta confirmar identidad legal completa, domicilio, retención y prácticas operativas. Los detalles están en LEGAL-REVIEW.md. No se afirma cumplimiento jurídico integral ni se han publicado cambios en el dominio real.


## Ajustes de galeria, catalogo y sonido
- Galeria con marco compartido, miniaturas ampliadas y ficha lateral; controles adaptados a movil sin desbordamiento.
- Catalogo con fotografias mas grandes, encabezados mas claros y menos iconos repetidos.
- WhatsApp y volver arriba: 52px en escritorio, 48px en movil.
- Retirado control flotante de sonido. Autoplay se intenta una vez y su bloqueo no retrasa la entrada. Opciones explicitas solo durante la carga.
- Nueva firma sonora de dos segundos generada con ElevenLabs, servida localmente como catapultapayment-signature.mp3.
- Validacion: 16 pruebas correctas, galeria y ampliacion verificadas en movil; catalogo Clover con tres imagenes cargadas en escritorio.
