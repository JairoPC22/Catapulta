# Revisión necesaria antes de publicar los avisos

Los documentos de `content/legal-content.json` generan privacy.html, terms.html y cookies.html con `node tools/build-legal.cjs`. Están marcados como borrador y noindex para evitar presentarlos como avisos jurídicos definitivos.

Verificado en https://catapultapay.com/ el 27 de octubre de 2026: denominación pública CATAPULTA PAYMENT SYSTEMS, dominio, correo info@catapultapay.com y teléfono +1 (310) 948-6153. El sitio consultado no publica un domicilio verificable.

Comparación con los términos publicados (28 de octubre de 2026, https://catapultapay.com/terminos.html): el sitio en vivo solo enlaza esa única página legal (sin privacidad ni cookies) con 5 cláusulas cortas. Las cláusulas de "Uso de la información", "Protección de datos" y "Limitación de responsabilidad" ya están cubiertas (y ampliadas) por terms.html/privacy.html. Faltaba la cláusula de "Exactitud de los datos" (el usuario responde por la veracidad de lo que envía y CatapultaPayment no responde por retrasos causados por datos incorrectos); se agregó como sección "Exactitud de la información que proporcionas" en content/legal-content.json y se regeneró terms.html.

Pendiente de decisión del responsable: el sitio en vivo usa la ruta /terminos.html y este repo genera /terms.html. Si no se configura una redirección de /terminos.html → /terms.html en el hosting al publicar, cualquier enlace o marcador guardado con el nombre en español dejará de funcionar (impacto SEO bajo porque la página tiene `noindex`, pero sí afecta a quien la tenga guardada).

Falta confirmar con el responsable:

- Razón social registrada completa, domicilio y país/estado de establecimiento.
- Si se emplean los contactos fuera de responder a la consulta, por ejemplo para campañas, CRM o transferencias a bancos.
- Jurisdicciones aplicables, requisitos específicos y procedimiento real para atender solicitudes de privacidad.
- Configuración de analítica/cookies añadida por el hosting, el CDN o herramientas fuera de este repositorio.
- Si otros procesos de alta de comercios necesitan avisos separados. Estos documentos describen el sitio y su formulario, no toda la operación de procesamiento de pagos.


Cuando los datos y prácticas estén confirmados, actualizar el contenido, retirar el bloque de revisión y el noindex de la plantilla de tools/build-legal.cjs, regenerar los HTML e incluir las URLs legales en sitemap.xml con su fecha real. No retirar el bloque ni declarar cumplimiento legal basándose únicamente en que el sitio funciona.

Referencias de revisión:

- Sitio público: https://catapultapay.com/
- Privacidad y exactitud de avisos: https://oag.ca.gov/node/36676
- Prácticas de privacidad: https://consumer.ftc.gov/consumer-alerts/2024/04/when-companies-share-your-personal-information-without-your-permission

## Arquitectura de correo actual (30 de octubre de 2026)
El formulario guarda solicitudes en una cola SQLite privada y un worker CLI entrega avisos internos y confirmaciones por SMTP de IONOS. Falta confirmar el buzon remitente, administradores, disponibilidad de PHP/PDO SQLite y cron incluidos en el contrato. No hay credenciales locales reales ni envio de produccion probado. Confirmar la retencion de la cola, logs, backups y correo antes de aprobar los avisos. Instrucciones: mail/SETUP.md.
