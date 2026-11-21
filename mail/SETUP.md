# Correo de CatapultaPayment con IONOS

No requiere una API de pago. El buzón y la tarea programada deben estar incluidos en el contrato existente; no contratar extras para esta implementación.

## Respaldo sin acceso al panel de IONOS (20/11/2026)

Si nadie tiene acceso al panel de IONOS para crear la tarea programada de `mail/worker.php`, el workflow `.github/workflows/mail-cron.yml` la reemplaza temporalmente: cada 5 minutos sube un token a `mail/cron-token.php` (generado al vuelo desde el secreto de GitHub `MAIL_CRON_TOKEN`, nunca guardado en git) y llama a `https://catapultapay.com/mail/cron.php?token=...`, que ejecuta exactamente el mismo código de `worker.php` (compartido ahora en `mail/processor.php`).

Para activarlo: en GitHub, este repositorio > Settings > Secrets and variables > Actions > New repository secret, nombre exacto `MAIL_CRON_TOKEN`, valor una cadena larga aleatoria (por ejemplo con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`). Reutiliza los mismos secretos `IONOS_FTP_*` que ya usa el despliegue normal.

Esto no sustituye una tarea cron real de IONOS: GitHub solo garantiza una granularidad mínima de 5 minutos para workflows programados, puede retrasar o saltarse ejecuciones bajo carga, y desactiva automáticamente los `schedule` si el repositorio pasa 60 días sin commits. En cuanto se recupere el acceso al panel de IONOS, configurar la tarea nativa (ver más abajo) y entonces se puede borrar `.github/workflows/mail-cron.yml` y `mail/cron.php` sin afectar nada más.

## Relay de Gmail mientras el SPF de IONOS no autoriza su propio servidor (21/11/2026)

Confirmado end-to-end: una solicitud procesada por el mismo código y el mismo intento SMTP exitoso llega a una dirección del propio dominio (jairo.pena@catapultapay.com) pero no a una externa (Gmail) — ver sección de destinatarios más abajo. La causa es el SPF del dominio, que solo autoriza a Google y no a IONOS; corregirlo requiere el panel de DNS, al que tampoco hay acceso ahorita.

Como respaldo que no toca DNS ni el panel de IONOS en absoluto, `mail/processor.php` expone `cp_smtp_config()`: si existe `mail/smtp-override.php` (no está en git), sus valores reemplazan solo los campos `smtp_*` antes de instanciar `SmtpMailer`, dejando intactos `from_email` (sigue mostrando notificaciones@catapultapay.com) y `admin_recipients`. `mail/worker.php` y `mail/cron.php` ya lo usan.

Para activarlo, se necesita una cuenta de Gmail que el responsable del sitio controle:

1. En esa cuenta, Gmail > Configuración (engranaje) > Ver toda la configuración > pestaña "Cuentas e importación" > "Enviar correo como" > Agregar otra dirección de correo. Nombre: "CatapultaPayment"; correo: notificaciones@catapultapay.com. Siguiente paso > Enviar verificación.
2. Gmail manda un correo de verificación a notificaciones@catapultapay.com. Entrar al webmail de IONOS de ese buzón (acceso ya confirmado) y abrir el enlace o copiar el código de confirmación de vuelta en el diálogo de Gmail.
3. En esa misma cuenta de Gmail: Cuenta de Google > Seguridad > activar Verificación en dos pasos si no está activa > Contraseñas de aplicaciones > generar una para "Correo"/"Otra". Son 16 caracteres; se puede revocar cuando se quiera sin afectar la cuenta.
4. En GitHub, este repositorio > Settings > Secrets and variables > Actions > New repository secret, dos secretos: `GMAIL_SMTP_USER` (la dirección de Gmail completa) y `GMAIL_SMTP_PASSWORD` (la contraseña de aplicación de 16 caracteres, sin espacios). Nunca escribir esto en el chat de ningún asistente ni en ningún archivo del repositorio.
5. El workflow `mail-cron.yml` sube `mail/smtp-override.php` en cada ejecución (cada 5 minutos o manual, igual que el token de cron) con esos dos valores y host/puerto/seguridad fijos para Gmail (`smtp.gmail.com:465` SSL). Si cualquiera de los dos secretos falta, ese paso no sube nada y el envío sigue usando IONOS como antes.

Para volver a usar IONOS una vez corregido el SPF: borrar los dos secretos de GitHub (`GMAIL_SMTP_USER`/`GMAIL_SMTP_PASSWORD`). La siguiente corrida del workflow detecta que faltan y borra `mail/smtp-override.php` del servidor automáticamente (no hace falta FTP ni panel), así que el envío vuelve a usar IONOS sin ningún otro paso.

## Buzón

1. En IONOS, Correo > Crear dirección > Mail Basic, usar Crear si existe un buzón disponible. Si aparece precio o Pedir/Solicitar, detenerse antes de contratar.
2. Crear notificaciones@catapultapay.com (nombre propuesto), con contraseña única. Un reenvío solo recibe; no sustituye el buzón remitente SMTP.
3. Entrar al webmail y comprobar manualmente envío y recepción. Datos confirmados en el panel IONOS México: smtp.ionos.mx, puerto 587, STARTTLS y autenticación requerida. Usuario y remitente: notificaciones@catapultapay.com. La contraseña es la del buzón, no la de acceso al panel IONOS. No cambiar los MX de un correo existente sin revisar su proveedor.
4. Los destinatarios de administradores pueden ser cuentas existentes, incluso de otro proveedor; no hace falta comprar un buzón por administrador.

## Activación técnica (pendiente de datos reales)

- Requiere PHP 8.1+ con PDO SQLite y TLS, y una tarea CLI programada incluida en el alojamiento. La vista previa Node solo muestra la web: no envía correo ni ejecuta PHP.
- Crear una carpeta privada fuera del directorio publicado (por ejemplo, hermana de /catapultaPay), permisos 0700. El código rechaza almacenamiento dentro del proyecto publicado.
- Copiar config.sample.php a config.php SOLO en el servidor, completar storage_dir con su ruta absoluta, storage_secret aleatorio de al menos 32 caracteres, datos SMTP, remitente y lista admin_recipients. No compartir ni subir contraseñas a Git.
- Generar secreto: `php -r "echo bin2hex(random_bytes(32));"`.
- Programar cada minuto, con la ruta PHP de IONOS: `/ruta/php /ruta/absoluta/catapultaPay/mail/worker.php`. Confirmar que cron está disponible sin costo adicional y revisar sus errores.
- Probar un formulario controlado una vez y comprobar que ambos mensajes llegan. Confirmar SPF/DKIM con las instrucciones de IONOS y revisar spam. No se han enviado correos reales durante el desarrollo.

## Recepción y duplicados

El formulario devuelve 202 después de guardar duraderamente la solicitud. Esto significa recibida, no entregada por SMTP. El worker envía primero el aviso interno y luego la confirmación del cliente. Los destinatarios internos se administran mediante mail/recipients.php; las credenciales permanecen en config.php privado.

La misma solicitud normalizada no crea otra entrega mientras exista su registro. Los workers reclaman cada entrega de forma atómica. Los fallos temporales seguros (conexión antes de DATA o rechazo SMTP explícito 4xx) se reintentan hasta tres intentos totales, con esperas de uno y cinco minutos. Cada entrega tiene su propio contador: reintentar la confirmación nunca reenvía el aviso interno ya aceptado. Los rechazos permanentes y las desconexiones inciertas después de DATA pasan a review sin reintento automático: SMTP no permite garantizar exactamente una entrega cuando se pierde esa confirmación. Los fallos históricos no se reclasifican ni reenvían al actualizar. Un worker interrumpido puede dejar sending; también requiere revisión. Verificar el buzón y los registros de IONOS antes de devolver manualmente un estado a pending. No borrar la cola para solucionar errores: eso elimina la deduplicación.

Límites: 32 KiB por petición, campos con longitud y tipo validado, 5 solicitudes nuevas/IP/15 min, 3/correo/hora, 100 globales/hora y 10.000 registros de cola. El honeypot simula recepción sin guardar. Se comprueba Origin cuando existe; no sustituye los límites ni demuestra identidad del remitente. No se confía en X-Forwarded-For. Los límites de aplicación no sustituyen la protección del hosting ante ataques de gran volumen. El correo automático confirma una solicitud; no verifica que el visitante sea dueño de esa dirección.

## Operación y privacidad

Revisar cron y los estados review/sending regularmente. El servidor registra identificador y fase, sin mensaje ni credenciales. Los registros completados de más de siete días se limpian cuando llega otra solicitud. Los pendientes/fallidos requieren atención y eliminación documentada por el responsable. La cola contiene datos personales en texto; proteger carpeta, backups y acceso administrativo. Confirmar la política empresarial de retención de correo y copias antes de publicar los avisos definitivos.

## Pruebas sin enviar correos

`node --test tests/*.cjs`

`php -d extension=pdo_sqlite tests/contact.php` (si SQLite no está ya habilitado).

Las pruebas PHP usan SQLite en memoria y un remitente simulado: validación, deduplicación, límites por IP/correo, avisos internos, confirmación y fallos inciertos. Ninguna utiliza credenciales reales.

## Sonido

Se intenta en cada carga de inicio. Si autoplay se bloquea, hay un único intento con una interacción real dentro de diez segundos. Escape o esconder la pestaña cancela el sonido. No se garantiza audio sin interacción porque depende del navegador; no hay botón flotante ni reproducción tardía al volver a una sección.

## Destinatarios administrados desde GitHub
La lista activa esta en mail/recipients.php. send.php, worker.php y cron.php la cargan despues del config.php privado; por tanto cualquier lista antigua de ese config no se utiliza. Cambiar destinatarios requiere actualizar recipients.php y desplegar. La contraseña, storage_dir y storage_secret siguen solo en config.php de IONOS. Administrador confirmado: jairo.pena@catapultapay.com (revertido 21/11/2026: barthallen25@gmail.com y jairoparker22@gmail.com, probados el 20/11/2026, no llegaban porque el SPF del dominio solo autoriza a Google, no a IONOS — ver sección de respaldo de cron más arriba. Entrega a direcciones del mismo dominio/Workspace sí funciona; volver a poner direcciones externas solo después de corregir el SPF).

Prueba confirmatoria 21/11/2026: dos solicitudes enviadas en paralelo por la misma vía (mismo job, mismo intento SMTP exitoso según cron-status.php) — la que fue a jairo.pena@catapultapay.com llegó; la de confirmación al cliente, a barthallen25@gmail.com, no llegó. Diagnóstico de SPF confirmado end-to-end, no es solo teoría de cabeceras DNS.

## Plantillas y entregabilidad (30/10/2026)
Administrador y cliente reciben plantillas distintas, con referencia compartida. El logo se adjunta como PNG inline con Content-ID, sin imagen data: base64 dentro del HTML. El mensaje tiene versiones texto/HTML, contenido quoted-printable con lineas acotadas, Message-ID y asuntos UTF-8 plegados. El aspecto final puede variar por cliente de correo y sus opciones de imagenes.

Diagnostico desde SSH: ejecutar `/usr/bin/php8.4-cli mail/status.php` desde la raiz del sitio. Muestra solo estados y referencias. sent significa aceptado por SMTP, no confirma llegada a bandeja. Los nuevos registros de worker.log muestran accepted o review y fase/codigo SMTP sin texto de mensajes ni direcciones. No reencolar solicitudes completadas para probar el diseño: enviar una nueva prueba identificable.

Revision DNS publica: el SPF observado solo autoriza include:_spf.google.com. Para incluir el envio por IONOS Mexico se debe ampliar ese registro, conservando Google: `v=spf1 include:_spf.google.com include:_spf-us.ionos.com ~all`. No crear dos registros SPF ni cambiar MX. Antes de guardar, revisar los valores actuales en IONOS y preservar cualquier emisor adicional autorizado. La ayuda oficial permite Añadir registro > IONOS SPF (TXT), que debe completar el registro existente. Verificar SPF/DKIM en las cabeceras del correo recibido. Esto no garantiza entrega universal ni reemplaza comprobar la bandeja y spam. Referencia: https://www.ionos.mx/ayuda/dominios/configurar-un-servidor-de-email-y-registros-relativos/ionos-spf-para-que-tus-e-mails-lleguen-a-su-destino/
