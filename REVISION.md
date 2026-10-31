# Revisión de CatapultaPayment — 27 de octubre de 2026

## Qué se revisó

HTML, CSS, JavaScript propio, idiomas, formulario y plantilla de correo, simulador, calculadora, galería, recuperación de errores, service worker, manifiesto, metadatos y archivos de descubrimiento. También se comprobaron las referencias a imágenes, fuentes, scripts y documentos locales. El paquete Lucide original se conserva como fuente del generador, sin descargarse durante la visita.

## Correcciones principales

- Pestañas de catálogo y soluciones: una lógica compartida, sin temporizadores que reactiven paneles anteriores. Selección ARIA y navegación con flechas, Home y End.
- Idiomas: actualización síncrona, sin transiciones pendientes que mezclen textos. Preferencias protegidas frente a almacenamiento bloqueado. Cambiar idioma ya no convierte un aviso de error activo en un mensaje de éxito.
- Formulario: inicialización inmediata, exclusión de envíos simultáneos, límites de longitud, validación de espacios/correo, errores accesibles, campos deshabilitados mientras se envía y conservación del texto cuando falla el envío. POST y botón deshabilitado hasta inicialización para evitar una entrega accidental por URL si falla JavaScript.
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
6. **Medición de conversiones:** definir qué se desea medir antes de instalar analítica y revisar el aviso/consentimiento correspondiente antes de activarla.

## Firma sonora y carga


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

## Actualizacion 30 de octubre de 2026
Correo: cola privada SQLite, avisos SMTP de IONOS por worker CLI y confirmacion de recepcion independiente del tiempo de SMTP. Validacion de campos y limites por IP, correo y globales. Deduplicacion persistente y reclamacion atomica por entrega. Fallos inciertos requieren revision manual. Configuracion real de buzon/destinatarios y cron pendiente; instrucciones en mail/SETUP.md. Pruebas nuevas con remitente simulado y HTTP PHP local sin correos reales.
Sonido: intento en cada carga y una unica oportunidad temprana por interaccion real si autoplay fue bloqueado; no se conserva una preferencia de sonido antigua.

Validacion de esta actualizacion: 30 pruebas Node/HTTP PHP y 22 comprobaciones PHP correctas. PHP oficial portatil usado solo para pruebas locales; no se instalaron servicios ni se enviaron correos. Retiradas las referencias a la integracion anterior y controles de sonido inexistentes. Confirmacion automatica sin repetir el texto libre del visitante para reducir uso abusivo como correo reflejado.

## Correos transaccionales: diseño y logo
Se rediseñaron por separado el aviso administrativo y la confirmacion al cliente. Cabecera compacta y logo original, referencia, campos apilados en movil, mensaje exclusivo del administrador y siguientes pasos para el cliente. El logo viaja como adjunto PNG inline CID, sin imagen data: en el HTML. MIME multipart/related y alternative, texto plano, quoted-printable, Message-ID y plegado UTF-8 de asuntos. Pruebas validan destinatarios, cuerpos distintos, ausencia de datos libres en confirmacion, PNG identico al original y limites SMTP.
Registro de worker sin datos personales: fase y codigo SMTP en errores, aceptacion por entrega. status.php muestra referencias y estados solo por consola.
SPF publico observado: solo Google; pendiente ampliar autorizacion para IONOS desde DNS preservando emisores actuales. No se modificaron DNS ni se reenviaron solicitudes ya entregadas. Comprobacion real pendiente con nueva solicitud y cabeceras del correo recibido.

## Notificacion del formulario
Aviso compacto con titulo y descripcion separados, contraste por tema, icono contenido y cierre de 44px. Se ubica bajo la navegacion para no cubrir WhatsApp/volver arriba. Pausa el cierre automatico al enfocar o pasar el puntero; cierre manual/Escape devuelve foco al boton de envio. Respeta movimiento reducido. Verificado con formulario local y respuesta simulada (sin correos reales), exito, error de validacion y cierre por boton en movil. Cache de recursos actualizada a v53.

## Refinamiento corporativo de correos
Se retiraron flechas Unicode de los botones porque algunos clientes las muestran como emoji. Encabezados directos, sin frases promocionales, CTA de texto y pie simplificado. Separadores unicos en campos moviles y estilos explicitos para modo oscuro; logo con soporte claro para conservar legibilidad. Comprobado en vista movil de 375px sin desbordamiento. El render final depende del cliente de correo; se conservaron adjunto CID y flujo de envio.

## Recuperacion de fallos temporales de correo
Cola con metadatos independientes de intentos, proxima ejecucion y error por cada entrega. Migracion automatica y serializada de SQLite, conservando estados historicos. Hasta tres intentos totales solo en fallos seguros previos a DATA o rechazo temporal explicito 4xx. Esperas de 60 y 300 segundos. Sin reenvio del aviso administrativo ya aceptado; sin repeticion automatica en perdida de confirmacion DATA, errores permanentes o fallos historicos no clasificados. Diagnosticos CLI muestran contadores y fase/codigo sin datos del contacto.
El SPF publico sigue autorizando unicamente a Google; el ajuste de autenticacion IONOS requiere acceso DNS y no puede publicarse mediante GitHub. No se afirmo entrega de la ultima solicitud ni se accedio a la cola remota durante este cambio.

## Auditoria de velocidad (30 de octubre de 2026)

Revisado antes de este cambio: el frontend ya cargaba de forma diferida el visor 3D (~935 KB tras `load`/idle), el video del hero (IntersectionObserver), usaba iconos propios de 15 KB en vez del paquete Lucide de 358 KB, fuente variable con `font-display: swap` y solo el `woff2` critico precargado. Eso no se toco porque ya estaba bien resuelto.

- Agregado `.htaccess` (no existia): compresion de texto (`mod_deflate`/`mod_brotli`), cabeceras de cache para CSS/JS versionados (`?v=53`, un año) e imagenes/fuentes/video sin version (un mes), tipos de contenido con charset explicito, y `ErrorDocument 404 /404.html` para que el hosting conserve el estado 404 real (pendiente de SEO.md). Es aditivo: no fuerza HTTPS ni redirecciones de dominio, eso sigue en el panel de IONOS.
- No se modificaron imagenes ni scripts: no hay en este entorno una herramienta de conversion de imagenes confiable (cwebp/ImageMagick/sharp) para tocar binarios sin riesgo de danar la transparencia o la calidad.

### Pendiente de mayor impacto (requiere herramienta de imagen, no disponible aqui)

- `assets/images/catalog/*.png`: 16 archivos PNG sin perdida a 700x700 o 300x300, 2.9 MB en total (hasta 280 KB cada uno). Convertir a WebP con transparencia conservando dimension y manteniendo el PNG como respaldo suele reducir 60-80% el peso sin perdida visible. Sugerido: `cwebp -q 90 archivo.png -o archivo.webp` y luego actualizar las referencias en `index.html`.
- `imagecata.png`: 800x423 px y 145 KB, pero se muestra en pantalla a 98x52 (header, con `preload` de alta prioridad) y 64x34 (footer). Un recorte a ~200x106 (2x retina) bajaria ese archivo muy por debajo de 20 KB para el sitio. Mantener el original de 800x423 solo para el logo inline del correo (`mail/smtp-mailer.php` lo reutiliza), con un archivo aparte y mas liviano para `index.html`.
- Confirmar al publicar que IONOS realmente aplica `.htaccess` (algunos paneles compartidos ya activan compresion/cache a nivel de servidor y la duplican o la ignoran sin avisar).

## Diagnostico de entrega de correo (30 de octubre de 2026)

Reporte real: el aviso interno llego a jairo.pena@catapultapay.com, pero la confirmacion al cliente (Gmail) no llego, y el mensaje recibido muestra avatar "?" con aviso de posible phishing. Confirmado por consulta DNS publica en vivo el mismo dia:

- SPF: `v=spf1 include:_spf.google.com ~all` — no autoriza a IONOS, que es quien realmente envia (`smtp.ionos.mx`). Coincide con lo ya anotado en la seccion "Recuperacion de fallos temporales de correo".
- DMARC: no existe registro `_dmarc.catapultapay.com`.
- DKIM: no se encontro firma en los selectores `default`, `google`, `mail`, `ionos`.

Diagnostico: sin SPF/DKIM validos para IONOS, Gmail no puede verificar al remitente — de ahi el avatar generico y la advertencia. El aviso interno probablemente llego por ser trafico dentro del mismo dominio/Workspace, mientras que el externo (cliente) cae a spam o se descarta. Esto es un cambio de DNS, no de codigo; no se modifico ningun registro desde aqui ni se tiene acceso a el. Pendiente que quien administra el DNS agregue `include:_spf-us.ionos.com` al SPF, active DKIM para notificaciones@catapultapay.com desde el panel de IONOS y, opcionalmente, publique un DMARC en modo monitoreo (`p=none`) antes de exigir cumplimiento.

## Auditoria de responsividad / overflow horizontal (31 de octubre de 2026)

Pedido: confirmar que el sitio no se mueve horizontalmente en celular ni en ningun otro tamano, y que todo quede bien posicionado. Metodo: en vez de confiar solo en capturas de pantalla, se midio `document.documentElement.scrollWidth` contra el ancho real del viewport en cada punto de scroll (cada 400-500px) de principio a fin de la pagina, en index.html y en catalogo.html, privacy.html, terms.html, cookies.html y 404.html.

Anchos probados: 320, 330, 360, 375, 390, 414, 768, 1024, 1280 y 1920px, mas 667x375 en horizontal (landscape). Tambien se probo con el menu movil abierto, el idioma en ingles (textos mas largos), la galeria ampliada, el FAQ abierto, el selector personalizado abierto, y forzando a la vez las 4 animaciones de aparicion lateral (`.reveal-left`/`.reveal-right`, que desplazan el elemento 40px antes de aparecer) a su estado previo a la animacion, el peor caso posible.

Resultado: cero overflow horizontal real en cualquiera de esos anchos o estados. El unico numero raro encontrado fue a exactamente 320px, donde la propia herramienta de navegador usada para probar reporta un piso minimo de ~330px (`window.innerWidth` no coincide con el ancho pedido); no es una condicion alcanzable por una persona real porque no existe control de usuario para fijar el viewport en un numero exacto de pixeles, y el telefono mas angosto vigente hoy (iPhone SE) ya mide 375px. No se modifico codigo porque no se encontro nada que corregir; se deja documentado el metodo de prueba por si se agregan secciones nuevas.
