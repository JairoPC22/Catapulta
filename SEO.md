# Publicación e indexación de CatapultaPayment

## Configuración incluida

- Dominio canónico: `https://catapultapay.com/`, tomado de la configuración existente.
- `robots.txt`: acceso al contenido público para buscadores y rastreadores de búsqueda de IA. Conserva la política general de acceso que ya existía.
- `sitemap.xml`: contiene únicamente la página principal canónica. Las secciones con anclas no son páginas independientes; los errores y plantillas no deben aparecer aquí.
- `llms.txt`: resumen opcional de servicios, enlaces y contactos. Es una propuesta complementaria, no un requisito de Google ni una garantía de citas por IA.
- Datos estructurados en el HTML inicial: Organization, WebSite, WebPage, Service y FAQPage. Sin reseñas, puntuaciones o precios inventados.
- Páginas de recuperación y plantilla de correo con `noindex`. Deben seguir accesibles para que los rastreadores lean esa directiva.
- El contenido principal, catálogo y preguntas frecuentes están presentes en el HTML; no dependen de una llamada de API para ser leídos.
- ES/EN comparte una sola URL con traducción en JavaScript. No se declara `hreflang` a rutas inexistentes. Para indexar ambas versiones de forma independiente, publicar primero URLs estables por idioma con su contenido correspondiente.

## Revisión del 28 de octubre de 2026

Auditoría técnica para maximizar la puntuación de SEO (Lighthouse) y la accesibilidad a rastreadores de IA:

- Verificado: un solo `<h1>`, los 20 `<img>` tienen `alt` y `width`/`height` explícitos (evita CLS), enlaces sin `href="#"` ni `javascript:`, el JSON-LD es sintácticamente válido, todos los archivos referenciados en `<head>` (favicons, `og-cover.jpg`, manifest, fuente) existen.
- `robots.txt`: se agregaron reglas `Disallow` para rutas que no deben rastrearse si llegan a publicarse (`/tests/`, `/tools/`, `/content/`, `/.claude/`, `/.impeccable/`, archivos `.md`/`.cjs`) y se listó explícitamente a los rastreadores de IA más conocidos (GPTBot, ClaudeBot, ChatGPT-User, Google-Extended, Applebot-Extended, CCBot, Amazonbot) para que la política de acceso quede clara y no dependa solo del comodín `*`.
- Corregida una inconsistencia real de contenido: la respuesta de FAQ sobre software de punto de venta (visible, su traducción en inglés y el `FAQPage` de datos estructurados) decía "OnTheFly, Octopos, Clover, Dejapay y Kwick POS". Se actualizó a la lista confirmada por el responsable del negocio: **Kwick POS, OnTheFly, OrderPin y Octopos POS**. Esto importa para SEO porque Google y los asistentes de IA citan directamente el texto del `FAQPage`; un dato incorrecto ahí se repite en las respuestas.
- `llms.txt` ahora también menciona las plataformas de software, no solo el hardware.
- `sitemap.xml`: `lastmod` actualizado a la fecha de este cambio sustancial.
- No se tocó: el título (69 caracteres) y la descripción (154 caracteres) están dentro de rangos aceptables; no se inventaron reseñas, calificaciones, precios ni un domicilio físico, siguiendo la política ya establecida en este documento.

**Lo que el código no puede resolver por sí solo** (afecta directamente si el sitio aparece "entre los primeros" en Google, que depende de más que el HTML):

- Verificación real en Google Search Console y Bing Webmaster Tools (requiere acceso a la cuenta/DNS del dominio).
- Enlaces entrantes (backlinks) de otros sitios, directorios de negocios y redes sociales — es la señal de ranking más pesada fuera del contenido.
- Antigüedad del dominio y volumen de tráfico/autoridad, que se gana con el tiempo.
- Reseñas reales en Google Business Profile si aplica a la operación.
- Publicar el sitio real en producción: todo lo de esta sección es inútil mientras el sitio no esté en `https://catapultapay.com/` con los pasos de "Al publicar" completados.

## Al publicar

1. Subir los archivos al dominio real, incluyendo robots.txt, sitemap.xml y llms.txt en la raíz. La vista previa en localhost no es indexable desde internet.
2. Confirmar HTTPS y que www/HTTP redirijan al dominio canónico con un único salto permanente (301 o 308). Esto se configura en el proveedor de hosting/DNS, no en el HTML.
3. Subir también `.htaccess` (raíz del sitio). Configura `ErrorDocument 404 /404.html` para que el hosting sirva esa página conservando el estado HTTP 404 en vez de redirigir todas las rutas desconocidas al inicio con estado 200; el servidor local `preview-server.cjs` ya sirve el estado correcto. Confirmar tras publicar que IONOS respeta `.htaccess` (Apache) y no lo sobrescribe el panel.
4. Comprobar que el hosting sirva robots.txt y llms.txt como `text/plain; charset=utf-8` y sitemap.xml como `application/xml; charset=utf-8`. El servidor local incluye estos tipos; `.htaccess` los declara también para producción.
5. Confirmar que el firewall/CDN permita a los rastreadores verificados acceder al sitio; robots.txt por sí solo no elimina bloqueos del servidor. Verificar IPs oficiales antes de cambiar reglas.
6. En Google Search Console, verificar la propiedad del dominio con el registro DNS que proporcione Google. No se incluye un token inventado. Enviar `https://catapultapay.com/sitemap.xml`, inspeccionar la URL principal y solicitar indexación.
7. Registrar el sitio en Bing Webmaster Tools y enviar el mismo sitemap.
8. Validar el HTML publicado en Schema Markup Validator y en la prueba de resultados enriquecidos de Google. El marcado FAQ no implica elegibilidad para resultados FAQ de Google.
9. Actualizar `lastmod` solo cuando cambie de forma sustancial el contenido de la página, y mantener llms.txt sincronizado con los datos comerciales visibles.

## Comprobaciones posteriores

- Revisar cobertura, rastreo y consultas en Search Console y Bing Webmaster Tools.
- Revisar registros del hosting para detectar respuestas 403/429 a rastreadores legítimos.
- No enviar rutas de error, plantillas ni duplicados al sitemap.
- No añadir robots de búsqueda a reglas de bloqueo destinadas a otros usos.

## Referencias oficiales

- Google y funciones de IA: https://developers.google.com/search/docs/appearance/ai-features
- Google y robots.txt: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- OpenAI: https://developers.openai.com/api/docs/bots
- Perplexity: https://docs.perplexity.ai/docs/resources/perplexity-crawlers
- Propuesta llms.txt: https://llmstxt.org/
